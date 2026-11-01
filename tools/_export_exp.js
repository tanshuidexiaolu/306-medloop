/* 导出需要写解析的题目（hebmu 题库），按 68 题一片 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'hebmu');

global.window = global;
['data/q-hebmu-phys.js', 'data/q-hebmu-bioc.js'].forEach(f => {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
});
const all = [];
['hebmuPhys', 'hebmuBioc'].forEach(k => (window.ML_QUESTION_PARTS[k] || []).forEach(q => all.push(q)));
console.log('待写解析:', all.length);

function pack(q) {
  const letters = 'ABCD';
  return {
    id: q.id,
    kp: q.kp,
    stem: q.stem,
    options: q.options.map((o, i) => letters[i] + '. ' + o),
    answer: letters[q.answer[0]] + '. ' + q.options[q.answer[0]]
  };
}
const size = 68;
let n = 0;
for (let i = 0; i < all.length; i += size) {
  n++;
  const part = all.slice(i, i + size).map(pack);
  fs.writeFileSync(path.join(DIR, `exp-${n}.json`), JSON.stringify(part, null, 1), 'utf8');
  console.log(`exp-${n}.json: ${part.length} 题`);
}
