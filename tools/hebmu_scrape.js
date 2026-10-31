/* 河北医科大学练习平台抓题脚本（CDP，需先以 --remote-debugging-port=9222 启动 Chrome 并登录）
 * 用法：
 *   node tools/hebmu_scrape.js list              列出「已做完的测试」里的试卷
 *   node tools/hebmu_scrape.js parse [eid]       解析当前/指定试卷，输出 JSON 到 data/hebmu/
 *   node tools/hebmu_scrape.js all               遍历所有已完成试卷，去重后合并输出
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.CDP_PORT || 9222);
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'hebmu');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function getJSON(p) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: PORT, path: p }, res => {
      let b = ''; res.on('data', d => b += d);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

async function connect() {
  const list = await getJSON('/json/list');
  const page = list.find(t => t.type === 'page' && /webvpn\.hebmu\.edu\.cn/.test(t.url));
  if (!page) throw new Error('找不到练习平台页面，请确认 Chrome 已打开并登录');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
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
    out = out || [];
    out.push({ frameId: node.frame.id, url: node.frame.url || '' });
    (node.childFrames || []).forEach(c => flat(c, out));
    return out;
  }
  async function frameEval(urlPart, expr) {
    const tree = await send('Page.getFrameTree');
    const frames = flat(tree.frameTree);
    const f = frames.find(x => x.url.indexOf(urlPart) >= 0);
    if (!f) throw new Error('frame not found: ' + urlPart + ' | ' + frames.map(x => x.url).join(' ; '));
    // 优先用该 frame 的主世界上下文（能访问页面 jQuery 等全局变量），取最新一个
    const ctxs = events.filter(e => e.method === 'Runtime.executionContextCreated' &&
      e.params.context.auxData && e.params.context.auxData.frameId === f.frameId)
      .map(e => e.params.context).sort((a, b) => b.id - a.id);
    for (const ctx of ctxs) {
      try {
        const r = await send('Runtime.evaluate', { expression: expr, contextId: ctx.id, returnByValue: true, awaitPromise: true, userGesture: true });
        if (r.exceptionDetails) throw new Error('eval error: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
        return r.result.value;
      } catch (e) { /* 旧上下文失效 → 试下一个 */ }
    }
    const w = await send('Page.createIsolatedWorld', { frameId: f.frameId, worldName: 'scrape-' + Date.now() });
    const r = await send('Runtime.evaluate', { expression: expr, contextId: w.executionContextId, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('eval error: ' + JSON.stringify(r.exceptionDetails).slice(0, 400));
    return r.result.value;
  }
  async function pageEval(expr) {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('page eval error: ' + JSON.stringify(r.exceptionDetails).slice(0, 400));
    return r.result.value;
  }
  return { send, frameEval, pageEval, events, close: () => ws.close() };
}

/* ---------- 列表 ---------- */
const LIST_EXPR = `(function(){
  var rows = [], seen = {};
  Array.prototype.forEach.call(document.querySelectorAll('a[onclick]'), function(a){
    var m = (a.getAttribute('onclick') || '').match(/checkAnswer\\((\\d+)\\)/);
    if (!m) return;
    var eid = m[1];
    if (seen[eid]) return;
    seen[eid] = 1;
    var tr = a.closest('tr');
    function get(part){ if (!tr) return ''; var c = tr.querySelector('[class*="' + part + '"]'); return c ? (c.innerText || '').trim() : ''; }
    rows.push({ eid: eid, ename: get('ENAME'), cname: get('CNAME'), score: get('SUBJECTSUM') || get('SCORE'), time: get('CREATETIME') });
  });
  return JSON.stringify({ count: rows.length, rows: rows });
})()`;

/* ---------- 题目解析 ---------- */
const PARSE_EXPR = `(function(){
  var paper = document.getElementById('paper');
  if (!paper) return JSON.stringify({ error: 'no #paper' });
  var out = [], section = '';
  var kids = Array.prototype.slice.call(paper.children);
  for (var i = 0; i < kids.length; i++) {
    var el = kids[i];
    if (el.tagName === 'H1') { var t = (el.innerText || '').trim(); if (/型题/.test(t)) section = t; continue; }
    if (!el.classList || !el.classList.contains('qcontent')) continue;
    var p = el.querySelector('p') || el;
    var ps = Array.prototype.slice.call(el.querySelectorAll('p'));
    if (!ps.length) ps = [p];
    var stemParts = [], options = [];
    ps.forEach(function (node) {
      var t = (node.innerText || '').replace(/\\s+/g, ' ').trim();
      if (!t) return;
      var mm = t.match(/^([A-Ea-e])\\s*[\\.、．:：]\\s*(.*)$/);
      if (mm && options.length < 5) options.push({ key: mm[1].toUpperCase(), text: (mm[2] || '').trim() });
      else if (!options.length) stemParts.push(t);
      else options[options.length - 1].text = (options[options.length - 1].text + ' ' + t).trim();
    });
    var stem = stemParts.join(' ').replace(/^\\s*\\d+\\s*[\\.、]\\s*/, '');
    if (!options.length) {
      // 兜底：选项可能挤在同一个 <p> 里，用标记切分
      var text = ps.map(function (n) { return (n.innerText || ''); }).join('\\n').replace(/\\r/g, '');
      text = text.replace(/^\\s*\\d+\\s*[\\.、]\\s*/, '');
      var idxs = [], re = /([A-Ea-e])\\s*[\\.、．:：]\\s*/g, m;
      while ((m = re.exec(text))) {
        var before = m.index === 0 ? ' ' : text.charAt(m.index - 1);
        if (!/\\s/.test(before)) continue;
        idxs.push({ key: m[1].toUpperCase(), start: m.index, end: re.lastIndex });
      }
      if (idxs.length >= 2) {
        stem = text.slice(0, idxs[0].start).trim();
        for (var k = 0; k < idxs.length; k++) {
          var end = k + 1 < idxs.length ? idxs[k + 1].start : text.length;
          options.push({ key: idxs[k].key, text: text.slice(idxs[k].end, end).replace(/\\s+/g, ' ').trim() });
        }
      }
    }
    if (!options.length) {
      // 兜底 3：选项挤在一起且标点后无空格（A、单纯扩散B、易化扩散），按 A-E 顺序切
    if (options.length < 4) {
      var s3 = ps.map(function (n) { return (n.innerText || ''); }).join('\\n').replace(/\\r/g, '');
      s3 = s3.replace(/^\\s*\\d+\\s*[\\.、]\\s*/, '');
      var seq = [], expect = 0, letters = 'ABCDE';
      var re4 = /([A-E])\\s*[\\.、．:：]\\s*/g, m4;
      while ((m4 = re4.exec(s3))) {
        if (m4[1] === letters.charAt(expect)) {
          seq.push({ key: m4[1], start: m4.index, end: re4.lastIndex });
          expect++;
        }
      }
      if (seq.length > options.length) {
        stem = s3.slice(0, seq[0].start).trim();
        options = seq.map(function (x, i) {
          var e3 = i + 1 < seq.length ? seq[i + 1].start : s3.length;
          return { key: x.key, text: s3.slice(x.end, e3).replace(/\\s+/g, ' ').trim() };
        });
      }
    }
      var s2 = ps.map(function (n) { return (n.innerText || ''); }).join('\\n').replace(/\\r/g, '');
      s2 = s2.replace(/^\\s*\\d+\\s*[\\.、]\\s*/, '');
      var marks = [], re3 = /([A-E])/g, m3;
      while ((m3 = re3.exec(s2))) {
        var prev = m3.index === 0 ? ' ' : s2.charAt(m3.index - 1);
        var next = s2.charAt(m3.index + 1);
        if ((m3.index === 0 || /\\s/.test(prev)) && next && !/\\s/.test(next)) {
          marks.push({ key: m3[1], index: m3.index });
        }
      }
      if (marks.length >= 2) {
        stem = s2.slice(0, marks[0].index).trim();
        for (var j = 0; j < marks.length; j++) {
          var e2 = j + 1 < marks.length ? marks[j + 1].index : s2.length;
          options.push({ key: marks[j].key, text: s2.slice(marks[j].index + 1, e2).replace(/\\s+/g, ' ').trim() });
        }
      }
    }
    // 题目 ID + 答案：沿 qcontent 之后的兄弟节点找 button 和 answer_div
    var qid = '', answer = '';
    var sib = el.nextElementSibling, guard = 0;
    while (sib && guard++ < 8) {
      if (!qid && sib.tagName === 'BUTTON' && /_colBtn$/.test(sib.id || '')) qid = sib.id.replace(/_colBtn$/, '');
      if (sib.classList && sib.classList.contains('answer_div')) {
        var ai = sib.querySelector('.ansIndex');
        if (ai) answer = (ai.innerText || '').trim();
        break;
      }
      sib = sib.nextElementSibling;
    }
    out.push({ qid: qid, section: section, stem: stem, options: options, answer: answer });
  }
  return JSON.stringify({ count: out.length, questions: out });
})()`;

async function doList(c) {
  const obj = JSON.parse(await c.frameEval('finishExamPaper', LIST_EXPR));
  console.log('试卷数:', obj.count);
  (obj.rows || []).forEach(r => {
    let t = r.time || '';
    if (/^\d+$/.test(String(t))) { try { t = new Date(Number(t)).toISOString().slice(0, 10); } catch (e) { } }
    console.log(`  ${r.eid}  ${r.ename || r.cname}  共${r.score || '?'}题  ${t}`);
  });
  return obj;
}

async function navPaper(c, eid) {
  await c.frameEval('viewStudentPaper', `location.href = location.href.replace(/eid=\\d+/, 'eid=${eid}'); 'nav';`);
  for (let i = 0; i < 15; i++) {
    await sleep(700);
    try {
      const st = await c.frameEval('viewStudentPaper', "document.readyState + '|' + (document.getElementById('paper') ? 'paper' : 'no') + '|' + location.search");
      if (st.indexOf('complete|paper') === 0 && st.indexOf('eid=' + eid) >= 0) return;
    } catch (e) {}
  }
  throw new Error('paper did not load: eid=' + eid);
}

async function parseCurrent(c) {
  const expr = fs.readFileSync(path.join(__dirname, 'parse_paper_expr.js'), 'utf8');
  const raw = await c.frameEval('viewStudentPaper', expr);
  return JSON.parse(raw);
}

async function doAll(c) {
  const obj = JSON.parse(await c.frameEval('finishExamPaper', LIST_EXPR));
  const rows = obj.rows || [];
  console.log('待抓试卷:', rows.length, '张');
  const papers = [], questions = [], seen = new Map(), fails = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const eid = r.ID || r.EID || r.eid;
    if (!eid) { console.log('  跳过无 ID 行'); continue; }
    const course = r.ENAME || r.CNAME || r.ename || '';
    try {
      await navPaper(c, eid);
      const res = await parseCurrent(c);
      const qs = (res.questions || []).filter(q => q.qid && q.stem && q.options.length >= 4 && q.answer);
      (res.questions || []).forEach(q => { if (!(q.qid && q.stem && q.options.length >= 4 && q.answer)) fails.push({ eid, course, q }); });
      papers.push({ eid, course, total: r.SUBJECTSUM || r.SCORE || 0, parsed: res.count, usable: qs.length });
      qs.forEach(q => {
        if (!seen.has(q.qid)) { seen.set(q.qid, true); questions.push(Object.assign({}, q, { eid: eid, course: course, paperTime: r.CREATETIME || '' })); }
      });
      fs.writeFileSync(path.join(OUT_DIR, `paper-${eid}.json`), JSON.stringify({ eid, course, count: res.count, questions: res.questions }, null, 1), 'utf8');
      console.log(`  [${i + 1}/${rows.length}] ${eid} ${course} 解析 ${res.count} 可用 ${qs.length}`);
    } catch (e) {
      console.log(`  [${i + 1}/${rows.length}] ${eid} 失败: ${e.message}`);
    }
    await sleep(1200);
  }
  const out = { scrapedAt: new Date().toISOString(), papers, questions, fails: fails.length };
  fs.writeFileSync(path.join(OUT_DIR, 'all-questions.json'), JSON.stringify(out, null, 1), 'utf8');
  const byCourse = {};
  questions.forEach(q => { byCourse[q.course] = (byCourse[q.course] || 0) + 1; });
  console.log('\n=== 汇总 ===');
  console.log('试卷:', papers.length, '张；唯一题目:', questions.length, '；解析失败题:', fails.length);
  console.log('按课程:', JSON.stringify(byCourse, null, 1));
  if (fails.length) console.log('失败样例:', JSON.stringify(fails.slice(0, 3).map(f => ({ eid: f.eid, stem: (f.q.stem || '').slice(0, 40), opts: (f.q.options || []).length }))));
  console.log('输出:', path.join(OUT_DIR, 'all-questions.json'));
}


async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const c = await connect();
  try {
    if (cmd === 'list') {
      await doList(c);
    } else if (cmd === 'debug') {
      const tree = await c.send('Page.getFrameTree');
      const frames = [];
      (function walk(n) { frames.push({ id: n.frame.id, url: n.frame.url }); (n.childFrames || []).forEach(walk); })(tree.frameTree);
      const ctxs = c.events.filter(e => e.method === 'Runtime.executionContextCreated').map(e => e.params.context);
      console.log('contexts:', JSON.stringify(ctxs.map(x => ({ id: x.id, origin: x.origin, frame: x.auxData && x.auxData.frameId, name: x.name })), null, 1));
      for (const f of frames) {
        let probe = '';
        try { probe = await c.frameEval(f.url.slice(0, 60), "document.title + '|' + (window.jQuery ? 'jq' : 'nojq') + '|' + document.body.innerText.slice(0, 40).replace(/\\s+/g, ' ')"); } catch (e) { probe = 'ERR ' + e.message.slice(0, 80); }
        console.log('-', f.url.slice(0, 80), '→', probe);
      }
    } else if (cmd === 'raw') {
      const expr = fs.readFileSync(rest[0], 'utf8');
      const v = await c.frameEval(rest[1] || 'viewStudentPaper', expr);
      console.log(typeof v === 'string' ? v : JSON.stringify(v, null, 1));
    } else if (cmd === 'parse') {
      const eid = rest[0];
      if (eid) await navPaper(c, eid);
      const res = await parseCurrent(c);
      console.log('题量:', res.count);
      console.log('样例:', JSON.stringify((res.questions || []).slice(0, 2), null, 1));
      const out = path.join(OUT_DIR, `paper-${eid || 'current'}.json`);
      fs.writeFileSync(out, JSON.stringify(res, null, 1), 'utf8');
      console.log('saved:', out);
    } else if (cmd === 'all') {
      await doAll(c);
    } else {
      console.log('usage: node tools/hebmu_scrape.js <list|parse|all>');
    }
  } finally {
    c.close();
  }
}

main().catch(e => { console.error('ERR', e.message); process.exit(1); });
