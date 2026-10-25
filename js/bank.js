/* ==========================================================================
 * 306 西综训练台 · 题库装配层 v0.2
 * 支持四类题源：cn306（主线）/ cn_practice（执业医师）/ usmle / jp
 * 支持：病例串题(caseId)、选 N 项(chooseN)、否定提问(ask=negative)、
 *       大纲外拓展(beyond)、B 型配伍组(bgroup)
 * ========================================================================== */
window.MLBank = (function () {
  'use strict';
  var LETTERS = 'ABCDEFG';
  var TYPES = ['A1', 'A2', 'B', 'X', 'X2'];
  var STYLE_KEYS = Object.keys(window.ML_STYLES || { cn306: 1 });
  var all = [], list = [], byId = {}, rejected = [], report = null;

  function stripPrefix(s) {
    return String(s == null ? '' : s).replace(/^\s*[（(]?\s*[A-Ga-g]\s*[)）.、:：]\s*/, '').trim();
  }
  function toArr(v) {
    if (v == null) return [];
    if (Array.isArray(v)) return v.map(Number).filter(function (n) { return n === n; });
    if (typeof v === 'number') return [v];
    return String(v).split(/[,，、\s]+/).map(function (x) {
      x = x.trim();
      if (!x) return NaN;
      var i = LETTERS.indexOf(x.toUpperCase());
      return i >= 0 ? i : Number(x);
    }).filter(function (n) { return n === n; });
  }

  function normalize(raw, idx) {
    var errs = [];
    if (!raw || typeof raw !== 'object') return { errs: ['题目不是对象'] };

    var subject = String(raw.subject || '').trim();
    var type = String(raw.type || '').toUpperCase().trim();
    var style = String(raw.style || 'cn306').trim();
    if (!window.Engine.SUBJ[subject]) errs.push('未知学科 subject=' + subject);
    if (STYLE_KEYS.indexOf(style) < 0) { errs.push('未知题源 style=' + style); style = 'cn306'; }
    if (type && TYPES.indexOf(type) < 0) errs.push('未知题型 type=' + type);

    var options = (raw.options || []).map(stripPrefix).filter(function (x) { return x !== ''; });
    if (options.length < 3) errs.push('选项少于 3 个');

    var answer = toArr(raw.answer).filter(function (n) { return n >= 0 && n < options.length; });
    if (!answer.length) errs.push('answer 无法解析');
    answer.sort(function (a, b) { return a - b; });

    if (!type) type = answer.length > 1 ? 'X' : 'A1';
    var chooseN = Number(raw.chooseN || answer.length || 1);
    if (type === 'X2') chooseN = 2;
    if (answer.length !== chooseN) errs.push('chooseN=' + chooseN + ' 与正确项数 ' + answer.length + ' 不一致');
    if (type === 'X2' && answer.length !== 2) errs.push('X2 型（选 2 项）应有恰好 2 个正确项');
    if ((type === 'A1' || type === 'A2' || type === 'B') && answer.length > 1) {
      errs.push('单选题 ' + type + ' 只能有 1 个正确项');
    }

    var stem = String(raw.stem || '').trim();
    if (!stem) errs.push('缺少题干 stem');

    var kp = window.Engine.resolve(subject, raw.chapter, raw.kp);
    if (!kp) errs.push('考点未匹配：chapter=' + raw.chapter + ' / kp=' + raw.kp);

    var d = Number(raw.difficulty);
    if (!(d >= 0 && d <= 1)) d = 0.5;

    var q = {
      id: String(raw.id || ('auto-' + idx)),
      subject: subject,
      chapter: kp ? kp.chapter : String(raw.chapter || ''),
      chapterId: kp ? kp.chapterId : null,
      kp: kp ? kp.name : String(raw.kp || ''),
      kpId: kp ? kp.id : null,
      style: style,
      type: type,
      ask: raw.ask === 'negative' ? 'negative' : 'normal',
      chooseN: chooseN,
      beyond: !!raw.beyond,
      caseId: raw.caseId ? String(raw.caseId) : '',
      caseOrder: Number(raw.caseOrder || 0),
      caseText: String(raw.caseText || ''),
      difficulty: d,
      stem: stem,
      options: options,
      answer: answer,
      explain: String(raw.explain || ''),
      tip: raw.tip ? String(raw.tip) : '',
      source: String(raw.source || '未标注'),
      bgroup: raw.bgroup ? String(raw.bgroup) : '',
      bindex: Number(raw.bindex || idx),
      _order: idx,
      _issues: errs
    };
    return { q: q, errs: errs };
  }

  function build() {
    all = []; byId = {}; rejected = [];
    var parts = window.ML_QUESTION_PARTS || {};
    var idx = 0, rawCount = 0;
    Object.keys(parts).forEach(function (k) {
      (parts[k] || []).forEach(function (raw) {
        rawCount++;
        var n = normalize(raw, idx++);
        if (!n.q) { rejected.push({ raw: raw, errs: n.errs }); return; }
        if (byId[n.q.id]) { n.q.id = n.q.id + '-' + idx; }
        byId[n.q.id] = n.q;
        all.push(n.q);
        if (n.errs.length) rejected.push({ raw: raw, errs: n.errs, id: n.q.id });
      });
    });

    list = all.filter(function (q) { return q.kpId; });

    // 变式题原文（USMLE→英文 / 日医→日文）：来自 window.ML_TRANSLATIONS
    var TR = window.ML_TRANSLATIONS || {};
    list.forEach(function (q) {
      var t = TR[q.id];
      if (t && (q.style === 'usmle' || q.style === 'jp')) q.orig = t;
    });

    // 病例串题：公共材料下发到组内所有题
    var cases = {};
    list.forEach(function (q) { if (q.caseId) (cases[q.caseId] = cases[q.caseId] || []).push(q); });
    Object.keys(cases).forEach(function (cid) {
      var g = cases[cid];
      g.sort(function (a, b) { return a.caseOrder - b.caseOrder; });
      var text = '';
      g.forEach(function (q) { if (!text && q.caseText) text = q.caseText; });
      g.forEach(function (q) { if (!q.caseText) q.caseText = text; });
      if (g.length > 1) {
        var subj = g[0].subject, chap = g[0].chapter;
        g.forEach(function (q) {
          if (q.subject !== subj || q.chapter !== chap) {
            q._issues.push('串题组 ' + cid + ' 内学科/章节不一致');
            rejected.push({ id: q.id, raw: null, errs: ['串题组 ' + cid + ' 内学科/章节不一致'] });
          }
          if (!q.caseText) {
            q._issues.push('串题组 ' + cid + ' 缺少公共材料 caseText');
            rejected.push({ id: q.id, raw: null, errs: ['串题组 ' + cid + ' 缺少 caseText'] });
          }
        });
      }
      g.forEach(function (q, i) { if (!q.caseOrder) q.caseOrder = i + 1; });
    });

    // B 型题：组内顺序
    var bgs = {};
    list.filter(function (q) { return q.type === 'B' && q.bgroup; }).forEach(function (q) {
      (bgs[q.bgroup] = bgs[q.bgroup] || []).push(q);
    });
    Object.keys(bgs).forEach(function (g) {
      var items = bgs[g];
      var same = items.every(function (q) { return JSON.stringify(q.options) === JSON.stringify(items[0].options); });
      if (!same) {
        items.forEach(function (q) {
          q._issues.push('B 型组 ' + g + ' 选项不一致');
          rejected.push({ id: q.id, raw: null, errs: ['B 型组 ' + g + ' 选项不一致'] });
        });
      }
    });

    var byStyle = {};
    Object.keys(window.ML_STYLES || {}).forEach(function (s) { byStyle[s] = 0; });
    list.forEach(function (q) { byStyle[q.style] = (byStyle[q.style] || 0) + 1; });

    report = {
      rawCount: rawCount, total: all.length, usable: list.length,
      rejected: rejected, byStyle: byStyle,
      beyond: list.filter(function (q) { return q.beyond; }).length,
      cases: Object.keys(cases).map(function (k) { return { id: k, n: cases[k].length }; }),
      bgroups: Object.keys(bgs).map(function (k) { return { id: k, n: bgs[k].length }; })
    };
    return report;
  }

  function get(id) { return byId[id] || null; }
  function bySubject(subjectId) { return list.filter(function (q) { return q.subject === subjectId; }); }
  function byStyle(style) { return list.filter(function (q) { return q.style === style; }); }
  function byChapter(chapterId) { return list.filter(function (q) { return q.chapterId === chapterId; }); }
  function byKp(kpId) { return list.filter(function (q) { return q.kpId === kpId; }); }
  function byType(type) { return list.filter(function (q) { return q.type === type; }); }

  function stats() {
    var t = {};
    list.forEach(function (q) { var key = q.type + '|' + q.subject; t[key] = (t[key] || 0) + 1; });
    return t;
  }

  function coverage() {
    return window.Engine.subjects.map(function (s) {
      var qs = bySubject(s.id);
      var kpsWithQ = {};
      var kpsWithExt = {};
      qs.forEach(function (q) {
        kpsWithQ[q.kpId] = 1;
        if (q.style && q.style !== 'cn306') kpsWithExt[q.kpId] = 1;
      });
      return {
        id: s.id, name: s.name, color: s.color,
        questions: qs.length,
        kpsTotal: window.Engine.subjKps[s.id].length,
        kpsCovered: Object.keys(kpsWithQ).length,
        kpsWithExt: Object.keys(kpsWithExt).length,
        byType: TYPES.reduce(function (a, ty) { a[ty] = qs.filter(function (q) { return q.type === ty; }).length; return a; }, {}),
        byStyle: STYLE_KEYS.reduce(function (a, st) { a[st] = qs.filter(function (q) { return q.style === st; }).length; return a; }, {})
      };
    });
  }

  report = build();

  return {
    build: build,
    list: function () { return list; },
    all: function () { return all; },
    get: get, bySubject: bySubject, byStyle: byStyle, byChapter: byChapter, byKp: byKp, byType: byType,
    stats: stats, coverage: coverage,
    report: function () { return report; },
    rejected: function () { return rejected; },
    TYPES: TYPES, STYLE_KEYS: STYLE_KEYS
  };
})();
