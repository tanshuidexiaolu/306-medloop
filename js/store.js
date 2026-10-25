/* ==========================================================================
 * 306 西综训练台 · 状态与持久化 v0.2
 * - profile 以「复习截止日」为锚点（可自由调节）
 * - 新增 styleStats（风格迁移度）、导入题库持久化
 * ========================================================================== */
window.Store = (function () {
  'use strict';
  var KEY = 'ml306.state.v1';
  var BANK_KEY = 'ml306.bank.v1';
  var THEME_KEY = 'ml306.theme';
  var storageOk = true;
  var state = null;
  var saveTimer = null;

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function defaultProfile() {
    return {
      name: '同学',
      deadline: '2026-12-20',        // 复习截止日（可自由调节）
      deadlineTime: '23:59',         // 截止时刻
      deadlineSetAt: Date.now(),
      deadlineSpanDays: 61,
      dailyMinutes: 150,
      weekdays: [1, 2, 3, 4, 5, 6, 7],
      targetCoverage: 0.85,          // 截止前希望覆盖的考点比例
      masterLine: 0.75,              // 达标线（掌握度）
      styleMixRatio: 0.15,           // 变式题占比
      base: { physiology: 45, biochem: 40, pathology: 50, internal: 35, surgery: 40, humanity: 60 },
      stylesEnabled: { cn306: true, cn_practice: true, usmle: true, jp: true },
      theme: 'light',
      demo: false,
      cfg: {}
    };
  }

  function blank() {
    return {
      version: 2, createdAt: Date.now(), updatedAt: Date.now(),
      profile: defaultProfile(), mastery: {}, styleStats: {}, qstats: {}, logs: {}, sessions: [], mocks: []
    };
  }

  /* 兼容旧版本状态：补齐缺少字段 */
  function normalize(st) {
    if (!st) return blank();
    st.version = 2;
    var p = defaultProfile();
    var prof = st.profile || {};
    Object.keys(p).forEach(function (k) {
      if (prof[k] === undefined) prof[k] = p[k];
      if (k === 'base' || k === 'stylesEnabled' || k === 'cfg') prof[k] = Object.assign({}, p[k], prof[k] || {});
    });
    st.profile = prof;
    if (!st.styleStats) st.styleStats = {};
    if (!st.mastery) st.mastery = {};
    if (!st.qstats) st.qstats = {};
    if (!st.logs) st.logs = {};
    if (!st.sessions) st.sessions = [];
    if (!st.mocks) st.mocks = [];
    if (!prof.deadlineSetAt) prof.deadlineSetAt = st.createdAt || Date.now();
    if (!prof.deadlineSpanDays) prof.deadlineSpanDays = 61;
    return st;
  }

  /* ---------------- 演示数据 ---------------- */
  function seedDemo(st) {
    var rnd = mulberry32(20261020);
    var DAY = 864e5, now = Date.now();
    st.profile.demo = true;
    st.profile.deadlineSetAt = now - 40 * DAY;
    st.profile.deadlineSpanDays = 100;

    window.Engine.subjects.forEach(function (s) {
      var base = st.profile.base[s.id] || 45;
      var cover = 0.30 + (base / 100) * 0.55;
      window.Engine.subjKps[s.id].forEach(function (kp) {
        if (rnd() > cover) return;
        var m = Math.max(0.12, Math.min(0.94, (0.18 + base / 100 * 0.62) + (rnd() - 0.45) * 0.42));
        st.mastery[kp.id] = {
          m: m, n: 1 + Math.floor(rnd() * 6),
          wrong: rnd() < 0.45 ? 1 + Math.floor(rnd() * 3) : 0,
          last: now - Math.floor(rnd() * 13) * DAY,
          S: 1.4 + rnd() * 9, streak: Math.floor(rnd() * 4)
        };
      });
    });

    for (var i = 15; i >= 0; i--) {
      var d = new Date(now - i * DAY);
      if (rnd() < 0.18 && i > 0) continue;
      var answered = i === 0 ? 18 : 28 + Math.floor(rnd() * 90);
      st.logs[window.Engine.dayKey(d)] = {
        minutes: i === 0 ? 26 : 55 + Math.floor(rnd() * 130),
        answered: answered,
        correct: Math.round(answered * (0.52 + rnd() * 0.28))
      };
    }

    var bank = window.MLBank ? window.MLBank.list() : [];
    bank.slice(0, Math.min(12, bank.length)).forEach(function (q, idx) {
      st.qstats[q.id] = {
        seen: 1 + (idx % 3), correct: idx % 2, wrong: 1 + (idx % 2),
        last: now - Math.floor(rnd() * 8) * DAY,
        lastWrong: now - Math.floor(rnd() * 8) * DAY
      };
    });

    // 给部分考点造出「会 306、不会变式」的样本，演示迁移度
    var withExt = bank.filter(function (q) { return q.style && q.style !== 'cn306'; });
    if (withExt.length) {
      withExt.slice(0, 6).forEach(function (q, idx) {
        st.styleStats[q.kpId] = st.styleStats[q.kpId] || {};
        st.styleStats[q.kpId].cn306 = { n: 3, c: 3 };
        st.styleStats[q.kpId][q.style] = { n: 1, c: idx % 2 === 0 ? 0 : 1 };
      });
    }

    if (bank.length >= 20) {
      st.mocks.push({
        id: 'mock-demo-1', at: now - 3 * DAY, size: 30, score: 168,
        used: 27 * 60 * 1000, correct: 17, total: 30,
        byType: { A1: [8, 10], A2: [6, 10], B: [2, 4], X: [1, 6] },
        bySubject: { physiology: [4, 6], biochem: [2, 4], pathology: [3, 5], internal: [4, 7], surgery: [3, 5], humanity: [1, 3] }
      });
    }
    st.sessions.push({ id: 's-demo-1', mode: 'train', at: now - DAY, minutes: 38, correct: 21, total: 28, title: '短板突破' });
    st.sessions.push({ id: 's-demo-2', mode: 'review', at: now - 2 * DAY, minutes: 22, correct: 14, total: 18, title: '遗忘曲线复习' });
    return st;
  }

  function seed() {
    var st = blank();
    try { seedDemo(st); } catch (e) { st.profile.demo = false; }
    return st;
  }

  /* ---------------- 存取 ---------------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.mastery) { state = normalize(parsed); return state; }
      }
    } catch (e) { storageOk = false; }
    state = seed();
    saveNow();
    return state;
  }

  function saveNow() {
    if (!state) return;
    state.updatedAt = Date.now();
    if (!storageOk) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { storageOk = false; }
  }
  function save() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 250);
  }

  function get() { return state; }
  function profile() { return state.profile; }

  function reset(opts) {
    opts = opts || {};
    var theme = state ? state.profile.theme : 'light';
    state = blank();
    if (opts.profile) state.profile = Object.assign(state.profile, opts.profile);
    state.profile.theme = theme;
    saveNow();
    return state;
  }

  function clearDemo() {
    var p = Object.assign({}, state.profile);
    var keep = { deadline: p.deadline, deadlineTime: p.deadlineTime, deadlineSetAt: p.deadlineSetAt, deadlineSpanDays: p.deadlineSpanDays,
      dailyMinutes: p.dailyMinutes, weekdays: p.weekdays, base: p.base, masterLine: p.masterLine,
      targetCoverage: p.targetCoverage, styleMixRatio: p.styleMixRatio, stylesEnabled: p.stylesEnabled, theme: p.theme };
    state = blank();
    state.profile = Object.assign(state.profile, keep, { demo: false });
    saveNow();
    return state;
  }

  function exportJson() {
    return JSON.stringify({
      app: '306-medloop', version: 2, exportedAt: new Date().toISOString(),
      profile: state.profile, mastery: state.mastery, styleStats: state.styleStats,
      qstats: state.qstats, logs: state.logs, sessions: state.sessions, mocks: state.mocks
    }, null, 2);
  }

  function importJson(text) {
    var data = JSON.parse(text);
    if (!data || typeof data !== 'object') throw new Error('不是合法的 JSON 对象');
    if (data.profile) state.profile = Object.assign(state.profile, data.profile);
    ['mastery', 'styleStats', 'qstats', 'logs'].forEach(function (k) { if (data[k]) state[k] = data[k]; });
    ['sessions', 'mocks'].forEach(function (k) { if (Array.isArray(data[k])) state[k] = data[k]; });
    state.profile.demo = false;
    state = normalize(state);
    saveNow();
    return state;
  }

  /* ---------------- 导入题库持久化 ---------------- */
  function loadImportedBank() {
    try {
      var raw = localStorage.getItem(BANK_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function saveImportedBank(arr) {
    try { localStorage.setItem(BANK_KEY, JSON.stringify(arr || [])); return true; }
    catch (e) { return false; }
  }
  function clearImportedBank() {
    try { localStorage.removeItem(BANK_KEY); } catch (e) {}
  }

  function getTheme() {
    try { return localStorage.getItem(THEME_KEY) || (state && state.profile.theme) || 'light'; }
    catch (e) { return (state && state.profile.theme) || 'light'; }
  }
  function setTheme(t) {
    state.profile.theme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    save();
  }
  function isStorageOk() { return storageOk; }

  return {
    load: load, get: get, save: save, saveNow: saveNow, profile: profile,
    reset: reset, clearDemo: clearDemo, exportJson: exportJson, importJson: importJson,
    loadImportedBank: loadImportedBank, saveImportedBank: saveImportedBank, clearImportedBank: clearImportedBank,
    getTheme: getTheme, setTheme: setTheme, isStorageOk: isStorageOk,
    normalize: normalize, seed: seed, blank: blank, KEY: KEY, BANK_KEY: BANK_KEY
  };
})();
