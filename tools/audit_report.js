/* 题库总览 + 审核表导出
 * 用法：node tools/audit_report.js
 * 产出：docs/题库审核表.csv（Excel 可直接打开）
 * 控制台：总量、学科/题型分布、考点覆盖率、未覆盖考点、跨文件重复题干
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
global.window = global;

const load = (f) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
load('js/data.js');
load('js/engine.js');
load('js/bank.js');
const qdir = path.join(ROOT, 'data');
const qfiles = fs.readdirSync(qdir).filter(f => /^q-.*\.js$/.test(f)).sort();
qfiles.forEach(f => load('data/' + f));
MLBank.build();

const E = window.Engine, B = window.MLBank;
const list = B.list();
const norm = s => String(s || '').replace(/[\s\u3000，。、；：""''（）()【】]/g, '').toLowerCase();

console.log('\n=== 题库总览 ===');
console.log('文件：' + qfiles.join(', '));
console.log('可用题量：' + list.length + ' 题');

const bySubj = {}, byType = {};
E.subjects.forEach(s => { bySubj[s.id] = list.filter(q => q.subject === s.id); });
list.forEach(q => { byType[q.type] = (byType[q.type] || 0) + 1; });
console.log('\n学科分布：');
E.subjects.forEach(s => {
  const qs = bySubj[s.id];
  const kps = new Set(qs.map(q => q.kpId));
  const total = E.subjKps[s.id].length;
  console.log(`  ${s.name.padEnd(5)} ${String(qs.length).padStart(3)} 题   覆盖 ${String(kps.size).padStart(3)}/${String(total).padEnd(3)} 考点 (${String(Math.round(kps.size / total * 100)).padStart(3)}%)   考纲占分 ${Math.round(s.share * 100)}%`);
});
console.log('\n题型分布：' + Object.keys(byType).map(t => t + ' ' + byType[t]).join(' · '));

// 未覆盖考点
console.log('\n未覆盖考点：');
let gapTotal = 0;
E.subjects.forEach(s => {
  const covered = new Set(bySubj[s.id].map(q => q.kpId));
  const miss = E.subjKps[s.id].filter(kp => !covered.has(kp.id));
  gapTotal += miss.length;
  if (miss.length) {
    console.log(`  ${s.name}（${miss.length}）：` + miss.map(k => k.chapter + '/' + k.name).join('；'));
  }
});
if (!gapTotal) console.log('  无，203 个考点全覆盖 ✓');

// 跨文件重复题干
const seen = {}, dups = [];
list.forEach(q => {
  const k = norm(q.stem).slice(0, 40);
  if (seen[k]) dups.push(seen[k] + ' ↔ ' + q.id);
  else seen[k] = q.id;
});
console.log('\n跨文件重复题干：' + (dups.length ? dups.length + ' 组' : '无 ✓'));
dups.slice(0, 10).forEach(d => console.log('  ' + d));

// 选项数规范（依据 2015/2023/2024 年 306 真题：A/B/X 型均为 4 个选项 A-D）
const badOpt = [];
list.forEach(q => {
  const n = (q.options || []).length;
  const st = q.style || 'cn306';
  if (st !== 'cn306') { if (n !== 5) badOpt.push(q.id + '（' + st + ' 应 5 项，实际 ' + n + '）'); return; }
  if (n !== 4) badOpt.push(q.id + '（306 应 4 项，实际 ' + n + '）');
});
console.log('选项数规范：' + (badOpt.length ? '✗ ' + badOpt.length + ' 题' : '全部符合（306 全卷 4 项 A-D / 变式 5 项）✓'));
badOpt.slice(0, 12).forEach(b => console.log('  - ' + b));

// 审核表 CSV
const esc = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
const head = ['序号', '编号', '学科', '章节', '考点', '题型', '题源', '难度', '题干', '选项A', '选项B', '选项C', '选项D', '选项E', '正确答案', '解析', '记忆点', '来源'];
const rows = list.map((q, i) => {
  const opt = q.options || [];
  const ans = q.answer.map(a => 'ABCDEFG'[a]).join('');
  return [
    i + 1, q.id, E.SUBJ[q.subject] ? E.SUBJ[q.subject].name : q.subject, q.chapter, q.kp, q.type,
    (E.STYLES[q.style] || {}).name || q.style, q.difficulty,
    q.stem, opt[0] || '', opt[1] || '', opt[2] || '', opt[3] || '', opt[4] || '',
    ans, q.explain, q.tip || '', q.source
  ].map(esc).join(',');
});
const outDir = path.join(ROOT, 'docs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
const outFile = path.join(outDir, '题库审核表.csv');
fs.writeFileSync(outFile, '\uFEFF' + [head.map(esc).join(','), ...rows].join('\r\n'), 'utf8');
console.log('\n审核表已导出：' + path.relative(ROOT, outFile) + '（' + list.length + ' 行）');

// 组卷能力
console.log('\n组卷能力：');
[[30, '迷你模考'], [165, '全真模考']].forEach(([n, name]) => {
  const r = E.composeMock({ mastery: {}, qstats: {}, profile: {}, logs: {} }, n);
  console.log(`  ${name}（${n} 题）：可组 ${r.got} 题，缺口 ${r.missing.length} → ${r.ok ? '可开考' : '需补题库'}`);
});
console.log('');
