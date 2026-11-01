global.window = global;
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = process.argv[2];
['data/q-hebmu-phys.js', 'data/q-hebmu-bioc.js'].forEach(f =>
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const all = [];
Object.keys(window.ML_QUESTION_PARTS).forEach(k => (window.ML_QUESTION_PARTS[k] || []).forEach(q => all.push(q)));
const pick = [all[0], all[120], all[300], all[520], all[700], all[all.length - 1]];
const L = 'ABCD';
pick.forEach(q => {
  console.log('=== ' + q.id + ' [' + q.kp + ']');
  console.log('题干:', q.stem);
  q.options.forEach((o, i) => console.log('  ' + L[i] + '. ' + o));
  console.log('答案:', L[q.answer[0]]);
  console.log('解析(' + q.explain.length + '字):', q.explain);
  console.log('');
});
const placeholder = all.filter(q => /原卷未附解析/.test(q.explain));
console.log('仍为占位解析:', placeholder.length);
