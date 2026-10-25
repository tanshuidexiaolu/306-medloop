/* 校验导出的 JSON 能否被「设置 → 导入题目」直接接受
 * 用法：node tools/validate_json.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
global.window = global;
const load = (rel) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });

load('js/data.js');
load('js/engine.js');
load('js/bank.js');

const files = ['data/export/q-exam-phys-midterm.json', 'data/export/q-exam-bioc-midterm.json'];
let bad = 0;
files.forEach((f) => {
  const rows = JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  window.ML_QUESTION_PARTS = { imported: rows };
  const rep = window.MLBank.build();
  const rej = rep.rejected.filter((r) => r.id);
  console.log(path.basename(f) + '  导入 ' + rows.length + ' 题 / 可用 ' + rep.usable + ' 题 / 丢弃 ' + rep.rejected.length);
  rep.rejected.slice(0, 8).forEach((r) => console.log('   - ' + (r.id || '(无id)') + '：' + r.errs.join('；')));
  bad += rep.rejected.length;
});
console.log(bad === 0 ? '✓ 两份 JSON 均可直接导入' : '✗ 存在无法导入的记录');
