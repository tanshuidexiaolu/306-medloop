/* 单文件题库校验器（给题库生产用）
 * 用法：node tools/check_part.js data/q-306-phys.js ["呼吸系统疾病,循环系统疾病"]
 * 校验：学科/考点挂载/题型/答案/选项/解析长度/id 唯一/B 型组一致性/题干重复/考点覆盖
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
global.window = global;

const load = (f) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
load('js/data.js');
load('js/engine.js');

const file = process.argv[2];
if (!file) {
  console.log('用法: node tools/check_part.js <题库文件> [章1,章2]');
  process.exit(1);
}
const scopeChapters = process.argv[3] ? process.argv[3].split(/[,，]/).map(s => s.trim()).filter(Boolean) : null;
load(file);

const E = window.Engine;
const parts = window.ML_QUESTION_PARTS || {};
const list = [];
Object.keys(parts).forEach(k => (parts[k] || []).forEach(q => list.push(q)));

const errs = [], warns = [];
const norm = s => String(s || '').replace(/[\s\u3000，。、；：""''（）()【】]/g, '').toLowerCase();

if (!list.length) { console.log('✗ 文件里没有题目'); process.exit(1); }

list.forEach((q, i) => {
  const tag = q && q.id ? q.id : ('#' + (i + 1));
  if (!q || typeof q !== 'object') { errs.push(tag + '：不是对象'); return; }
  if (!E.SUBJ[q.subject]) errs.push(tag + '：未知学科 ' + q.subject);
  if (q.style && q.style !== 'cn306') warns.push(tag + '：style=' + q.style + '（本批应为 cn306）');
  const kp = E.resolve(q.subject, q.chapter, q.kp);
  if (!kp) errs.push(tag + '：考点未匹配 chapter=' + q.chapter + ' kp=' + q.kp);
  const T = window.ML_TYPES[q.type];
  if (!T) errs.push(tag + '：未知题型 ' + q.type);
  const opts = Array.isArray(q.options) ? q.options : [];
  if (opts.length < 3 || opts.length > 6) errs.push(tag + '：选项数 ' + opts.length);
  const ans = Array.isArray(q.answer) ? q.answer : [];
  if (!ans.length) errs.push(tag + '：answer 缺失');
  if (ans.some(a => !(a >= 0 && a < opts.length))) errs.push(tag + '：answer 下标越界');
  if (ans.length !== new Set(ans).size) errs.push(tag + '：answer 有重复下标');
  const chooseN = q.chooseN || ans.length || 1;
  if (ans.length !== chooseN) errs.push(tag + '：chooseN=' + chooseN + ' 与正确项数 ' + ans.length + ' 不一致');
  if (['A1', 'A2', 'B'].includes(q.type) && ans.length !== 1) errs.push(tag + '：单选题有 ' + ans.length + ' 个答案');
  if (q.type === 'X' && (ans.length < 2 || ans.length > 4)) errs.push(tag + '：X 型应有 2~4 个正确项');
  if (q.type === 'X2' && ans.length !== 2) errs.push(tag + '：X2 型应恰好 2 个');
  if (typeof q.difficulty !== 'number' || q.difficulty < 0 || q.difficulty > 1) errs.push(tag + '：difficulty 非法');
  if (!q.stem || String(q.stem).trim().length < 6) errs.push(tag + '：题干过短');
  if (opts.some(o => /^\s*[A-Ga-g][.、)）]/.test(String(o)))) errs.push(tag + '：选项带了 A. 前缀');
  if (String(q.explain || '').length < 60) errs.push(tag + '：解析不足 60 字（' + String(q.explain || '').length + '）');
  if (/[0-9]+\.[0-9]+\./.test(String(q.stem))) warns.push(tag + '：题干疑似带题号');

  // 选项数规范（依据 2015/2023/2024 年 306 真题：A/B/X 型均为 4 个选项 A-D）
  const st = q.style || 'cn306';
  const nOpt = opts.length;
  if (st === 'cn306') {
    if (nOpt !== 4) errs.push(tag + '：306 题应为 4 个选项 A-D（当前 ' + nOpt + '）');
  } else if (nOpt !== 5) {
    errs.push(tag + '：' + st + ' 变式题应为 5 个选项（当前 ' + nOpt + '）');
  }
});

// id 唯一
const ids = list.map(q => q && q.id);
ids.forEach((id, i) => { if (ids.indexOf(id) !== i) errs.push('重复 id: ' + id); });

// 题干重复（文件内）
const seen = {};
list.forEach(q => {
  const k = norm(q.stem).slice(0, 40);
  if (seen[k]) errs.push('题干重复: ' + seen[k] + ' / ' + q.id);
  else seen[k] = q.id;
});

// B 型组
const bg = {};
list.filter(q => q.type === 'B').forEach(q => (bg[q.bgroup || '(空)'] = bg[q.bgroup || '(空)'] || []).push(q));
Object.keys(bg).forEach(g => {
  const items = bg[g];
  if (!g || g === '(空)') errs.push('B 型题缺少 bgroup');
  if (items.length < 2) warns.push('B 组 ' + g + ' 只有 ' + items.length + ' 题（通常 2~5 题）');
  const same = items.every(q => JSON.stringify(q.options) === JSON.stringify(items[0].options));
  if (!same) errs.push('B 组 ' + g + ' 选项不一致');
});

// 统计
const byType = {};
const byChapter = {};
list.forEach(q => {
  byType[q.type] = (byType[q.type] || 0) + 1;
  const k = q.subject + ' · ' + q.chapter;
  byChapter[k] = (byChapter[k] || 0) + 1;
});

// 覆盖（按 scope 章节）
const subjIds = Array.from(new Set(list.map(q => q.subject)));
let uncovered = [];
subjIds.forEach(sid => {
  const kps = E.subjKps[sid] || [];
  const covered = new Set(list.filter(q => q.subject === sid).map(q => q.kpId || (E.resolve(q.subject, q.chapter, q.kp) || {}).id));
  kps.forEach(kp => {
    if (scopeChapters && scopeChapters.indexOf(kp.chapter) < 0) return;
    if (!covered.has(kp.id)) uncovered.push(kp.chapter + ' / ' + kp.name);
  });
});

console.log('\n=== 单文件题库校验：' + path.basename(file) + ' ===');
console.log('题量: ' + list.length + '   题型: ' + Object.keys(byType).map(t => t + ' ' + byType[t]).join(' · '));
console.log('\n按章节:');
Object.keys(byChapter).sort().forEach(k => console.log('  ' + k + '  ' + byChapter[k] + ' 题'));
if (scopeChapters) {
  console.log('\n考点覆盖（限定章节：' + scopeChapters.join('、') + '）：' +
    (uncovered.length ? '未覆盖 ' + uncovered.length + ' 个' : '全覆盖 ✓'));
  uncovered.forEach(u => console.log('  ✗ ' + u));
}
if (warns.length) {
  console.log('\n⚠ 提醒（' + warns.length + '）：');
  warns.slice(0, 20).forEach(w => console.log('  - ' + w));
}
if (errs.length) {
  console.log('\n✗ 错误（' + errs.length + '）：');
  errs.slice(0, 40).forEach(e => console.log('  - ' + e));
  console.log('\n未通过，请修正后重跑。\n');
  process.exit(1);
}
console.log('\n✓ 结构校验通过\n');
