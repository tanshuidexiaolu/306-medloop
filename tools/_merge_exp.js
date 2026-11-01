/* 把子代理写的解析合并进 hebmu 题库文件 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'hebmu');

const maps = {};
fs.readdirSync(DIR).filter(f => /^exp-map-\d+\.json$/.test(f)).forEach(f => {
  try { Object.assign(maps, JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))); } catch (e) { console.log('skip', f, e.message); }
});
console.log('解析条数:', Object.keys(maps).length);

global.window = global;
['data/q-hebmu-phys.js', 'data/q-hebmu-bioc.js'].forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));

let total = 0, updated = 0, short = 0;
['hebmuPhys', 'hebmuBioc'].forEach(key => {
  const list = window.ML_QUESTION_PARTS[key] || [];
  list.forEach(q => {
    total++;
    const e = maps[q.id];
    if (!e) return;
    if (String(e).length < 60) { short++; return; }
    q.explain = String(e).trim();
    updated++;
  });
  const file = key === 'hebmuPhys' ? 'data/q-hebmu-phys.js' : 'data/q-hebmu-bioc.js';
  const header = '/* 河北医科大学学生自主练习平台 · 原卷题（本地个人复习用；5 选项已按 306 口径裁为 4 选项） */\n';
  fs.writeFileSync(path.join(ROOT, file), header + 'window.ML_QUESTION_PARTS = window.ML_QUESTION_PARTS || {};\nwindow.ML_QUESTION_PARTS.' + key + ' = ' + JSON.stringify(list, null, 1) + ';\n', 'utf8');
  console.log(file, list.length, '题');
});
console.log('总题:', total, '| 已更新解析:', updated, '| 过短跳过:', short, '| 缺解析:', total - updated - short);
