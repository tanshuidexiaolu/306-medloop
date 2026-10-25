/* ==========================================================================
 * 306 西综训练台 · 学习引擎 v0.2
 * 职责：大纲索引 / 掌握度 / 记忆保持率 / 截止日倒推 / 可行性 / 组卷 / 分数预测
 *          / 多题源（306 · 执业医师 · USMLE · 日本医师）与风格迁移度
 * 纯状态变换，便于日后替换为后端模型。
 * ========================================================================== */
window.Engine = (function () {
  'use strict';

  var CUR = window.ML_CURRICULUM;
  var STYLES = window.ML_STYLES || { cn306: { name: '306 统考', short: '306', color: '#2f6bff' } };
  var DAY = 864e5;
  var AVG_MIN = 3.5;           // 平均每题分钟（含看解析）
  var EXTERNAL = ['cn_practice', 'usmle', 'jp'];
  var clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };

  /* ---------------- 大纲索引 ---------------- */
  var subjects = CUR.subjects;
  var SUBJ = {}; subjects.forEach(function (s) { SUBJ[s.id] = s; });
  var chapters = [], chapterById = {}, kps = [], kpById = {}, subjKps = {};

  subjects.forEach(function (s) {
    subjKps[s.id] = [];
    s.chapters.forEach(function (ch, ci) {
      var cid = s.id + '::' + ch.name;
      var c = { id: cid, subject: s.id, name: ch.name, index: ci, kps: [] };
      chapterById[cid] = c; chapters.push(c);
      ch.kps.forEach(function (kn) {
        var kp = { id: cid + '::' + kn, subject: s.id, chapter: ch.name, chapterId: cid, name: kn };
        kpById[kp.id] = kp; kps.push(kp); c.kps.push(kp); subjKps[s.id].push(kp);
      });
    });
  });

  var norm = function (str) {
    return String(str == null ? '' : str)
      .replace(/[\s\u3000·・,，、;；:：()（）\[\]【】\-—_\/]/g, '')
      .toLowerCase();
  };
  var aliasBySubject = {};
  kps.forEach(function (kp) {
    var k = kp.subject + '|' + norm(kp.name);
    if (!aliasBySubject[k]) aliasBySubject[k] = kp;
  });
  var aliasGlobal = {};
  kps.forEach(function (kp) { if (!aliasGlobal[norm(kp.name)]) aliasGlobal[norm(kp.name)] = kp; });

  function resolve(subject, chapter, kpName) {
    var c = chapterById[subject + '::' + chapter];
    if (c) {
      var exact = c.kps.filter(function (k) { return norm(k.name) === norm(kpName); })[0];
      if (exact) return exact;
      var fuzzy = c.kps.filter(function (k) {
        return norm(k.name).indexOf(norm(kpName)) >= 0 || norm(kpName).indexOf(norm(k.name)) >= 0;
      })[0];
      if (fuzzy) return fuzzy;
    }
    if (SUBJ[subject]) {
      var byName = aliasBySubject[subject + '|' + norm(kpName)];
      if (byName) return byName;
    }
    return aliasGlobal[norm(kpName)] || null;
  }

  function kpLabel(kpId) {
    var kp = kpById[kpId];
    return kp ? SUBJ[kp.subject].name + ' · ' + kp.chapter + ' / ' + kp.name : '未归类考点';
  }
  function chapterLabel(cid) {
    var c = chapterById[cid];
    return c ? SUBJ[c.subject].name + ' · ' + c.name : '未归类章节';
  }
  function subjectOf(kpId) { var kp = kpById[kpId]; return kp ? kp.subject : null; }

  /* ---------------- 参数 ---------------- */
  var DEFAULTS = { prior: 0.42, up: 0.22, down: 0.30, sUp: 1.70, sDown: 0.50, sMax: 90, dueAt: 0.78, mastered: 0.75 };
  function cfg(state) {
    var p = (state && state.profile) || {};
    var c = Object.assign({}, DEFAULTS, p.cfg || {});
    if (typeof p.masterLine === 'number') c.mastered = p.masterLine;
    return c;
  }
  function priorFor(state, subjectId) {
    var base = state && state.profile && state.profile.base ? state.profile.base[subjectId] : null;
    var b = typeof base === 'number' ? base : 45;
    return clamp(0.18 + (b / 100) * 0.62, 0.15, 0.85);
  }

  /* ---------------- 掌握度 / 记忆 ---------------- */
  function mastery(state, kpId) {
    var st = state.mastery[kpId];
    if (st) return st.m;
    return priorFor(state, subjectOf(kpId));
  }
  function retention(state, kpId, now) {
    now = now || Date.now();
    var st = state.mastery[kpId];
    if (!st || !st.last || !st.n) return 0;
    var days = Math.max(0, (now - st.last) / DAY);
    return clamp(Math.exp(-days / Math.max(0.4, st.S)), 0.02, 0.995);
  }
  function status(state, kpId, now) {
    var st = state.mastery[kpId];
    if (!st || !st.n) return 'new';
    var c = cfg(state), r = retention(state, kpId, now), m = st.m;
    if (r < c.dueAt) return 'due';
    if (m < 0.5) return 'weak';
    if (m >= c.mastered) return 'mastered';
    return 'learning';
  }
  var STATUS_TEXT = {
    new: { t: '未学习', cls: 'tag-soft' },
    due: { t: '待复习', cls: 'pill warn' },
    weak: { t: '薄弱', cls: 'pill danger' },
    learning: { t: '巩固中', cls: 'pill primary' },
    mastered: { t: '已掌握', cls: 'pill ok' }
  };

  function priority(state, kpId, now) {
    now = now || Date.now();
    var m = mastery(state, kpId);
    var st = state.mastery[kpId];
    var r = retention(state, kpId, now);
    var s = SUBJ[subjectOf(kpId)];
    var share = s ? s.share : 0.1;
    var stale = st && st.last ? clamp((now - st.last) / DAY / 14, 0, 1) : 1;
    var forget = st && st.n ? 1 - r : 0;
    var wrongRate = st && st.n ? (st.wrong || 0) / Math.max(1, st.n) : 0;
    return ((1 - m) * 0.45 + forget * 0.35 + wrongRate * 0.15 + stale * 0.05) * (0.55 + share * 1.5);
  }

  function updateAnswer(state, kpId, correct, difficulty, now) {
    now = now || Date.now();
    var c = cfg(state);
    var d = clamp(difficulty == null ? 0.5 : difficulty, 0.2, 0.9);
    var st = state.mastery[kpId];
    if (!st) st = state.mastery[kpId] = { m: priorFor(state, subjectOf(kpId)), n: 0, wrong: 0, last: 0, S: 1.8, streak: 0 };
    if (correct) {
      st.m = clamp(st.m + c.up * (1 - st.m) * (0.7 + d * 0.6), 0.02, 0.99);
      st.S = clamp(Math.max(st.S, 0.8) * (c.sUp + d * 0.35), 0.6, c.sMax);
      st.streak = (st.streak || 0) + 1;
    } else {
      st.m = clamp(st.m - c.down * st.m * (0.5 + (1 - d) * 0.8), 0.02, 0.99);
      st.S = clamp(Math.max(st.S, 0.8) * c.sDown, 0.45, c.sMax);
      st.streak = 0; st.wrong = (st.wrong || 0) + 1;
    }
    st.n = (st.n || 0) + 1; st.last = now;
    return st;
  }

  function pCorrect(state, q) {
    var m = mastery(state, q.kpId);
    return 1 / (1 + Math.exp(-((m - q.difficulty) * 7 + 0.35)));
  }

  /* ---------------- 统计 ---------------- */
  /**
   * 学科统计
   * m       = 已学考点的平均掌握度（没有已学考点时为 0，不混入自评先验）
   * mTotal  = 全科掌握度 = 已学平均 × 覆盖率（未学按 0 计），图谱/进度用它
   * mAll    = 含先验的全科估算（仅用于分数预测）
   * coverage= 已学考点 / 总考点
   */
  function subjectStat(state, subjectId, now) {
    now = now || Date.now();
    var list = subjKps[subjectId], sumAll = 0, sumLearned = 0, learned = 0, weak = 0, due = 0;
    list.forEach(function (kp) {
      var m = mastery(state, kp.id);
      sumAll += m;
      var st = state.mastery[kp.id];
      if (st && st.n) { learned++; sumLearned += st.m; }
      var s = status(state, kp.id, now);
      if (s === 'weak') weak++;
      if (s === 'due') due++;
    });
    var total = Math.max(1, list.length);
    return {
      id: subjectId, name: SUBJ[subjectId].name, color: SUBJ[subjectId].color, share: SUBJ[subjectId].share,
      m: learned ? sumLearned / learned : 0,
      mTotal: learned ? sumLearned / total : 0,
      mAll: sumAll / total,
      prior: priorFor(state, subjectId),
      learned: learned, total: list.length,
      weak: weak, due: due, coverage: learned / total
    };
  }

  function rankChapters(state, now, subjectId) {
    now = now || Date.now();
    var list = subjectId ? chapters.filter(function (c) { return c.subject === subjectId; }) : chapters;
    return list.map(function (c) {
      var sum = 0, weak = 0, due = 0, learned = 0;
      c.kps.forEach(function (kp) {
        sum += mastery(state, kp.id);
        var st = state.mastery[kp.id];
        if (st && st.n) learned++;
        var s = status(state, kp.id, now);
        if (s === 'weak') weak++;
        if (s === 'due') due++;
      });
      return { id: c.id, subject: c.subject, name: c.name, m: sum / Math.max(1, c.kps.length), weak: weak, due: due, learned: learned, total: c.kps.length };
    }).sort(function (a, b) { return a.m - b.m; });
  }

  function dueKps(state, now) {
    now = now || Date.now();
    var c = cfg(state);
    return kps.map(function (kp) {
      var st = state.mastery[kp.id];
      if (!st || !st.n) return null;
      var r = retention(state, kp.id, now);
      if (r >= c.dueAt) return null;
      return { kpId: kp.id, r: r, m: st.m, p: priority(state, kp.id, now) };
    }).filter(Boolean).sort(function (a, b) { return b.p - a.p; });
  }

  /* ---------------- 多题源：风格统计与迁移度 ---------------- */
  function styleStats(state, kpId) {
    return (state.styleStats && state.styleStats[kpId]) || null;
  }
  /** 迁移度 = 非 306 风格正确率 ÷ 306 风格正确率；样本不足返回 null */
  function styleTransfer(state, kpId) {
    var ss = styleStats(state, kpId);
    if (!ss) return null;
    var base = ss.cn306 || { n: 0, c: 0 }, ext = { n: 0, c: 0 };
    EXTERNAL.forEach(function (k) { if (ss[k]) { ext.n += ss[k].n || 0; ext.c += ss[k].c || 0; } });
    if ((base.n || 0) < 2 || ext.n < 2) return null;
    var r1 = base.c / base.n, r2 = ext.c / ext.n;
    if (!(r1 > 0)) return null;
    return { value: r2 / r1, base: r1, ext: r2, n: base.n + ext.n };
  }
  function styleTotals(state) {
    var out = {};
    Object.keys(STYLES).forEach(function (s) { out[s] = { n: 0, c: 0 }; });
    var ss = state.styleStats || {};
    Object.keys(ss).forEach(function (kpId) {
      Object.keys(ss[kpId]).forEach(function (s) {
        if (!out[s]) out[s] = { n: 0, c: 0 };
        out[s].n += ss[kpId][s].n || 0;
        out[s].c += ss[kpId][s].c || 0;
      });
    });
    return out;
  }

  /* ---------------- 分数预测 ---------------- */
  /**
   * 预测分 = Σ 学科满分 × (已学部分按真实掌握度 + 未学部分按自评先验)
   * 样本不足时（已学考点 <20 且 已答题 <40）标记 enough=false，界面不展示具体分数
   * 区间宽度随样本量收缩：样本越少，区间越宽
   */
  function predictScore(state) {
    var answered = 0, learnedKps = 0;
    Object.keys(state.qstats || {}).forEach(function (k) { answered += (state.qstats[k].seen || 0); });
    Object.keys(state.mastery || {}).forEach(function (k) { if (state.mastery[k] && state.mastery[k].n) learnedKps++; });

    var bySubject = subjects.map(function (s) {
      var st = subjectStat(state, s.id);
      var full = 300 * s.share;
      // 已学：真实掌握度；未学：自评先验
      var est = st.coverage * st.m + (1 - st.coverage) * st.prior;
      var mig = [];
      subjKps[s.id].forEach(function (kp) { var t = styleTransfer(state, kp.id); if (t) mig.push(t.value); });
      var factor = mig.length ? clamp(mig.reduce(function (a, b) { return a + b; }, 0) / mig.length, 0.85, 1) : 1;
      var score = full * (0.16 + 0.84 * est) * factor;
      return {
        id: s.id, name: s.name, color: s.color, score: score, max: full,
        m: st.m, mAll: st.mAll, coverage: st.coverage, learned: st.learned, total: st.total,
        hasData: st.learned >= 5, migration: factor, migSamples: mig.length
      };
    });

    var total = bySubject.reduce(function (a, b) { return a + b.score; }, 0);
    var avgCov = bySubject.reduce(function (a, b) { return a + b.coverage; }, 0) / bySubject.length;
    var conf = clamp(answered / 90, 0, 1) * 0.65 + clamp(avgCov / 0.7, 0, 1) * 0.35;
    var half = Math.round(14 + 56 * (1 - conf));
    var withMig = bySubject.filter(function (x) { return x.migSamples; });
    return {
      total: clamp(total, 0, 300),
      range: [Math.max(0, Math.round(total - half)), Math.min(300, Math.round(total + half))],
      enough: learnedKps >= 20 || answered >= 40,
      answered: answered, learnedKps: learnedKps, coverage: avgCov, confidence: conf,
      bySubject: bySubject,
      migrationFactor: withMig.length ? withMig.reduce(function (a, b) { return a + b.migration; }, 0) / withMig.length : 1
    };
  }

  /* ---------------- 复习截止日：剩余工作量 / 可行性 ---------------- */
  var WORK_WEIGHT = { new: 4, weak: 3, due: 1.5, learning: 1.5, mastered: 0 };

  function deadlineInfo(state) {
    var p = (state && state.profile) || {};
    var date = p.deadline || CUR.exam.date;
    var time = p.deadlineTime || '23:59';
    var target = new Date(date + 'T' + time + ':00');
    if (isNaN(target.getTime())) target = new Date(date + 'T23:59:00');
    var now = Date.now(), ms = target - now;
    return { date: date, time: time, target: target, days: Math.max(0, Math.ceil(ms / DAY)), ms: ms, passed: ms < 0 };
  }
  function effectiveDays(state) {
    var p = (state && state.profile) || {};
    var wd = (p.weekdays && p.weekdays.length) ? p.weekdays.length : 7;
    return Math.max(1, Math.round(deadlineInfo(state).days * wd / 7));
  }
  function remainingWork(state, now) {
    now = now || Date.now();
    var r = { W: 0, W0: kps.length * 4, bySubject: {}, counts: { new: 0, weak: 0, due: 0, learning: 0, mastered: 0 } };
    kps.forEach(function (kp) {
      var s = status(state, kp.id, now);
      var w = WORK_WEIGHT[s] != null ? WORK_WEIGHT[s] : 4;
      r.W += w; r.counts[s] = (r.counts[s] || 0) + 1;
      r.bySubject[kp.subject] = (r.bySubject[kp.subject] || 0) + w;
    });
    return r;
  }
  function progressInfo(state) {
    var p = (state && state.profile) || {};
    var rw = remainingWork(state);
    var W0 = rw.W0 || 1;
    var done = clamp((W0 - rw.W) / W0, 0, 1);
    var dl = deadlineInfo(state);
    var setAt = p.deadlineSetAt || state.createdAt || Date.now();
    var span = p.deadlineSpanDays || Math.max(1, Math.ceil((dl.target.getTime() - setAt) / DAY));
    var elapsed = clamp((Date.now() - setAt) / DAY, 0, span);
    var expected = clamp(elapsed / span, 0, 1);
    return { done: done, expected: expected, gap: done - expected, W: rw.W, W0: W0 };
  }
  function feasibility(state) {
    var p = (state && state.profile) || {};
    var rw = remainingWork(state);
    var D = effectiveDays(state);
    var need = rw.W / D;
    var cap = Math.max(2, (p.dailyMinutes || 150) / AVG_MIN);
    var F = rw.W <= 0 ? 99 : cap / Math.max(0.01, need);
    var todayCount = rw.W <= 0 ? 0 : Math.ceil(Math.min(need, cap));
    var label, cls, advice;
    if (rw.W <= 0) { label = '已达标'; cls = 'ok'; advice = '所有考点已达掌握线，可加变式题巩固'; }
    else if (F >= 1.3) { label = '宽松'; cls = 'ok'; advice = '节奏有余量，可增加变式题或提前完成'; }
    else if (F >= 1.0) { label = '紧张'; cls = 'warn'; advice = '刚好够用，保持节奏、不要再加量'; }
    else { label = '不可行'; cls = 'danger'; advice = '按当前截止日排不下，需要三选一'; }
    var sols = [];
    if (F < 1) {
      var alt = Math.ceil(rw.W / cap);
      sols = [
        { k: '① 延后截止日', v: '最早可行 ' + dayKey(Date.now() + alt * DAY) + '（约 ' + alt + ' 个学习日）' },
        { k: '② 增加每日时长', v: '至少 ' + Math.ceil(need * AVG_MIN) + ' 分钟/天（当前 ' + (p.dailyMinutes || 150) + '）' },
        { k: '③ 降低达标线', v: '掌握线 0.75 → 0.65，约少覆盖 15~20% 考点' }
      ];
    }
    return {
      W: rw.W, W0: rw.W0, D: D, need: need, cap: cap, F: F, label: label, cls: cls,
      advice: advice, todayCount: todayCount, solutions: sols,
      needMinutes: Math.ceil(need * AVG_MIN), counts: rw.counts
    };
  }
  function pace(state) {
    var sum = 0;
    for (var i = 0; i < 7; i++) {
      var lg = state.logs[dayKey(Date.now() - i * DAY)];
      if (lg) sum += lg.answered || 0;
    }
    var v = sum / 7;
    var wd = ((state.profile.weekdays || []).length) || 7;
    var rho = wd / 7;
    var rw = remainingWork(state);
    var days = v > 0.3 ? Math.ceil(rw.W / Math.max(0.5, v * Math.max(rho, 0.2))) : null;
    return { perDay: Math.round(v * 10) / 10, etaDays: days, eta: days != null ? Date.now() + days * DAY : null };
  }

  /* ---------------- 组卷 ---------------- */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  }
  var TYPE_ORDER = ['A1', 'A2', 'B', 'X', 'X2'];
  function estMinutes(types) {
    var t = 0; types.forEach(function (x) { t += (window.ML_TYPES[x] || { min: 1.5 }).min; });
    return t;
  }
  function expandBGroup(list) {
    var bank = window.MLBank ? window.MLBank.list() : [];
    var seen = {}, out = [];
    list.forEach(function (q) { if (!seen[q.id]) { seen[q.id] = 1; out.push(q); } });
    list.forEach(function (q) {
      if (q.type === 'B' && q.bgroup) {
        bank.forEach(function (o) { if (o.bgroup === q.bgroup && !seen[o.id]) { seen[o.id] = 1; out.push(o); } });
      }
    });
    out.sort(function (a, b) {
      if (a.bgroup && a.bgroup === b.bgroup) return (a.bindex || 0) - (b.bindex || 0);
      var ta = TYPE_ORDER.indexOf(a.type), tb = TYPE_ORDER.indexOf(b.type);
      if (ta !== tb) return ta - tb;
      return hash(a.id) - hash(b.id);
    });
    return out;
  }
  function scoreQ(state, q, now) {
    var p = pCorrect(state, q);
    var fit = 1 - Math.abs(clamp(p, 0, 1) - 0.65);
    var rec = state.qstats[q.id];
    var recency = rec && rec.last ? clamp(1 - (now - rec.last) / DAY / 5, 0, 1) : 0;
    var s = priority(state, q.kpId, now) * 1.7 + fit * 1.5 - recency * 0.9 + (hash(q.id) % 100) / 100 * 0.5;
    if (q.style && q.style !== 'cn306') {
      var t = styleTransfer(state, q.kpId);
      if (t && t.value < 0.7) s *= 1.6;
      else if (!t) s *= 1.3;
    }
    return s;
  }
  function takeRanked(state, pool, n, exclude, jitter) {
    if (n <= 0 || !pool.length) return [];
    var now = Date.now();
    if (jitter == null) jitter = 0.45;   // 随机扰动：同分题每次打开顺序不同
    var arr = pool.filter(function (q) { return !(exclude && exclude[q.id]); })
      .map(function (q) { return { q: q, s: scoreQ(state, q, now) + Math.random() * jitter }; })
      .sort(function (a, b) { return b.s - a.s; });
    var out = [], perKp = {};
    for (var i = 0; i < arr.length && out.length < n; i++) {
      var it = arr[i];
      if ((perKp[it.q.kpId] || 0) >= 2) continue;
      out.push(it.q); perKp[it.q.kpId] = (perKp[it.q.kpId] || 0) + 1;
    }
    for (var j = 0; j < arr.length && out.length < n; j++) { if (out.indexOf(arr[j].q) < 0) out.push(arr[j].q); }
    return out;
  }
  function idsOf(list) { var o = {}; list.forEach(function (q) { o[q.id] = 1; }); return o; }

  /**
   * 智能抽题
   * opt: {subjects, chapters, kpIds, types, styles, count, excludeIds,
   *       mixExtRatio 变式题占比, allowBeyond 是否允许大纲外拓展题}
   */
  function pickQuestions(state, opt) {
    opt = opt || {};
    var bank = window.MLBank ? window.MLBank.list() : [];
    var pool = bank.filter(function (q) {
      if (!opt.allowBeyond && q.beyond) return false;
      if (opt.excludeIds && opt.excludeIds.indexOf(q.id) >= 0) return false;
      if (opt.subjects && opt.subjects.length && opt.subjects.indexOf(q.subject) < 0) return false;
      if (opt.chapters && opt.chapters.length && opt.chapters.indexOf(q.chapterId) < 0) return false;
      if (opt.styles && opt.styles.length && opt.styles.indexOf(q.style) < 0) return false;
      if (opt.types && opt.types.length && opt.types.indexOf(q.type) < 0) return false;
      return true;
    });
    if (opt.kpIds && opt.kpIds.length) {
      var ks = {}; opt.kpIds.forEach(function (i) { ks[i] = 1; });
      var sub = pool.filter(function (q) { return ks[q.kpId]; });
      if (sub.length >= Math.min(3, opt.count || 5)) pool = sub;
    }
    if (!pool.length) return [];
    var count = opt.count || 10, out = [];
    var explicitStyles = !!(opt.styles && opt.styles.length);

    if (!explicitStyles && opt.mixExtRatio > 0) {
      var extCount = Math.round(count * clamp(opt.mixExtRatio, 0, 0.6));
      var extPool = pool.filter(function (q) { return q.style !== 'cn306'; });
      var mainPool = pool.filter(function (q) { return q.style === 'cn306'; });
      var ext = takeRanked(state, extPool, Math.min(extCount, extPool.length), {}, opt.jitter);
      out = out.concat(ext);
      var rest = takeRanked(state, mainPool, count - out.length, idsOf(out), opt.jitter);
      out = out.concat(rest);
      if (out.length < count) out = out.concat(takeRanked(state, pool, count - out.length, idsOf(out), opt.jitter));
    } else {
      out = takeRanked(state, pool, count, {}, opt.jitter);
    }
    return expandBGroup(out);
  }

  /** 按考纲结构生成 306 模考试卷（只取 306 题源；含缺口报告） */
  function composeMock(state, size) {
    var bank = (window.MLBank ? window.MLBank.list() : []).filter(function (q) { return q.style === 'cn306' && !q.beyond; });
    var paper = CUR.exam.paper;
    var totalQ = paper.reduce(function (a, p) { return a + p.count; }, 0);
    size = size || 30;
    var slots = [];
    paper.forEach(function (p) {
      var n = size >= totalQ ? p.count : Math.max(1, Math.round(size * p.count / totalQ));
      var raw = subjects.map(function (s) { return s.share * n; });
      var alloc = raw.map(function (x) { return Math.floor(x); });
      var rest = n - alloc.reduce(function (a, b) { return a + b; }, 0);
      var order = raw.map(function (x, i) { return { i: i, f: x - Math.floor(x) }; }).sort(function (a, b) { return b.f - a.f; });
      for (var k = 0; k < rest; k++) alloc[order[k % order.length].i]++;
      subjects.forEach(function (s, i) {
        for (var c = 0; c < alloc[i]; c++) slots.push({ type: p.type, subject: s.id, per: p.per });
      });
    });

    var used = {}, items = [], missing = [], approx = 0;
    var byType = {};
    bank.forEach(function (q) { (byType[q.type + '|' + q.subject] = byType[q.type + '|' + q.subject] || []).push(q); });
    var pick = function (cand, slot) {
      if (!cand.length) return false;
      var best = null, bs = -1e9;
      cand.forEach(function (q) {
        var s = priority(state, q.kpId) + Math.random() * 0.7;   // 模考同样随机抽取
        if (s > bs) { bs = s; best = q; }
      });
      used[best.id] = 1; items.push({ q: best, per: slot.per }); return true;
    };
    var unfilled = [];
    slots.forEach(function (slot) {
      if (!pick((byType[slot.type + '|' + slot.subject] || []).filter(function (q) { return !used[q.id]; }), slot)) unfilled.push(slot);
    });
    unfilled.forEach(function (slot) {
      var fill = bank.filter(function (q) { return !used[q.id] && q.type === slot.type; });
      if (pick(fill, slot)) { approx++; return; }
      fill = bank.filter(function (q) { return !used[q.id]; });
      if (pick(fill, slot)) { approx++; return; }
      missing.push(slot);
    });
    items.sort(function (a, b) {
      var ta = TYPE_ORDER.indexOf(a.q.type), tb = TYPE_ORDER.indexOf(b.q.type);
      return ta - tb || hash(a.q.id) - hash(b.q.id);
    });
    return { items: items, missing: missing, approx: approx, ok: items.length >= size, size: size, need: size, got: items.length };
  }

  /* ---------------- 每日计划（截止日倒推） ---------------- */
  function buildPlan(state, now) {
    now = now || Date.now();
    var c = cfg(state);
    var p = state.profile || {};
    var f = feasibility(state);
    var mins = clamp(p.dailyMinutes || 150, 30, 480);
    var target = Math.max(1, f.todayCount);
    var due = dueKps(state, now);
    var ranks = rankChapters(state, now);
    var tight = f.F < 1.15;
    var rRatio = tight ? 0.20 : 0.26;
    var wRatio = tight ? 0.50 : 0.40;
    var mixExt = typeof p.styleMixRatio === 'number' ? p.styleMixRatio : 0.15;
    var blocks = [];

    var reviewN = due.length ? Math.min(due.length, Math.max(2, Math.round(target * rRatio))) : 0;
    if (reviewN) {
      blocks.push({
        id: 'review', kind: 'review', icon: 'rotate', color: 'warn',
        title: '遗忘曲线复习', minutes: Math.max(8, Math.round(mins * rRatio)), count: reviewN,
        types: ['A1', 'B'], styles: null, kpIds: due.slice(0, 14).map(function (d) { return d.kpId; }),
        subjectIds: Array.from(new Set(due.slice(0, 14).map(function (d) { return subjectOf(d.kpId); }))),
        reason: '记忆保持率已跌破 ' + Math.round(c.dueAt * 100) + '%：' +
          due.slice(0, 2).map(function (d) { return kpById[d.kpId].name; }).join('、') + ' 等 ' + due.length + ' 个考点待唤醒'
      });
    }

    var weakCh = ranks.filter(function (r) { return r.m < Math.max(0.62, c.mastered - 0.1); }).slice(0, 3);
    var wKps = [];
    weakCh.forEach(function (ch) {
      chapterById[ch.id].kps.forEach(function (kp) { if (status(state, kp.id, now) !== 'mastered') wKps.push(kp.id); });
    });
    var weakN = Math.max(2, Math.round(target * (reviewN ? wRatio : 0.55)));
    blocks.push({
      id: 'weak', kind: 'weak', icon: 'target', color: 'primary',
      title: '短板突破', minutes: Math.max(10, Math.round(mins * (reviewN ? wRatio : 0.55))), count: weakN,
      types: ['A1', 'A2', 'X'], styles: null, kpIds: wKps.slice(0, 24),
      subjectIds: Array.from(new Set(weakCh.map(function (r) { return r.subject; }))),
      reason: weakCh.length
        ? '掌握度最低：' + weakCh.map(function (r) { return SUBJ[r.subject].name + '·' + r.name + ' ' + Math.round(r.m * 100) + '%'; }).join('；')
        : '全科已达标，转入高强度综合训练'
    });

    var mixN = Math.max(2, target - reviewN - weakN);
    blocks.push({
      id: 'mix', kind: 'mix', icon: 'layers', color: 'accent',
      title: '跨章综合 + 变式', minutes: Math.max(10, Math.round(mins * (tight ? 0.30 : 0.34))), count: mixN,
      types: ['A2', 'X'], styles: null, mixExtRatio: mixExt, kpIds: [],
      subjectIds: ['internal', 'surgery'],
      reason: '按考纲权重（内科 33% / 外科 23%）抽病例题与多选题' +
        (mixExt > 0 ? '，并掺入约 ' + Math.round(mixExt * 100) + '% 的非 306 变式题检验是否真懂' : '')
    });
    return { date: dayKey(now), minutes: mins, target: target, feasibility: f, tight: tight, blocks: blocks };
  }

  /* ---------------- 答题记录 ---------------- */
  function applyAnswer(state, q, chosen, now) {
    now = now || Date.now();
    var ans = q.answer.slice().sort(function (a, b) { return a - b; });
    var sel = (chosen || []).slice().sort(function (a, b) { return a - b; });
    var correct = ans.length === sel.length && ans.every(function (v, i) { return v === sel[i]; });
    var style = q.style || 'cn306';

    if (!q.beyond) {
      updateAnswer(state, q.kpId, correct, q.difficulty, now);
      var ss = state.styleStats[q.kpId] || (state.styleStats[q.kpId] = {});
      var rec = ss[style] || (ss[style] = { n: 0, c: 0 });
      rec.n++; if (correct) rec.c++;
    }
    var qs = state.qstats[q.id] || (state.qstats[q.id] = { seen: 0, correct: 0, last: 0, wrong: 0 });
    qs.seen++; qs.last = now;
    if (correct) qs.correct++; else { qs.wrong = (qs.wrong || 0) + 1; qs.lastWrong = now; }

    var d = dayKey(now);
    var log = state.logs[d] || (state.logs[d] = { minutes: 0, answered: 0, correct: 0 });
    log.answered++; if (correct) log.correct++;

    return { correct: correct, answer: ans };
  }

  function answerText(q) {
    var letters = 'ABCDEFG';
    return q.answer.slice().sort(function (a, b) { return a - b; }).map(function (i) { return letters[i]; }).join('、');
  }
  function addMinutes(state, minutes, now) {
    now = now || Date.now();
    var d = dayKey(now);
    var log = state.logs[d] || (state.logs[d] = { minutes: 0, answered: 0, correct: 0 });
    log.minutes = Math.round((log.minutes || 0) + Math.max(0, minutes));
  }
  function dayKey(ts) {
    var d = ts instanceof Date ? ts : new Date(ts == null ? Date.now() : ts);
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }
  function daysBetween(a, b) { return Math.round((b - a) / DAY); }
  function countdown(dateStr) {
    var target = new Date(dateStr + 'T23:59:00').getTime();
    return { days: Math.max(0, Math.ceil((target - Date.now()) / DAY)), passed: target < Date.now() };
  }
  function streak(state) {
    var n = 0, d = new Date();
    for (var i = 0; i < 400; i++) {
      var log = state.logs[dayKey(d)];
      if (log && log.answered > 0) { n++; d.setDate(d.getDate() - 1); }
      else if (i === 0) d.setDate(d.getDate() - 1);
      else break;
    }
    return n;
  }

  return {
    CUR: CUR, subjects: subjects, SUBJ: SUBJ, chapters: chapters, chapterById: chapterById,
    kps: kps, kpById: kpById, subjKps: subjKps, types: window.ML_TYPES, STYLES: STYLES,
    AVG_MIN: AVG_MIN, WORK_WEIGHT: WORK_WEIGHT, TYPE_ORDER: TYPE_ORDER,
    resolve: resolve, kpLabel: kpLabel, chapterLabel: chapterLabel, subjectOf: subjectOf,
    cfg: cfg, priorFor: priorFor, mastery: mastery, retention: retention, status: status, STATUS_TEXT: STATUS_TEXT,
    priority: priority, updateAnswer: updateAnswer, pCorrect: pCorrect,
    subjectStat: subjectStat, rankChapters: rankChapters, dueKps: dueKps, predictScore: predictScore,
    styleStats: styleStats, styleTransfer: styleTransfer, styleTotals: styleTotals,
    deadlineInfo: deadlineInfo, effectiveDays: effectiveDays, remainingWork: remainingWork,
    progressInfo: progressInfo, feasibility: feasibility, pace: pace,
    pickQuestions: pickQuestions, composeMock: composeMock, buildPlan: buildPlan, expandBGroup: expandBGroup,
    applyAnswer: applyAnswer, answerText: answerText, addMinutes: addMinutes,
    dayKey: dayKey, daysBetween: daysBetween, countdown: countdown, streak: streak,
    clamp: clamp, round: Math.round, hash: hash, estMinutes: estMinutes
  };
})();
