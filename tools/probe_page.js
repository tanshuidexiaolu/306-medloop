/* 在指定页面（按 URL 子串匹配）执行 JS 文件中的表达式，输出结果
 * 用法：node tools/probe_page.js <url子串> <expr文件>
 */
const http = require('http');
const fs = require('fs');

const PORT = 9222;

function getJSON(p) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: PORT, path: p }, res => {
      let b = ''; res.on('data', d => b += d);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

(async () => {
  const [substr, file] = process.argv.slice(2);
  if (!substr || !file) { console.error('usage: node tools/probe_page.js <url-substr> <expr-file>'); process.exit(2); }
  const targets = (await getJSON('/json/list')).filter(t => t.type === 'page');
  const page = targets.find(t => t.url.indexOf(substr) >= 0);
  if (!page) { console.error('page not found; have:', targets.map(t => t.url.slice(0, 80))); process.exit(1); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
  };
  const send = (method, params) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  const expr = fs.readFileSync(file, 'utf8');
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, userGesture: true });
  if (r.exceptionDetails) console.error('ERR', JSON.stringify(r.exceptionDetails).slice(0, 500));
  else console.log(typeof r.result.value === 'string' ? r.result.value : JSON.stringify(r.result.value, null, 1));
  ws.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
