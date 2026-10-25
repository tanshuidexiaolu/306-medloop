/* 导出 JSON：把题库分片转成「设置 → 导入题目」可用的 JSON 数组
 * 用法：node tools/export_json.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
global.window = global;
const load = (rel) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });

load('js/data.js');
['data/q-exam-phys-midterm.js', 'data/q-exam-bioc-midterm.js'].forEach(load);

const parts = window.ML_QUESTION_PARTS || {};
const outDir = path.join(ROOT, 'data', 'export');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const map = {
  examPhys: 'q-exam-phys-midterm.json',
  examBioc: 'q-exam-bioc-midterm.json',
};

Object.keys(map).forEach((key) => {
  const list = parts[key] || [];
  const clean = list.map((q) => ({
    id: q.id,
    subject: q.subject,
    chapter: q.chapter,
    kp: q.kp,
    style: q.style,
    type: q.type,
    ask: q.ask,
    difficulty: q.difficulty,
    stem: q.stem,
    options: q.options,
    answer: q.answer,
    explain: q.explain,
    tip: q.tip,
    source: q.source,
  }));
  const file = path.join(outDir, map[key]);
  fs.writeFileSync(file, JSON.stringify(clean, null, 2) + '\n', 'utf8');
  console.log(map[key] + '  ' + clean.length + ' 题');
});
