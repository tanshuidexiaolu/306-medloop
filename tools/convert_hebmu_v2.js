/* 把未开始试卷抓到的生理/生化题转换入库（追加到既有 hebmu 题库） */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'hebmu');

global.window = global;
['js/data.js', 'js/engine.js'].forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const E = window.Engine;

const chapOf = { physiology: {}, biochem: {} };
['physiology', 'biochem'].forEach(sub => {
  E.chapters.filter(c => c.subject === sub).forEach(c => c.kps.forEach(k => { chapOf[sub][k.name] = c.name; }));
});

function loadMap(files) {
  const m = {};
  files.forEach(f => {
    const p = path.join(DIR, f);
    if (fs.existsSync(p)) Object.assign(m, JSON.parse(fs.readFileSync(p, 'utf8')));
  });
  return m;
}

function convert(list, subject, maps, prefix, existing) {
  const out = (existing || []).slice();
  const normStem = s => String(s || '').replace(/[\s，。、：；？！,.;:?!"'‘’“”()\[\]（）【】]/g, '').toLowerCase();
  const seen = new Set(out.map(q => normStem(q.stem)));
  const skipped = [];
  list.forEach(q => {
    const kp = maps[q.qid] || '';
    if (!kp || !chapOf[subject][kp]) { skipped.push({ qid: q.qid, why: kp ? 'bad-kp:' + kp : 'no-kp' }); return; }
    const ns = normStem(q.stem);
    if (seen.has(ns)) { skipped.push({ qid: q.qid, why: 'dup-stem' }); return; }
    seen.add(ns);
    let opts = q.options.slice();
    const ansKey = String(q.answer || '').trim().toUpperCase();
    if (opts.length > 4) {
      let dropIdx = -1;
      for (let i = opts.length - 1; i >= 0; i--) {
        if (opts[i].key === ansKey) continue;
        if (/以上|都是|都不是|均/.test(opts[i].text)) { dropIdx = i; break; }
      }
      if (dropIdx < 0) for (let i = opts.length - 1; i >= 0; i--) { if (opts[i].key !== ansKey) { dropIdx = i; break; } }
      if (dropIdx < 0) dropIdx = opts.length - 1;
      opts.splice(dropIdx, 1);
    }
    if (opts.length !== 4) { skipped.push({ qid: q.qid, why: 'opts=' + opts.length }); return; }
    const ansIdx = opts.findIndex(o => o.key === ansKey);
    if (ansIdx < 0) { skipped.push({ qid: q.qid, why: 'ans=' + ansKey }); return; }
    out.push({
      id: prefix + '-' + String(out.length + 1).padStart(3, '0'),
      subject: subject,
      chapter: chapOf[subject][kp],
      kp: kp,
      style: 'cn306',
      type: (/患者|男[，,]|女[，,]|男性|女性/.test(q.stem) && q.stem.length > 45) ? 'A2' : 'A1',
      difficulty: 0.5,
      stem: q.stem.replace(/\s+/g, ' ').trim(),
      options: opts.map(o => o.text.replace(/^[A-Ea-e]\s*[\.、．:：]\s*/, '').replace(/\s+/g, ' ').trim()),
      answer: [ansIdx],
      explain: '原卷未附解析。正确答案：' + opts[ansIdx].text + '。本题由河北医科大学练习平台导出，建议对照人卫版教材核对相关机制与数值，并把其余选项与教材表述逐条比对，避免只记题干结论。',
      source: '河北医科大学练习平台（原卷）'
    });
  });
  return { out, skipped };
}

function loadExisting(file) {
  try {
    vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
    return Object.values(window.ML_QUESTION_PARTS).find(a => Array.isArray(a) && a.length && a[0].id && /^hebmu-/.test(a[0].id)) || [];
  } catch (e) { return []; }
}

function write(file, key, list) {
  const header = '/* 河北医科大学学生自主练习平台 · 原卷题（本地个人复习用；5 选项已按 306 口径裁为 4 选项；原卷无解析） */\n';
  fs.writeFileSync(file, header + 'window.ML_QUESTION_PARTS = window.ML_QUESTION_PARTS || {};\nwindow.ML_QUESTION_PARTS.' + key + ' = ' + JSON.stringify(list, null, 1) + ';\n', 'utf8');
  console.log('写入', file, list.length, '题');
}

const phys = JSON.parse(fs.readFileSync(path.join(DIR, 'merged-phys.json'), 'utf8'));
const bioc = JSON.parse(fs.readFileSync(path.join(DIR, 'merged-bioc.json'), 'utf8'));
const physMaps = loadMap(['kp-map-p1.json', 'kp-map-p2.json', 'kp-map-p3.json', 'kp-map-p4.json']);
const biocMaps = loadMap(['kp-map-b1.json', 'kp-map-b2.json']);

const oldPhys = loadExisting(path.join(ROOT, 'data', 'q-hebmu-phys.js'));
console.log('既有生理题:', oldPhys.length, '| 待转换生理:', phys.length, '| 待转换生化:', bioc.length);

const rPhys = convert(phys, 'physiology', physMaps, 'hebmu-phys', oldPhys);
write(path.join(ROOT, 'data', 'q-hebmu-phys.js'), 'hebmuPhys', rPhys.out);
const rBioc = convert(bioc, 'biochem', biocMaps, 'hebmu-bioc', []);
write(path.join(ROOT, 'data', 'q-hebmu-bioc.js'), 'hebmuBioc', rBioc.out);

console.log('生理跳过:', rPhys.skipped.length, '| 生化跳过:', rBioc.skipped.length);
const tally = l => { const o = {}; l.forEach(q => { o[q.kp] = (o[q.kp] || 0) + 1; }); return o; };
const p = tally(rPhys.out), b = tally(rBioc.out);
console.log('生理考点数:', Object.keys(p).length, '| 生化考点数:', Object.keys(b).length);
console.log('生化分布:', JSON.stringify(b, null, 1));
