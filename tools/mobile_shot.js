/* 手机视口截图工具（CDP 模拟真实 390/x 视口，绕开 Chrome 最小窗口宽度限制）
 * 用法：node tools/mobile_shot.js <url> <out.png> [width] [height]
 */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = process.argv[2];
const out = process.argv[3];
const width = Number(process.argv[4] || 390);
const height = Number(process.argv[5] || 844);
const clickSel = process.argv[6] || '';
if (!url || !out) { console.error('usage: node tools/mobile_shot.js <url> <out.png> [w] [h]'); process.exit(2); }

const userDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mlmob-'));
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-breakpad', '--disable-crash-reporter',
  '--remote-debugging-port=0', '--user-data-dir=' + userDir, 'about:blank'
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
function getJSON(port, p) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: port, path: p }, res => {
      let b = ''; res.on('data', d => b += d); res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

(async () => {
  // 等 DevToolsActivePort
  const portFile = path.join(userDir, 'DevToolsActivePort');
  let port = 0;
  for (let i = 0; i < 100 && !port; i++) {
    await sleep(100);
    try {
      const line = fs.readFileSync(portFile, 'utf8').split('\n')[0].trim();
      port = Number(line) || 0;
    } catch (e) {}
  }
  if (!port) throw new Error('no devtools port');

  const list = await getJSON(port, '/json/list');
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let id = 0; const pending = new Map();
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
  };
  const send = (method, params) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params: params || {} })); });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url });
  await sleep(3500);

  const overflow = await send('Runtime.evaluate', {
    expression: `(function(){var vw=document.documentElement.clientWidth,bad=[];document.querySelectorAll('body *').forEach(function(el){var r=el.getBoundingClientRect();if(r.width>0&&r.right>vw+1){var c=(typeof el.className==='string'?el.className:'').split(' ').filter(Boolean)[0]||'';bad.push(el.tagName.toLowerCase()+(c?'.'+c:'')+(el.id?'#'+el.id:'')+' w='+Math.round(r.width)+' r='+Math.round(r.right));}});return JSON.stringify({vw:vw,sw:document.documentElement.scrollWidth,bad:bad.slice(0,15)});})()`,
    returnByValue: true
  });
  console.log('VIEWPORT/OVERFLOW:', overflow.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('saved:', out);

  if (clickSel) {
    await send('Runtime.evaluate', { expression: `(function(){var el=document.querySelector(${JSON.stringify(clickSel)}); if(el){el.click(); return 'clicked';} return 'not found';})()`, returnByValue: true });
    await sleep(900);
    const shot2 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const out2 = out.replace(/\.png$/i, '-click.png');
    fs.writeFileSync(out2, Buffer.from(shot2.data, 'base64'));
    console.log('saved:', out2);
  }

  ws.close(); chrome.kill();
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); try { chrome.kill(); } catch (x) {} process.exit(1); });
