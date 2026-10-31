/* 通过 CDP 控制已开启远程调试的 Chrome（默认 127.0.0.1:9222）
 * 用法：
 *   node tools/cdp.js tabs                 列出标签页
 *   node tools/cdp.js goto <url> [tab]     打开网址
 *   node tools/cdp.js eval "<js表达式>" [tab]  在页面执行 JS，输出 JSON 结果
 *   node tools/cdp.js text [tab]           输出页面可见文本
 *   node tools/cdp.js shot <out.png> [tab] 截图
 *   node tools/cdp.js click "<css选择器>" [tab]  点击元素
 * 说明：Node 22+ 自带 WebSocket；只连本机 9222，不访问外网。
 */
const http = require('http');
const fs = require('fs');

const PORT = Number(process.env.CDP_PORT || 9222);
const HOST = '127.0.0.1';

function getJSON(p) {
  return new Promise((resolve, reject) => {
    http.get({ host: HOST, port: PORT, path: p }, res => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(new Error('bad json: ' + b.slice(0, 200))); } });
    }).on('error', reject);
  });
}

function postJSON(p) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: HOST, port: PORT, path: p, method: 'PUT' }, res => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(new Error('bad json: ' + b.slice(0, 200))); } });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd) { console.log('usage: node tools/cdp.js <tabs|goto|eval|text|shot|click|newtab> ...'); process.exit(2); }

  if (cmd === 'newtab') {
    const t = await postJSON('/json/new?' + encodeURIComponent(rest[0] || 'about:blank'));
    console.log(JSON.stringify({ id: t.id, url: t.url, ws: t.webSocketDebuggerUrl }, null, 1));
    return;
  }

  const list = await getJSON('/json/list');
  const pages = list.filter(t => t.type === 'page');
  if (!pages.length) { console.error('没有可用的标签页'); process.exit(1); }
  const wanted = process.env.CDP_PAGE || '';
  const matched = wanted ? pages.filter(p => p.url.indexOf(wanted) >= 0) : [];
  const tabArg = rest.find(a => /^\d+$/.test(a) && (cmd === 'eval' ? rest.indexOf(a) > 1 : rest.indexOf(a) > 0));
  const tab = matched.length ? matched[0] : (tabArg !== undefined ? pages[Number(tabArg)] || pages[0] : pages[0]);
  console.error('TARGET:', tab.url.slice(0, 120));

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const events = [];
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
    else if (m.method) events.push(m);
  };
  const send = (method, params) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function flattenFrames(node, out) {
    out = out || [];
    out.push({ frameId: node.frame.id, url: (node.frame.url || '') + (node.frame.urlFragment || ''), name: node.frame.name || '' });
    (node.childFrames || []).forEach(ch => flattenFrames(ch, out));
    return out;
  }
  async function frameEval(urlPart, expr) {
    await send('Page.enable');
    await send('Runtime.enable');
    await sleep(700);
    const tree = await send('Page.getFrameTree');
    const frames = flattenFrames(tree.frameTree);
    const f = frames.find(x => x.url.indexOf(urlPart) >= 0);
    if (!f) throw new Error('frame not found: ' + urlPart + ' | have: ' + frames.map(x => x.url).join(' ; '));
    const ctxs = events.filter(e => e.method === 'Runtime.executionContextCreated').map(e => e.params.context);
    let ctx = ctxs.find(c => c.auxData && c.auxData.frameId === f.frameId);
    if (!ctx) {
      const w = await send('Page.createIsolatedWorld', { frameId: f.frameId, worldName: 'scrape' });
      ctx = { id: w.executionContextId };
    }
    const r = await send('Runtime.evaluate', { expression: expr, contextId: ctx.id, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('eval error: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result.value;
  }

  try {
    await send('Runtime.enable');
    if (cmd === 'tabs') {
      console.log(JSON.stringify(pages.map((p, i) => ({ i, title: p.title, url: p.url })), null, 1));
    } else if (cmd === 'frames') {
      await send('Page.enable');
      const tree = await send('Page.getFrameTree');
      console.log(JSON.stringify(flattenFrames(tree.frameTree), null, 1));
    } else if (cmd === 'evalframe') {
      const v = await frameEval(rest[0], rest[1]);
      console.log(JSON.stringify(v, null, 1));
    } else if (cmd === 'goto') {
      await send('Page.enable');
      await send('Page.navigate', { url: rest[0] });
      await new Promise(r => setTimeout(r, 2500));
      const t = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
      console.log('opened:', rest[0], '| title:', t.result.value);
    } else if (cmd === 'eval') {
      const expr = cmd === 'eval' ? rest[0] : '';
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      console.log(JSON.stringify(r.result.value !== undefined ? r.result.value : r, null, 1));
    } else if (cmd === 'text') {
      const r = await send('Runtime.evaluate', { expression: 'document.body ? document.body.innerText : ""', returnByValue: true });
      console.log(r.result.value);
    } else if (cmd === 'click') {
      const r = await send('Runtime.evaluate', { expression: `(function(){var el=document.querySelector(${JSON.stringify(rest[0])}); if(!el) return 'not found'; el.click(); return 'clicked';})()`, returnByValue: true });
      console.log(r.result.value);
    } else if (cmd === 'shot') {
      const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync(rest[0], Buffer.from(r.data, 'base64'));
      console.log('saved:', rest[0]);
    } else {
      console.error('unknown command:', cmd);
    }
  } finally {
    ws.close();
  }
}

main().catch(e => { console.error('ERR', e.message); process.exit(1); });
