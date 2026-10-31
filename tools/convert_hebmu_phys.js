/* 把河北医科大学练习平台抓到的生理学题转换成应用题库格式
 * 输入：data/hebmu/phys-questions.json + data/hebmu/kp-map-a.json / kp-map-b.json
 * 输出：data/q-hebmu-phys.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'hebmu');
const OUT = path.join(ROOT, 'data', 'q-hebmu-phys.js');

global.window = global;
const vm = require('vm');
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js', 'data.js'), 'utf8'), { filename: 'data.js' });
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js', 'engine.js'), 'utf8'), { filename: 'engine.js' });
const E = window.Engine;

const chaptersByKp = {};
E.chapters.filter(c => c.subject === 'physiology').forEach(c => c.kps.forEach(k => { chaptersByKp[k.name] = c.name; }));

const questions = JSON.parse(fs.readFileSync(path.join(DIR, 'phys-questions.json'), 'utf8'));
const map = {};
['kp-map-a.json', 'kp-map-b.json'].forEach(f => {
  const p = path.join(DIR, f);
  if (fs.existsSync(p)) Object.assign(map, JSON.parse(fs.readFileSync(p, 'utf8')));
});
console.log('题目:', questions.length, '| 归类映射:', Object.keys(map).length);

const out = [], skipped = [];
const seenStem = new Set();
const normStem = s => String(s || '').replace(/[\s，。、：；？！,.;:?!"'‘’“”()\[\]（）【】]/g, '').toLowerCase();
questions.forEach(q => {
  const kp = map[q.qid] || '';
  if (!kp || !chaptersByKp[kp]) { skipped.push({ qid: q.qid, stem: (q.stem || '').slice(0, 40), why: kp ? 'bad-kp:' + kp : 'no-kp' }); return; }
  const key = normStem(q.stem);
  if (seenStem.has(key)) { skipped.push({ qid: q.qid, stem: (q.stem || '').slice(0, 40), why: 'dup-stem' }); return; }
  seenStem.add(key);
  if (q.stem.replace(/\s+/g, '').length < 8) { skipped.push({ qid: q.qid, stem: (q.stem || '').slice(0, 40), why: 'short-stem' }); return; }

  let opts = q.options.slice();
  const ansKey = String(q.answer || '').trim().toUpperCase();
  if (opts.length > 4) {
    // 优先删「以上都是/都不是」这类错误项，否则删最后一个非正确项
    let dropIdx = -1;
    for (let i = opts.length - 1; i >= 0; i--) {
      if (opts[i].key === ansKey) continue;
      if (/以上|都是|都不是|均/.test(opts[i].text)) { dropIdx = i; break; }
    }
    if (dropIdx < 0) {
      for (let i = opts.length - 1; i >= 0; i--) { if (opts[i].key !== ansKey) { dropIdx = i; break; } }
    }
    if (dropIdx < 0) dropIdx = opts.length - 1;
    opts.splice(dropIdx, 1);
  }
  if (opts.length !== 4) { skipped.push({ qid: q.qid, stem: (q.stem || '').slice(0, 40), why: 'opts=' + opts.length }); return; }
  const ansIdx = opts.findIndex(o => o.key === ansKey);
  if (ansIdx < 0) { skipped.push({ qid: q.qid, stem: (q.stem || '').slice(0, 40), why: 'ans=' + ansKey }); return; }

  out.push({
    id: 'hebmu-phys-' + String(out.length + 1).padStart(3, '0'),
    subject: 'physiology',
    chapter: chaptersByKp[kp],
    kp: kp,
    style: 'cn306',
    type: (/患者|男[，,]|女[，,]|男性|女性/.test(q.stem) && q.stem.length > 45) ? 'A2' : 'A1',
    difficulty: 0.5,
    stem: q.stem.replace(/\s+/g, ' ').trim(),
    options: opts.map(o => o.text.replace(/\s+/g, ' ').trim()),
    answer: [ansIdx],
    explain: '原卷未附解析。正确答案：' + opts[ansIdx].text + '。本题由河北医科大学练习平台导出，建议对照人卫版教材核对相关机制与数值，并把其余选项与教材表述逐条比对，避免只记题干结论。',
    source: '河北医科大学练习平台·生理学（原卷）'
  });
});

const header = '/* 河北医科大学学生自主练习平台 · 生理学（2026-10-31 抓取；原卷 199 题，可用 ' + out.length + ' 题）\n' +
  ' * 说明：本地个人复习用；原卷 5 选项，已按 306 口径裁剪为 4 选项；原卷未附解析\n */\n';
fs.writeFileSync(OUT, header + 'window.ML_QUESTION_PARTS = window.ML_QUESTION_PARTS || {};\nwindow.ML_QUESTION_PARTS.hebmuPhys = ' + JSON.stringify(out, null, 1) + ';\n', 'utf8');
console.log('写入', OUT, '共', out.length, '题；跳过', skipped.length);
const byKp = {};
out.forEach(q => { byKp[q.kp] = (byKp[q.kp] || 0) + 1; });
Object.keys(byKp).sort((a, b) => byKp[b] - byKp[a]).forEach(k => console.log('  ' + k, byKp[k]));
if (skipped.length) console.log('跳过样例:', JSON.stringify(skipped.slice(0, 8), null, 1));
