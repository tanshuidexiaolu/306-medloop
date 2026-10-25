/* 无浏览器环境下的渲染冒烟测试：给 DOM 打桩，跑所有 view.render()，检查抛错与异常输出
 * 用法：node tools/smoke.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');

/* ---------- DOM / 浏览器 API 打桩 ---------- */
const store = new Map();
const el = () => ({
  innerHTML: '', textContent: '', value: '', style: {}, files: [],
  classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  setAttribute() {}, getAttribute() { return null; }, hasAttribute() { return false; },
  addEventListener() {}, removeEventListener() {}, appendChild() {}, removeChild() {},
  querySelector() { return el(); }, querySelectorAll() { return []; },
  closest() { return null; }, focus() {}, click() {}
});
global.window = global;
global.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};
global.location = { hash: '', href: 'file:///index.html' };
global.document = {
  readyState: 'complete',
  documentElement: { getAttribute() { return 'light'; }, setAttribute() {}, dataset: {}, scrollTop: 0 },
  body: { appendChild() {}, removeChild() {}, scrollTop: 0 },
  createElement: () => el(),
  getElementById: () => el(),
  querySelector: () => el(),
  querySelectorAll: () => [],
  addEventListener() {}, removeEventListener() {}
};
global.navigator = { userAgent: 'node' };
global.addEventListener = () => {};
global.requestAnimationFrame = fn => setTimeout(fn, 0);
global.setInterval = () => 0;
global.clearInterval = () => {};

const load = rel => vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });
['js/data.js', 'js/engine.js', 'js/bank.js'].forEach(load);
['data/q-basic.js', 'data/q-clinical.js', 'data/q-ext.js'].forEach(load);
['js/store.js', 'js/ui.js', 'js/view-today.js', 'js/view-train.js', 'js/view-knowledge.js', 'js/view-stats.js'].forEach(load);
window.MLBank.build();

const S = window.Store, E = window.Engine, App = window.App, B = window.MLBank;
S.load();
const state = S.get();

let errors = 0, warns = 0;
const check = (name, html) => {
  if (typeof html !== 'string') { console.log('  ✗ ' + name + '：render 没有返回字符串'); errors++; return; }
  if (html.length < 80) { console.log('  ✗ ' + name + '：输出过短 (' + html.length + ' 字符)'); errors++; return; }
  const nan = (html.match(/NaN/g) || []).length;
  const undef = (html.match(/>undefined|undefined</g) || []).length;
  if (nan) { console.log('  ✗ ' + name + '：出现 ' + nan + ' 处 NaN'); errors++; }
  if (undef) { console.log('  ⚠ ' + name + '：出现 ' + undef + ' 处 undefined'); warns++; }
  if (!nan && !undef) console.log('  ✓ ' + name + '：' + html.length + ' 字符');
};

console.log('\n=== 页面渲染冒烟测试 ===');
['today', 'train', 'mock', 'map', 'bank', 'review', 'stats', 'settings', 'about'].forEach(id => {
  try { check(id, App.views[id].render({})); }
  catch (e) { console.log('  ✗ ' + id + '：' + e.message + '\n     ' + (e.stack || '').split('\n')[1]); errors++; }
});

console.log('\n=== 答题会话渲染 ===');
const qs = E.pickQuestions(state, { kpIds: [B.byStyle('usmle')[0].kpId], count: 3, mixExtRatio: 0.6 });
if (!qs.length) { console.log('  ✗ 抽题失败'); errors++; }
else {
  // 找到一道串题 / 选2项 / 否定提问 的样例分别渲染
  const samples = {
    '普通题': qs[0],
    '串题': B.list().filter(q => q.caseId)[0],
    '选2项': B.list().filter(q => q.type === 'X2')[0],
    '否定提问': B.list().filter(q => q.ask === 'negative')[0],
    '否定/多选': B.list().filter(q => (q.chooseN || 1) > 1)[0]
  };
  Object.keys(samples).forEach(k => {
    const q = samples[k];
    if (!q) { console.log('  · ' + k + '：题库中暂无该类型'); return; }
    try { check(k + '（未作答）', window.UI.qHTML(q, { selected: [], reveal: false })); }
    catch (e) { console.log('  ✗ ' + k + '：' + e.message); errors++; }
    try { check(k + '（已作答）', window.UI.qHTML(q, { selected: [q.answer[0]], reveal: true, correct: true })); }
    catch (e) { console.log('  ✗ ' + k + ' 解析态：' + e.message); errors++; }
  });

  // 会话状态机
  App.session = {
    mode: 'train', title: '测试会话', subtitle: '', questions: qs, idx: 0,
    answers: {}, revealed: {}, correct: {}, startedAt: Date.now(), limitSec: 0,
    instant: true, back: '#/today', meta: {}, finished: false, per: {}
  };
  try { check('会话·未作答', App.views.quiz.render({})); } catch (e) { console.log('  ✗ 会话未作答：' + e.message); errors++; }
  const q0 = qs[0];
  App.session.answers[q0.id] = q0.answer.slice();
  App.session.revealed[q0.id] = true;
  App.session.correct[q0.id] = true;
  try { check('会话·已作答', App.views.quiz.render({})); } catch (e) { console.log('  ✗ 会话已作答：' + e.message); errors++; }
  App.session.questions = qs.slice(0, 1);
  App.session.summary = { answered: 1, correct: 1, total: 1, minutes: 1, skipped: 0, wrong: [], kps: {}, maxScore: 2, gotScore: 2, score300: 300, byType: { A1: { n: 1, c: 1 } }, bySubject: {}, byStyle: { cn306: { n: 1, c: 1 }, usmle: { n: 1, c: 0 } } };
  App.session.finished = true;
  try { check('会话·结果页', App.views.quiz.render({})); } catch (e) { console.log('  ✗ 结果页：' + e.message); errors++; }
}

console.log('\n=== 关键交互函数 ===');
const tryFn = (name, fn) => { try { fn(); console.log('  ✓ ' + name); } catch (e) { console.log('  ✗ ' + name + '：' + e.message); errors++; } };
tryFn('设置截止日（可行性重算）', () => {
  const before = E.feasibility(S.get()).label;
  S.get().profile.deadline = E.dayKey(Date.now() + 7 * 864e5);
  S.get().profile.deadlineSpanDays = 7;
  const after = E.feasibility(S.get()).label;
  if (before === after) throw new Error('改截止日后可行性未变化：' + before);
  console.log('     可行性 ' + before + ' → ' + after);
  S.get().profile.deadline = '2026-12-20'; S.get().profile.deadlineSpanDays = 61;
});
tryFn('导入题库（含错误条目）', () => {
  const before = B.report().usable;
  const res = window.App.importBankText(JSON.stringify([
    { id: 'smoke-1', subject: 'internal', chapter: '心力衰竭', kp: '心力衰竭', style: 'cn306', type: 'A1', stem: '冒烟测试题干', options: ['a', 'b', 'c', 'd'], answer: [1], explain: '这是冒烟测试解析，长度足够六十个字用于通过校验检查，内容不重要。' },
    { id: 'smoke-2', subject: 'internal', chapter: '不存在的章', kp: '不存在的考点', type: 'A1', stem: '坏题', options: ['a', 'b'], answer: [0] }
  ]));
  if (res.added !== 1) throw new Error('期望入库 1 题，实际 ' + res.added);
  console.log('     入库 ' + res.added + ' 题，丢弃 ' + res.rejected + ' 条（题库 ' + before + ' → ' + B.report().usable + '）');
});
tryFn('轨迹：抽题→作答→掌握度更新', () => {
  const st = S.get();
  const q = B.list()[0];
  const m0 = E.mastery(st, q.kpId);
  E.applyAnswer(st, q, q.answer);
  if (!(E.mastery(st, q.kpId) >= m0)) throw new Error('答对后掌握度未上升');
  E.applyAnswer(st, q, [q.answer[0] === 0 ? 1 : 0]);
  const s = E.subjectStat(st, q.subject);
  if (!(s.m >= 0 && s.m <= 1)) throw new Error('学科掌握度越界');
});

console.log('\n' + (errors ? '\x1b[31m冒烟测试失败：' + errors + ' 个错误\x1b[0m' : '\x1b[32m冒烟测试通过\x1b[0m') + (warns ? '，' + warns + ' 个警告' : '') + '\n');
process.exit(errors ? 1 : 0);
