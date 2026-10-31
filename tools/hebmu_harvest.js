/* 河北医大练习平台：未开始试卷 → 开始测试 → 空白交卷 → 抓答题页（含答案）
 * 用法：node tools/hebmu_harvest.js [eid1 eid2 ...]
 * 不传 eid 时自动从「未开始的测试」列表读取全部。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.CDP_PORT || 9222);
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'hebmu');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function getJSON(p) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: PORT, path: p }, res => {
      let b = ''; res.on('data', d => b += d);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}
async function closeTarget(id) {
  return new Promise(r => { http.get({ host: '127.0.0.1', port: PORT, path: '/json/close/' + id }, () => r()); });
}

async function attach(target) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
  };
  const send = (method, params) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  await send('Runtime.enable');
  const evalExpr = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, userGesture: true });
    if (r.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result.value;
  };
  return { send, evalExpr, close: () => ws.close(), id: target.id };
}

async function findTarget(substr, tries = 20, wait = 500) {
  for (let i = 0; i < tries; i++) {
    const list = (await getJSON('/json/list')).filter(t => t.type === 'page');
    const t = list.find(x => x.url.indexOf(substr) >= 0);
    if (t) return t;
    await sleep(wait);
  }
  return null;
}

/* 在 app 页面某个 iframe 里执行 JS（主世界优先） */
async function makeAppEval() {
  const list = (await getJSON('/json/list')).filter(t => t.type === 'page');
  const app = list.find(t => t.url.indexOf('studentEnd/default') >= 0);
  if (!app) throw new Error('找不到练习平台主页面');
  const ws = new WebSocket(app.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const events = [];
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
    else if (m.method) events.push(m);
  };
  const send = (method, params) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  await send('Runtime.enable'); await send('Page.enable'); await sleep(600);
  function flat(node, out) {
    out = out || []; out.push({ frameId: node.frame.id, url: node.frame.url || '' });
    (node.childFrames || []).forEach(c => flat(c, out)); return out;
  }
  async function frameEval(urlPart, expr) {
    const tree = await send('Page.getFrameTree');
    const frames = flat(tree.frameTree);
    const f = frames.find(x => x.url.indexOf(urlPart) >= 0);
    if (!f) throw new Error('frame not found: ' + urlPart);
    const ctxs = events.filter(e => e.method === 'Runtime.executionContextCreated' && e.params.context.auxData && e.params.context.auxData.frameId === f.frameId)
      .map(e => e.params.context).sort((a, b) => b.id - a.id);
    for (const ctx of ctxs) {
      try {
        const r = await send('Runtime.evaluate', { expression: expr, contextId: ctx.id, returnByValue: true, awaitPromise: true, userGesture: true });
        if (r.exceptionDetails) throw new Error('eval');
        return r.result.value;
      } catch (e) { }
    }
    const w = await send('Page.createIsolatedWorld', { frameId: f.frameId, worldName: 'h-' + Date.now() });
    const r = await send('Runtime.evaluate', { expression: expr, contextId: w.executionContextId, returnByValue: true, awaitPromise: true, userGesture: true });
    if (r.exceptionDetails) throw new Error('eval err: ' + JSON.stringify(r.exceptionDetails).slice(0, 200));
    return r.result.value;
  }
  return { send, frameEval, close: () => ws.close() };
}

const PARSE_EXPR = fs.readFileSync(path.join(__dirname, 'parse_paper_expr.js'), 'utf8');

async function harvestOne(app, eid) {
  console.log('\n=== 试卷', eid, '===');
  await app.frameEval('notBeginningExamPaper', `beginTest(${eid}); 'go'`);
  const rules = await findTarget('studentTest/enter?eid=' + eid);
  if (!rules) throw new Error('rules page not found');
  let t = await attach(rules);
  await t.evalExpr("(function(){var b=document.getElementById('submit_btn'); if(!b) return 'no-btn'; b.click(); return 'ok';})()");
  t.close();

  const test = await findTarget('studentTest/beginTest');
  if (!test) throw new Error('test page not found');
  t = await attach(test);
  // 等题目加载
  for (let i = 0; i < 20; i++) { await sleep(500); const ok = await t.evalExpr("document.querySelectorAll('.questionDiv').length>0 ? 'ready' : 'wait'"); if (ok === 'ready') break; }
  console.log('  已进入答题页');
  await t.evalExpr("(function(){var b=document.querySelector('button[onclick*=handInPaper]'); if(!b) return 'no'; b.click(); return 'ok';})()");
  await sleep(1200);
  const confirmed = await t.evalExpr("(function(){var a=document.querySelector('#handInTip a[href*=handInPaper]'); if(!a) return 'no-confirm'; a.click(); return 'ok';})()");
  console.log('  交卷:', confirmed);
  for (let i = 0; i < 20; i++) {
    await sleep(700);
    try { const txt = await t.evalExpr("(document.body.innerText||'')"); if (txt.indexOf('考试结束') >= 0) break; } catch (e) { }
  }
  t.close();
  await closeTarget(test.id);

  // 抓答卷
  await app.frameEval('viewStudentPaper', `location.href = location.href.replace(/eid=\\d+/, 'eid=${eid}'); 'nav'`);
  let res = null;
  for (let i = 0; i < 15; i++) {
    await sleep(800);
    try {
      const raw = await app.frameEval('viewStudentPaper', PARSE_EXPR);
      const obj = JSON.parse(raw);
      if (obj.count >= 10) { res = obj; break; }
    } catch (e) { }
  }
  if (!res) throw new Error('parse failed');
  fs.writeFileSync(path.join(OUT, `paper-${eid}.json`), JSON.stringify(res, null, 1), 'utf8');
  console.log('  解析题量:', res.count);
  return res;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const app = await makeAppEval();
  try {
    let eids = process.argv.slice(2).map(Number).filter(Boolean);
    if (!eids.length) {
      const raw = await app.frameEval('notBeginningExamPaper', `(function(){
        var out = [];
        Array.prototype.forEach.call(document.querySelectorAll('a[onclick]'), function(a){
          var m = (a.getAttribute('onclick')||'').match(/beginTest\\((\\d+)\\)/);
          if (m) out.push(Number(m[1]));
        });
        return JSON.stringify(out);
      })()`);
      eids = JSON.parse(raw);
      console.log('未开始试卷:', eids.join(', '));
    }
    const all = [];
    for (const eid of eids) {
      try {
        const res = await harvestOne(app, eid);
        (res.questions || []).forEach(q => all.push(q));
      } catch (e) {
        console.log('  失败:', eid, e.message);
      }
      await sleep(1500);
    }
    fs.writeFileSync(path.join(OUT, 'exam-questions.json'), JSON.stringify({ at: new Date().toISOString(), questions: all }, null, 1), 'utf8');
    console.log('\n合计题目:', all.length, '→ data/hebmu/exam-questions.json');
  } finally {
    app.close();
  }
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
