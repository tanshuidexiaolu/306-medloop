/* 306 西综训练台 · 题库 / 知识图谱 / 算法一致性校验
 * 用法：node tools/verify.js
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
// 自动加载 data/ 下所有题库分片（按文件名排序，保证可复现）
const qdir = path.join(ROOT, 'data');
const qfiles = fs.existsSync(qdir) ? fs.readdirSync(qdir).filter(f => /^q-.*\.js$/.test(f)).sort() : [];
qfiles.forEach(f => load('data/' + f));
MLBank.build();
console.log('题库文件：' + qfiles.join(', '));

const E = window.Engine, B = window.MLBank;
const list = B.list();
const rep = B.report();
const ok = s => '\x1b[32m' + s + '\x1b[0m';
const bad = s => '\x1b[31m' + s + '\x1b[0m';
const warn = s => '\x1b[33m' + s + '\x1b[0m';

console.log('\n=== 306 训练台 · 一致性校验 ===');
console.log(`大纲：${E.subjects.length} 学科 / ${E.chapters.length} 章 / ${E.kps.length} 考点`);
console.log(`题库：${rep.total} 条记录，可用 ${rep.usable} 题，被丢弃 ${rep.rejected.length} 条`);

if (rep.rejected.length) {
  console.log(bad('\n[!] 未通过校验的记录：'));
  rep.rejected.slice(0, 20).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.id || '(无 id)'} ${r.raw && r.raw.stem ? String(r.raw.stem).slice(0, 26) + '…' : ''}`);
    r.errs.forEach(e => console.log('     - ' + e));
  });
} else {
  console.log(ok('[✓] 全部通过字段校验、考点挂载、题型与答案一致性'));
}

// 题型 × 学科
const TYPES = ['A1', 'A2', 'B', 'X', 'X2'];
console.log('\n题型 × 学科');
console.log('        ' + TYPES.map(t => t.padStart(4)).join('') + '   合计');
let typeTot = {}, grand = 0;
E.subjects.forEach(s => {
  const row = TYPES.map(t => list.filter(q => q.subject === s.id && q.type === t).length);
  row.forEach((v, i) => typeTot[TYPES[i]] = (typeTot[TYPES[i]] || 0) + v);
  const sum = row.reduce((a, b) => a + b, 0); grand += sum;
  console.log(s.name.padEnd(7) + row.map(v => String(v).padStart(4)).join('') + String(sum).padStart(6));
});
console.log('合计   ' + TYPES.map(t => String(typeTot[t] || 0).padStart(4)).join('') + String(grand).padStart(6));

// 题源分布
console.log('\n题源分布');
Object.keys(E.STYLES).forEach(k => {
  const qs = B.byStyle(k);
  const byType = TYPES.filter(t => qs.some(q => q.type === t)).map(t => t + ' ' + qs.filter(q => q.type === t).length);
  console.log(`  ${E.STYLES[k].name.padEnd(6)} ${String(qs.length).padStart(3)} 题   ${byType.join(' · ') || '—'}`);
});

// 覆盖
console.log('\n知识图谱覆盖');
E.subjects.forEach(s => {
  const qs = B.bySubject(s.id);
  const covered = new Set(qs.map(q => q.kpId));
  const extKp = new Set(qs.filter(q => q.style !== 'cn306').map(q => q.kpId));
  const total = E.subjKps[s.id].length;
  console.log(`  ${s.name.padEnd(5)} ${String(covered.size).padStart(3)}/${String(total).padEnd(3)} 考点 (${String(Math.round(covered.size / total * 100)).padStart(3)}%)  题量 ${String(qs.length).padStart(3)}  已有变式的考点 ${extKp.size}  占分 ${Math.round(s.share * 100)}%`);
});

// 组完整性
const bg = {}, cg = {};
list.filter(q => q.type === 'B' && q.bgroup).forEach(q => (bg[q.bgroup] = bg[q.bgroup] || []).push(q));
list.filter(q => q.caseId).forEach(q => (cg[q.caseId] = cg[q.caseId] || []).push(q));
console.log('\nB 型配伍组');
Object.keys(bg).forEach(g => {
  const items = bg[g];
  const same = items.every(q => JSON.stringify(q.options) === JSON.stringify(items[0].options));
  console.log(`  ${g}: ${items.length} 题，选项一致 ${same ? ok('✓') : bad('✗')}`);
});
console.log('病例串题组');
Object.keys(cg).forEach(g => {
  const items = cg[g];
  const hasText = items.every(q => q.caseText);
  console.log(`  ${g}: ${items.length} 题，公共材料 ${hasText ? ok('✓') : bad('✗')}，${items.map(q => q.id).join(', ')}`);
});
if (!Object.keys(cg).length) console.log('  （无）');

// 数据质量
const ids = list.map(q => q.id);
const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
const shortExp = list.filter(q => (q.explain || '').length < 60);
const hard = list.filter(q => q.difficulty >= 0.75).length, easy = list.filter(q => q.difficulty <= 0.4).length;
const multi = list.filter(q => (q.chooseN || 1) > 1);
console.log('\n数据质量');
console.log(`  重复 id: ${dup.length ? bad(dup.join(', ')) : ok('无')}`);
console.log(`  解析 <60 字: ${shortExp.length ? warn(shortExp.length + ' 题') : ok('无')}`);
console.log(`  多选题（X/X2）: ${multi.length} 题，其中 X2 ${multi.filter(q => q.type === 'X2').length} 题`);
console.log(`  否定提问: ${list.filter(q => q.ask === 'negative').length} 题 · 拓展(beyond): ${list.filter(q => q.beyond).length} 题`);
console.log(`  难度分布: 易 ${easy} / 中 ${list.length - easy - hard} / 难 ${hard}`);

// 算法：冷启动
const fresh = () => ({
  profile: {
    deadline: '2026-12-20', deadlineTime: '23:59', dailyMinutes: 150, weekdays: [1, 2, 3, 4, 5, 6, 7],
    masterLine: 0.75, styleMixRatio: 0.15, base: { physiology: 45, biochem: 40, pathology: 50, internal: 35, surgery: 40, humanity: 60 },
    deadlineSetAt: Date.now(), deadlineSpanDays: 61
  },
  mastery: {}, styleStats: {}, qstats: {}, logs: {}, sessions: [], mocks: [], createdAt: Date.now()
});
let st = fresh();
const feas = E.feasibility(st);
console.log('\n算法校验（全新用户，截止 2026-12-20）');
console.log(`  剩余工作量 W=${feas.W} 题量当量 / 有效学习日 D=${feas.D}`);
console.log(`  每日需 ${Math.ceil(feas.need)} 题，容量 ${Math.round(feas.cap)} 题 → 可行性 ${feas.label} (F=${feas.F.toFixed(2)})`);
console.log(`  今日计划题量 ${feas.todayCount} · 状态分布 ${JSON.stringify(feas.counts)}`);

// 算法：可行性三档
[[80, '极紧（80 天→不，用 8 天）'], [8, '8 天'], [30, '30 天']].forEach(([d, label]) => {
  const s2 = fresh();
  s2.profile.deadline = E.dayKey(Date.now() + d * 864e5);
  s2.profile.deadlineSpanDays = d;
  const f = E.feasibility(s2);
  console.log(`  截止 ${d} 天后 → 每日需 ${Math.ceil(f.need)} 题，F=${f.F.toFixed(2)} ${f.label}${f.solutions.length ? '（给出 ' + f.solutions.length + ' 条解法）' : ''}`);
});

// 算法：答题后掌握度与迁移度
st = fresh();
const q306 = B.byStyle('cn306').filter(q => q.style === 'cn306')[0];
const qExt = B.list().filter(q => q.style !== 'cn306')[0];
const kpId = qExt.kpId;
const q306kp = B.byKp(kpId).filter(q => q.style === 'cn306')[0] || q306;
const m0 = E.mastery(st, kpId);
for (let i = 0; i < 3; i++) E.applyAnswer(st, q306kp, q306kp.answer);
const m1 = E.mastery(st, kpId);
for (let i = 0; i < 2; i++) E.applyAnswer(st, qExt, [0]); // 故意答错
const tr = E.styleTransfer(st, kpId);
console.log('\n算法校验（掌握度 / 迁移度）');
console.log(`  考点「${qExt.kp}」初始掌握 ${(m0 * 100).toFixed(0)}% → 连对 3 次后 ${(m1 * 100).toFixed(0)}%`);
console.log(`  再做 2 道变式（答错）→ 迁移度 ${tr ? tr.value.toFixed(2) + '（306 ' + Math.round(tr.base * 100) + '% / 变式 ' + Math.round(tr.ext * 100) + '%）' : '样本不足'}`);
console.log(`  风格统计：${JSON.stringify(st.styleStats[kpId])}`);

// 组卷
console.log('\n组卷能力');
[[20, '快速训练'], [30, '迷你模考'], [60, '半程模考'], [165, '全真模考']].forEach(([n, label]) => {
  const r = E.composeMock(st, n);
  console.log(`  ${label}（${n} 题）: 可组 ${r.got} 题${r.approx ? '，替代 ' + r.approx : ''}，缺口 ${r.missing.length} → ${r.ok ? ok('可开考') : bad('需补题库')}`);
});

// 计划块
const plan = E.buildPlan(st);
console.log('\n今日计划生成');
console.log(`  目标题量 ${plan.target} · ${plan.tight ? '偏紧' : '宽松'} · 块数 ${plan.blocks.length}`);
plan.blocks.forEach(b => console.log(`  - ${b.title}: ${b.count} 题 / ${b.minutes} 分钟${b.mixExtRatio ? ' / 变式 ' + Math.round(b.mixExtRatio * 100) + '%' : ''}`));

const pass = !rep.rejected.length && !dup.length;
console.log('\n' + (pass ? ok('校验通过') : bad('校验未通过')) + '\n');
process.exit(pass ? 0 : 1);
