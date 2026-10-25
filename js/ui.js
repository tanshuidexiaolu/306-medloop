/* ==========================================================================
 * 306 西综训练台 · UI 层（外壳 / 路由 / 图表 / 通用渲染）
 * ========================================================================== */
window.UI = (function () {
  'use strict';

  var ICONS = {
    home: '<path d="M3 10.6 12 3l9 7.6"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.8 21v-6h4.4v6"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.4v7.2l6-3.6z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 11h18"/>',
    grid: '<rect x="3" y="3" width="7.2" height="7.2" rx="1.8"/><rect x="13.8" y="3" width="7.2" height="7.2" rx="1.8"/><rect x="3" y="13.8" width="7.2" height="7.2" rx="1.8"/><rect x="13.8" y="13.8" width="7.2" height="7.2" rx="1.8"/>',
    layers: '<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
    rotate: '<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.5 4.5V10h-5.4"/>',
    chart: '<path d="M4 20V10.5M9.3 20V4.5M14.7 20v-6.5M20 20V8"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1Z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.4"/>',
    flame: '<path d="M12 22c4.4 0 7-2.8 7-6.4 0-4.4-4.2-6.2-4.2-9.6 0-1.2-.5-2.4-1.3-3-1 .9-1.6 2.2-1.6 3.6 0 1.4-.7 2.2-1.6 2.2-1 0-1.5-.8-1.5-2.2C8.8 9 8 10.4 8 12c0 1.2-2 2.2-2 4.6C6 20 8.4 22 12 22Z"/>',
    check: '<path d="m4.5 12.5 5 5L20 6.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3.2 2"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    download: '<path d="M12 3v12M7.5 10.5 12 15l4.5-4.5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
    upload: '<path d="M12 15V3M7.5 7.5 12 3l4.5 4.5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l.8 13h9.4l.8-13"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>',
    moon: '<path d="M20 14.6A8.4 8.4 0 1 1 9.4 4a6.7 6.7 0 0 0 10.6 10.6Z"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
    book: '<path d="M4 4.5h6.5A2.5 2.5 0 0 1 13 7v13a2 2 0 0 0-2-2H4V4.5Z"/><path d="M20 4.5h-6.5A2.5 2.5 0 0 0 11 7v13a2 2 0 0 1 2-2h7V4.5Z"/>',
    alert: '<path d="M12 3.5 21.5 20H2.5L12 3.5Z"/><path d="M12 9.5v4.5M12 17v.4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevron: '<path d="m8 10 4 4 4-4"/>',
    refresh: '<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.5 4.5V10h-5.4"/>',
    brain: '<path d="M9.5 4.5A3 3 0 0 0 6.6 7a2.8 2.8 0 0 0-1.6 4.9A3 3 0 0 0 6 17.4 3 3 0 0 0 9.5 20c1.4 0 2.5-.9 2.5-2V6.5c0-1.1-1.1-2-2.5-2Z"/><path d="M14.5 4.5A3 3 0 0 1 17.4 7a2.8 2.8 0 0 1 1.6 4.9A3 3 0 0 1 18 17.4 3 3 0 0 1 14.5 20c-1.4 0-2.5-.9-2.5-2V6.5c0-1.1 1.1-2 2.5-2Z"/>',
    flag: '<path d="M5 21V4"/><path d="M5 5h11l-1.6 4L16 13H5"/>'
  };

  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pct(v, total) { return total ? Math.round((v / total) * 100) : 0; }
  function fmtMin(m) { return m >= 60 ? (Math.round(m / 60 * 10) / 10) + ' h' : Math.round(m) + ' min'; }
  function fmtDur(ms) {
    var s = Math.max(0, Math.round(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return (h ? h + ':' : '') + (m < 10 && h ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss;
  }
  function todayLabel() {
    var d = new Date(), w = '日一二三四五六';
    return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · 周' + w[d.getDay()];
  }
  function letter(i) { return 'ABCDEFG'[i]; }

  /* ---------------- 状态标签 ---------------- */
  function statusPill(st) {
    var m = window.Engine.STATUS_TEXT[st] || window.Engine.STATUS_TEXT.new;
    return '<span class="' + m.cls + '">' + m.t + '</span>';
  }
  function typeTag(t) {
    var m = window.ML_TYPES[t];
    return '<span class="tag tag-' + (m ? t : 'A1') + '">' + (m ? m.short : t) + '</span>';
  }
  function styleTag(style) {
    var s = (window.ML_STYLES || {})[style] || { name: style || '', short: style || '', color: 'var(--muted)' };
    return '<span class="pill" style="background:' + s.color + '1a;color:' + s.color + ';font-weight:750">' + esc(s.short || s.name) + '</span>';
  }
  function subjDot(sid) {
    var s = window.Engine.SUBJ[sid];
    return s ? '<span class="dot" style="color:' + s.color + '"></span>' : '';
  }

  /* ---------------- 环形进度 ---------------- */
  function ring(value, label, sub, color, size) {
    size = size || 104;
    var r = size / 2 - 7, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, value)));
    return '<div class="ring" style="width:' + size + 'px;height:' + size + 'px">' +
      '<svg width="' + size + '" height="' + size + '">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--panel-3)" stroke-width="8"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + (color || 'var(--primary)') + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '"/>' +
      '</svg><div class="ring-c"><div><div class="ring-v">' + label + '</div><div class="ring-k">' + sub + '</div></div></div></div>';
  }

  /* ---------------- 雷达图 ---------------- */
  function radar(items, size) {
    size = size || 300;
    var cx = size / 2, cy = size / 2 + 4, R = size * 0.31, n = items.length;
    var pt = function (i, v) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v];
    };
    var grid = '';
    [0.25, 0.5, 0.75, 1].forEach(function (g) {
      var p = items.map(function (_, i) { return pt(i, g).join(','); }).join(' ');
      grid += '<polygon points="' + p + '" fill="none" stroke="var(--line)" stroke-width="1"/>';
    });
    items.forEach(function (_, i) {
      var q = pt(i, 1);
      grid += '<line x1="' + cx + '" y1="' + cy + '" x2="' + q[0] + '" y2="' + q[1] + '" stroke="var(--line)" stroke-width="1"/>';
    });
    var poly = items.map(function (it, i) { return pt(i, Math.max(0.04, it.value)).join(','); }).join(' ');
    var dots = items.map(function (it, i) {
      var p = pt(i, Math.max(0.04, it.value));
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="' + (it.color || 'var(--primary)') + '"/>';
    }).join('');
    var labels = items.map(function (it, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      var x = cx + Math.cos(a) * (R + 30), y = cy + Math.sin(a) * (R + 26);
      var anchor = Math.abs(Math.cos(a)) < 0.25 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
      return '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" font-size="11" fill="var(--muted)" font-weight="600">' + esc(it.label) + '</text>' +
        '<text x="' + x + '" y="' + (y + 13) + '" text-anchor="' + anchor + '" font-size="10.5" fill="var(--faint)">' + Math.round(it.value * 100) + '%</text>';
    }).join('');
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="100%" style="max-width:' + size + 'px">' + grid +
      '<polygon points="' + poly + '" fill="color-mix(in srgb, var(--primary) 16%, transparent)" stroke="var(--primary)" stroke-width="2"/>' +
      dots + labels + '</svg>';
  }

  /* ---------------- 折线图 ---------------- */
  function line(values, labels, opt) {
    opt = opt || {};
    var W = 640, H = opt.height || 190, padL = 34, padR = 12, padT = 14, padB = 26;
    var n = values.length;
    var max = opt.max || Math.max(1, Math.ceil(Math.max.apply(null, values.concat([0.1])) * 10) / 10);
    var innerW = W - padL - padR, innerH = H - padT - padB;
    var X = function (i) { return padL + (n <= 1 ? innerW / 2 : innerW * i / (n - 1)); };
    var Y = function (v) { return padT + innerH * (1 - Math.max(0, Math.min(1, v / max))); };
    var grid = '', gy = 4;
    var fmtY = opt.fmt || function (v) { return Math.round(v * 10) / 10; };
    for (var g = 0; g <= gy; g++) {
      var v = max * g / gy, y = Y(v);
      grid += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="var(--line-2)" stroke-width="1"/>' +
        '<text x="' + (padL - 8) + '" y="' + (y + 3.5) + '" text-anchor="end" font-size="9.5" fill="var(--faint)">' + fmtY(v) + '</text>';
    }
    var pts = values.map(function (v, i) { return [X(i), Y(v)]; });
    var linePath = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var area = linePath + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + Y(0) + ' L' + pts[0][0].toFixed(1) + ' ' + Y(0) + ' Z';
    var dots = pts.map(function (p, i) {
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.6" fill="var(--panel)" stroke="' + (opt.color || 'var(--primary)') + '" stroke-width="2"/>';
    }).join('');
    var xl = labels.map(function (t, i) {
      if (n > 8 && i % 2) return '';
      return '<text x="' + X(i) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="9.5" fill="var(--faint)">' + esc(t) + '</text>';
    }).join('');
    var gid = 'lg' + Math.random().toString(36).slice(2, 7);
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + (opt.color || 'var(--primary)') + '" stop-opacity=".22"/>' +
      '<stop offset="100%" stop-color="' + (opt.color || 'var(--primary)') + '" stop-opacity="0"/></linearGradient></defs>' +
      grid + '<path d="' + area + '" fill="url(#' + gid + ')"/>' +
      '<path d="' + linePath + '" fill="none" stroke="' + (opt.color || 'var(--primary)') + '" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>' +
      dots + xl + '</svg>';
  }

  /* ---------------- 热力图 ---------------- */
  function heatmap(logs, weeks) {
    weeks = weeks || 12;
    var cells = [], today = new Date(), start = new Date(today);
    start.setDate(start.getDate() - (weeks * 7 - 1));
    // 对齐到周一
    var shift = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - shift);
    for (var w = 0; w < weeks + 1; w++) {
      var col = [];
      for (var d = 0; d < 7; d++) {
        var cur = new Date(start); cur.setDate(start.getDate() + w * 7 + d);
        var key = window.Engine.dayKey(cur);
        var log = logs[key];
        var lv = 0;
        if (log && log.minutes > 0) lv = log.minutes < 40 ? 1 : log.minutes < 80 ? 2 : log.minutes < 140 ? 3 : 4;
        if (cur > today) lv = -1;
        col.push('<div class="heat-cell" data-l="' + lv + '" title="' + key + (log ? ' · ' + Math.round(log.minutes) + ' 分钟 / ' + log.answered + ' 题' : ' · 未学习') + '"></div>');
      }
      cells.push('<div class="heat-col">' + col.join('') + '</div>');
    }
    return '<div class="heat">' + cells.join('') + '</div>';
  }

  /* ---------------- 题目渲染（支持串题 / 选N项 / 否定提问 / 多题源） ---------------- */
  function qHTML(q, opt) {
    opt = opt || {};
    var sel = opt.selected || [];
    var reveal = !!opt.reveal;
    var multi = (q.chooseN || 1) > 1;
    var orig = q.orig || null;
    var showOrig = !!(opt.showOrig && orig);
    var chCls = function (i) {
      var c = 'q-opt';
      if (reveal) {
        c += ' locked';
        if (q.answer.indexOf(i) >= 0) c += ' correct';
        else if (sel.indexOf(i) >= 0) c += ' wrong';
      } else if (sel.indexOf(i) >= 0) c += ' sel';
      return c;
    };
    var opts = q.options.map(function (o, i) {
      var txt = showOrig && orig.options && orig.options[i] ? orig.options[i] : o;
      return '<div class="' + chCls(i) + '" data-opt="' + i + '" role="button" tabindex="0">' +
        '<span class="key">' + letter(i) + '</span><span class="grow">' + esc(txt) + '</span></div>';
    }).join('');
    var kp = window.Engine.kpById[q.kpId];
    var subj = window.Engine.SUBJ[q.subject];
    var transBtn = (opt.showTrans && orig)
      ? '<button class="btn btn-sm btn-ghost" data-act="trans" title="在中文与原文之间切换" style="margin-left:6px">' +
        (showOrig ? '显示中文' : (orig.lang === 'ja' ? '日本語原文' : 'English original')) + '</button>'
      : '';
    var meta = '<div class="q-meta">' +
      typeTag(q.type) + styleTag(q.style || 'cn306') +
      (q.bgroup ? '<span class="pill">共用备选答案</span>' : '') +
      (q.beyond ? '<span class="pill">拓展</span>' : '') +
      '<span class="pill" style="background:' + (subj ? subj.color : 'var(--panel-3)') + '1a;color:' + (subj ? subj.color : 'var(--muted)') + '">' + (subj ? subj.name : '') + '</span>' +
      '<span class="pill">' + esc(q.chapter) + '</span>' +
      '<span class="pill">难度 ' + Math.round(q.difficulty * 100) + '</span>' +
      (multi ? '<span class="pill danger">需选 ' + q.chooseN + ' 项</span>' : '') +
      (opt.showKp !== false && kp ? '<span class="pill">考点 · ' + esc(kp.name) + '</span>' : '') +
      (opt.extra || '') + transBtn +
      '</div>';
    var expl = '';
    if (reveal) {
      var ok = opt.correct === true;
      expl = '<div class="q-explain"><div class="ex-h">' +
        '<span class="pill ' + (ok ? 'ok' : 'danger') + '">' + (ok ? '回答正确' : '回答错误') + '</span>' +
        '<span class="muted">正确答案：<b style="color:var(--ink)">' + window.Engine.answerText(q) + '</b></span>' +
        '<span class="pill" style="margin-left:auto">' + esc((window.ML_STYLES[q.style || 'cn306'] || {}).name || '') + '</span>' +
        '</div><div class="ex-b">' + esc((showOrig && orig.explain) ? orig.explain : (q.explain || '（暂无解析）')) + '</div></div>' +
        (q.tip ? '<div class="q-tip">记忆点：' + esc(showOrig && orig.tip ? orig.tip : q.tip) + '</div>' : '');
    }
    var caseText = (showOrig && orig.caseText) ? orig.caseText : q.caseText;
    return meta +
      (q.ask === 'negative' ? '<div class="q-neg">' + icon('alert') + '注意：本题要求选出「错误 / 不正确」的选项</div>' : '') +
      (caseText ? '<div class="q-case"><b>' + (showOrig ? 'Case' : '病例材料') + (q.caseId ? ' · 共用题干' : '') + '</b>' + esc(caseText) + '</div>' : '') +
      '<div class="q-stem">' + esc((showOrig && orig.stem) ? orig.stem : q.stem) + '</div>' +
      (multi && !reveal ? '<div class="xs faint" style="margin-top:8px">多选题：需选中 ' + q.chooseN + ' 项，多选或少选均不得分</div>' : '') +
      '<div class="q-opts">' + opts + '</div>' +
      expl;
  }

  /* ---------------- 计划块 ---------------- */
  function planBlock(b, idx) {
    var tone = b.color || 'primary';
    return '<div class="plan-block" data-block="' + b.id + '">' +
      '<div class="plan-ico ' + tone + '">' + icon(b.icon || 'target') + '</div>' +
      '<div class="grow">' +
      '<div class="plan-h">' + esc(b.title) +
      '<span class="pill">' + b.minutes + ' 分钟</span>' +
      '<span class="pill">' + b.count + ' 题</span>' +
      (b.kind === 'review' ? '<span class="pill warn">记忆衰减中</span>' : '') +
      (b.mixExtRatio ? '<span class="pill">含 ' + Math.round(b.mixExtRatio * 100) + '% 变式</span>' : '') +
      '</div>' +
      '<div class="plan-meta">' + (b.subjectIds || []).map(function (s) { return subjDot(s) + window.Engine.SUBJ[s].name; }).join('　') + '</div>' +
      '<div class="plan-why">为什么安排：' + esc(b.reason) + '</div>' +
      '</div>' +
      '<div class="plan-act"><button class="btn btn-primary btn-sm" data-start-block="' + b.id + '">开始' + icon('play') + '</button></div>' +
      '</div>';
  }

  function subjectBar(stat, showScore) {
    var s = window.Engine.SUBJ[stat.id];
    var pct = Math.round((stat.m || 0) * 100);
    var cov = Math.round((stat.coverage || 0) * 100);
    var enough = stat.hasData !== false && stat.learned >= 2;
    var right, w, color;
    if (!stat.learned) {
      right = '未开始'; w = 0; color = 'var(--md-outline-variant)';
    } else if (!enough) {
      right = '样本不足 · 覆盖 ' + cov + '%'; w = Math.max(2, cov); color = 'var(--md-outline-variant)';
    } else {
      right = pct + '% · 覆盖 ' + cov + '%' + (showScore !== false ? ' · 约 ' + Math.round(stat.score) + '/' + Math.round(stat.max) + ' 分' : '');
      w = Math.max(2, pct); color = s.color;
    }
    return '<div style="padding:9px 0">' +
      '<div class="row-between" style="margin-bottom:5px">' +
      '<div class="row" style="gap:7px">' + subjDot(stat.id) + '<b style="font-size:12.5px">' + esc(s.name) + '</b>' +
      '<span class="xs faint">占分 ' + Math.round(s.share * 100) + '%</span></div>' +
      '<div class="xs faint mono">' + right + '</div>' +
      '</div>' +
      '<div class="bar"><i style="width:' + w + '%;background:' + color + '"></i></div>' +
      '</div>';
  }

  return {
    ICONS: ICONS, icon: icon, esc: esc, pct: pct, fmtMin: fmtMin, fmtDur: fmtDur, todayLabel: todayLabel, letter: letter,
    statusPill: statusPill, typeTag: typeTag, styleTag: styleTag, subjDot: subjDot, ring: ring, radar: radar, line: line, heatmap: heatmap,
    qHTML: qHTML, planBlock: planBlock, subjectBar: subjectBar
  };
})();


/* ==========================================================================
 * App：外壳、路由、会话、弹窗
 * ========================================================================== */
window.App = (function () {
  'use strict';
  var E = window.Engine;
  var NAV = [
    { sec: '学习' },
    { id: 'today', name: '今日训练', icon: 'home' },
    { id: 'train', name: '自由训练', icon: 'play' },
    { id: 'mock', name: '全真模考', icon: 'calendar' },
    { sec: '知识' },
    { id: 'map', name: '知识图谱', icon: 'grid' },
    { id: 'bank', name: '题库浏览', icon: 'layers' },
    { id: 'review', name: '错题复习', icon: 'rotate', badge: 'due' },
    { sec: '数据' },
    { id: 'stats', name: '学习报告', icon: 'chart' },
    { id: 'settings', name: '设置', icon: 'gear' },
    { id: 'about', name: '关于框架', icon: 'info' }
  ];
  var App = {
    views: {}, session: null, current: 'today', modalEl: null, timer: null
  };

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  App.register = function (name, view) { App.views[name] = view; };
  App.$ = $; App.$$ = $$;

  App.go = function (hash) {
    if (location.hash === hash) App.render();
    else location.hash = hash;
  };

  App.toast = function (msg, ms) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, ms || 2000);
  };

  /* ---------------- 弹窗 ---------------- */
  App.modal = function (opt) {
    App.closeModal();
    var root = document.getElementById('modal-root');
    var html = '<div class="modal-bg" data-close="bg"><div class="modal" role="dialog">' +
      '<div class="modal-h"><div class="modal-t">' + UI.esc(opt.title || '') + '</div>' +
      '<button class="btn btn-ghost btn-icon" data-close style="margin-left:auto">' + UI.icon('x') + '</button></div>' +
      '<div class="modal-b">' + (opt.body || '') + '</div>' +
      (opt.footer ? '<div class="modal-f">' + opt.footer + '</div>' : '') +
      '</div></div>';
    root.innerHTML = html;
    App.modalEl = root.firstChild;
    if (!App._modalBound) {
      App._modalBound = true;
      root.addEventListener('click', function (e) {
        var closer = e.target.closest('[data-close]');
        if (!closer) return;
        // 背景层是对话框的父节点：只有点中背景本身才关闭，
        // 否则 closest() 会一路匹配到背景，导致点对话框内任何位置都被关掉。
        if (closer.classList.contains('modal-bg') && e.target !== closer) return;
        App.closeModal();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && App.modalEl) App.closeModal();
      });
    }
    if (opt.onMount) opt.onMount(root, App.closeModal);
  };
  App.closeModal = function () {
    var root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
    App.modalEl = null;
  };

  /* ---------------- 主题 ---------------- */
  App.setTheme = function (t) {
    document.documentElement.setAttribute('data-theme', t);
    window.Store.setTheme(t);
    var b = document.getElementById('btn-theme');
    if (b) b.innerHTML = UI.icon(t === 'dark' ? 'sun' : 'moon');
  };
  App.toggleTheme = function () {
    var cur = document.documentElement.getAttribute('data-theme') || 'light';
    App.setTheme(cur === 'dark' ? 'light' : 'dark');
  };

  /* ---------------- 外壳 ---------------- */
  function navHTML() {
    return NAV.map(function (n) {
      if (n.sec) return '<div class="nav-sec">' + n.sec + '</div>';
      var badge = '';
      if (n.badge === 'due') {
        var due = E.dueKps(window.Store.get()).length;
        badge = due ? '<span class="nav-badge">' + due + '</span>' : '';
      }
      return '<div class="nav-item" data-nav="' + n.id + '">' + UI.icon(n.icon) + '<span>' + n.name + '</span>' + badge + '</div>';
    }).join('');
  }

  function countdownHTML() {
    var st = window.Store.get();
    var dl = E.deadlineInfo(st);
    var prog = E.progressInfo(st);
    var feas = E.feasibility(st);
    var p = Math.max(2, Math.min(98, Math.round(prog.done * 100)));
    var color = feas.cls === 'ok' ? 'var(--ok)' : feas.cls === 'warn' ? 'var(--warn)' : 'var(--danger)';
    var needTxt = feas.W <= 0 ? '已完成' : '每日需 ' + Math.ceil(feas.need) + ' 题';
    var needTitle = feas.W <= 0 ? '已完成' :
      '剩余工作量 ' + Math.round(feas.W * 10) / 10 + ' 题量当量 ÷ ' + feas.D + ' 个有效学习日 = 每日 ' + (Math.round(feas.need * 10) / 10) + ' 题';
    return '<div class="cd-card">' +
      '<div class="cd-top"><span class="cd-num">' + (dl.passed ? '—' : dl.days) + '</span><span class="cd-label">天后复习截止</span></div>' +
      '<div class="cd-sub">' + UI.esc(dl.date) + ' ' + UI.esc(dl.time) + '</div>' +
      '<div class="cd-bar"><i style="width:' + p + '%"></i></div>' +
      '<div class="cd-sub" style="display:flex;justify-content:space-between;margin-top:7px">' +
      '<span title="' + UI.esc(needTitle) + '">' + needTxt + '</span>' +
      '<span style="color:' + color + ';font-weight:700">' + feas.label + '</span></div>' +
      '<div class="cd-sub" style="margin-top:2px;opacity:.75" title="每日可用时长 ÷ 平均每题 3.5 分钟">进度 ' + Math.round(prog.done * 100) + '% · 容量 ' + Math.round(feas.cap) + ' 题/天</div>' +
      '</div>';
  }

  /* ---------------- 涟漪（M3 state layer） ---------------- */
  function initRipple() {
    if (App._rippleBound) return;
    App._rippleBound = true;
    document.addEventListener('pointerdown', function (e) {
      var host = e.target.closest ? e.target.closest('.btn, .chip, .nav-item, .mn-item, .q-opt, .list-item, .subj-tab, .plan-block, .ch-head, [data-subject]') : null;
      if (!host || host.disabled) return;
      var rect = host.getBoundingClientRect();
      if (!rect.width) return;
      var size = Math.max(rect.width, rect.height) * 2;
      var span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - rect.left - size / 2) + 'px';
      span.style.top = (e.clientY - rect.top - size / 2) + 'px';
      host.appendChild(span);
      setTimeout(function () { if (span.parentNode) span.parentNode.removeChild(span); }, 600);
    }, { passive: true });
  }

  App.mountShell = function () {
    var st = window.Store.get();
    var due = E.dueKps(st).length;
    var appEl = document.getElementById('app');
    appEl.className = 'app';
    appEl.innerHTML =
      '<aside class="sidebar">' +
      '<div class="brand"><div class="brand-mark">306</div><div class="brand-txt">' +
      '<div class="brand-name">西综训练台</div><div class="brand-sub">MEDLOOP · 个性化训练</div></div></div>' +
      '<div class="nav" id="nav">' + navHTML() + '</div>' +
      '<div class="side-foot" id="side-foot">' + countdownHTML() + '</div>' +
      '</aside>' +
      '<div class="main">' +
      '<header class="topbar">' +
      '<div><div class="tb-title" id="tb-title">今日训练</div><div class="tb-sub" id="tb-sub">' + UI.todayLabel() + '</div></div>' +
      '<div class="tb-right">' +
      '<div class="chip" title="连续学习天数">' + UI.icon('flame') + '<span id="tb-streak">' + E.streak(st) + '</span></div>' +
      '<div class="chip" title="今日待复习">' + UI.icon('rotate') + '<span id="tb-due">' + due + '</span></div>' +
      '<button class="btn btn-icon" id="btn-theme" title="切换主题">' + UI.icon('moon') + '</button>' +
      '</div></header>' +
      '<div class="view" id="view"></div>' +
      '</div>' +
      '<div class="mobile-nav" id="mnav">' +
        NAV.filter(function (n) { return n.id; }).slice(0, 5).map(function (n) {
          return '<div class="mn-item" data-nav="' + n.id + '">' + UI.icon(n.icon) + '<span>' + n.name.replace('训练', '').replace('知识', '') + '</span></div>';
        }).join('') +
        '<div class="mn-item" data-mnav-more="1">' + UI.icon('layers') + '<span>更多</span></div>' +
      '</div>';

    document.getElementById('nav').addEventListener('click', function (e) {
      var it = e.target.closest('[data-nav]');
      if (it) App.go('#/' + it.getAttribute('data-nav'));
    });
    document.getElementById('mnav').addEventListener('click', function (e) {
      if (e.target.closest('[data-mnav-more]')) {
        var rest = NAV.filter(function (n) { return n.id; }).slice(5);
        App.modal({
          title: '更多',
          body: '<div style="display:grid;gap:4px">' + rest.map(function (n) {
            return '<div class="list-item" data-more="' + n.id + '"><div class="li-main"><div class="li-t">' + n.name + '</div></div>' + UI.icon('chevron') + '</div>';
          }).join('') + '</div>',
          footer: '<button class="btn" data-close>关闭</button>',
          onMount: function (r) {
            r.addEventListener('click', function (ev) {
              var it = ev.target.closest('[data-more]');
              if (!it) return;
              var id = it.getAttribute('data-more');
              App.closeModal();
              App.go('#/' + id);
            });
          }
        });
        return;
      }
      var it = e.target.closest('[data-nav]');
      if (it) App.go('#/' + it.getAttribute('data-nav'));
    });
    document.getElementById('btn-theme').addEventListener('click', App.toggleTheme);
    App.setTheme(document.documentElement.getAttribute('data-theme') || window.Store.getTheme());
    initRipple();
  };

  function paintNav() {
    $$('[data-nav]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-nav') === App.current);
    });
    var moreIds = NAV.filter(function (n) { return n.id; }).slice(5).map(function (n) { return n.id; });
    $$('[data-mnav-more]').forEach(function (el) {
      el.classList.toggle('active', moreIds.indexOf(App.current) >= 0);
    });
  }

  App.refreshChrome = function () {
    var st = window.Store.get();
    var due = E.dueKps(st).length;
    var foot = document.getElementById('side-foot');
    if (foot) foot.innerHTML = countdownHTML();
    var streakEl = document.getElementById('tb-streak');
    if (streakEl) streakEl.textContent = E.streak(st);
    var dueEl = document.getElementById('tb-due');
    if (dueEl) dueEl.textContent = due;
    // 只更新角标，不重建导航（重建会丢失导航滚动位置、也浪费性能）
    var item = document.querySelector('[data-nav="review"]');
    if (item) {
      var b = item.querySelector('.nav-badge');
      if (due) {
        if (!b) { b = document.createElement('span'); b.className = 'nav-badge'; item.appendChild(b); }
        b.textContent = due;
      } else if (b && b.parentNode) {
        b.parentNode.removeChild(b);
      }
    }
    paintNav();
  };

  /* ---------------- 路由 ---------------- */
  /**
   * 重建 #view 节点再注入 HTML。
   * 关键：浏览器不会回收挂在旧节点上的事件监听器，如果只替换 innerHTML，
   * 每次 render / refreshView 都会在同一节点上叠加一层 click 监听，
   * 点几次后一次点击会触发 N 次重渲染（表现为明显卡顿、开关反复抵消）。
   * 换一个新节点 → 旧监听随旧节点一起被回收。
   */
  function resetViewNode(html, animate) {
    var old = document.getElementById('view');
    var fresh = document.createElement('div');
    fresh.id = 'view';
    fresh.className = 'view';
    fresh.innerHTML = '<div class="view-inner' + (animate ? ' anim' : '') + '">' + html + '</div>';
    if (old && old.parentNode) old.parentNode.replaceChild(fresh, old);
    return fresh;
  }

  function renderErrorPane(e) {
    return '<div class="card"><div class="empty"><div class="empty-ico">' + icon('alert') + '</div>' +
      '<div class="empty-t">这个页面渲染出错了</div>' +
      '<div class="small muted">' + esc(e && e.message ? e.message : String(e)) + '</div>' +
      '<button class="btn btn-primary" data-act="recover" style="margin-top:16px">回到今日训练</button></div></div>';
  }

  function parseHash() {
    var raw = (location.hash || '#/today').replace(/^#\/?/, '');
    var parts = raw.split('?');
    var name = parts[0] || 'today';
    var query = {};
    (parts[1] || '').split('&').forEach(function (kv) {
      if (!kv) return;
      var p = kv.split('=');
      query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
    });
    return { name: name, query: query };
  }
  App.query = function () { return parseHash().query; };

  App.render = function () {
    var r = parseHash();
    var view = App.views[r.name] || App.views.today;
    App.current = App.views[r.name] ? r.name : 'today';
    App.query_ = r.query;
    var ok = true, html = '';
    try { html = view.render(r.query); }
    catch (e) { ok = false; html = renderErrorPane(e); }
    var fresh = resetViewNode(html, true);
    if (ok && view.mount) view.mount(r.query);
    if (!ok) {
      fresh.querySelector('[data-act="recover"]').addEventListener('click', function () { App.go('#/today'); });
    }
    var title = document.getElementById('tb-title'), sub = document.getElementById('tb-sub');
    if (title) title.textContent = (view.meta && view.meta.title) || '今日训练';
    if (sub) sub.textContent = (view.meta && view.meta.sub) || UI.todayLabel();
    paintNav();
    document.body.scrollTop = 0; document.documentElement.scrollTop = 0;
    App.refreshChrome();
  };

  App.refreshView = function () {
    var view = App.views[App.current];
    if (!view) return;
    var y = window.scrollY || document.documentElement.scrollTop;
    var ok = true, html = '';
    try { html = view.render(App.query_); }
    catch (e) { ok = false; html = renderErrorPane(e); }
    var fresh = resetViewNode(html, false);   // 页内刷新不播放入场动画，避免每次点击都"抖一下"
    if (ok && view.mount) view.mount(App.query_);
    if (!ok) {
      fresh.querySelector('[data-act="recover"]').addEventListener('click', function () { App.go('#/today'); });
    }
    App.refreshChrome();   // 侧栏进度/每日题量/可行性随任何页内变化实时更新
    window.scrollTo(0, y);
  };

  /* ---------------- 会话 ---------------- */
  App.startSession = function (cfg) {
    var qs = cfg.questions || [];
    if (!qs.length) { App.toast('题库中暂无符合条件的题目，请先导入题库'); return; }
    App.session = {
      mode: cfg.mode || 'train',
      title: cfg.title || '训练',
      subtitle: cfg.subtitle || '',
      questions: qs,
      idx: 0,
      answers: {},
      revealed: {},
      correct: {},
      startedAt: Date.now(),
      limitSec: cfg.limitSec || 0,
      instant: cfg.instant !== false,
      back: cfg.back || '#/today',
      meta: cfg.meta || {},
      finished: false,
      per: cfg.per || {},
      showOrig: false   // 变式题：false=中文，true=原文（英/日）
    };
    App.go('#/quiz');
  };

  App.endSession = function (opt) {
    opt = opt || {};
    var s = App.session;
    if (!s) return;
    var st = window.Store.get();
    var mins = Math.round((Date.now() - s.startedAt) / 60000);
    E.addMinutes(st, Math.max(1, mins));
    var answered = Object.keys(s.revealed).length;
    var correct = Object.keys(s.correct).filter(function (k) { return s.correct[k]; }).length;
    st.sessions.push({
      id: 's' + s.startedAt, mode: s.mode, at: s.startedAt, minutes: mins,
      correct: correct, total: answered, title: s.title
    });
    if (st.sessions.length > 80) st.sessions = st.sessions.slice(-80);
    window.Store.saveNow();
    App.session = null;
    App.refreshChrome();
    App.go(opt.back || s.back || '#/today');
  };

  App.answerCurrent = function (sel) {
    var s = App.session;
    if (!s) return null;
    var q = s.questions[s.idx];
    var res = E.applyAnswer(window.Store.get(), q, sel);
    s.answers[q.id] = sel;
    s.revealed[q.id] = true;
    s.correct[q.id] = res.correct;
    window.Store.save();
    return res;
  };

  App.startTimer = function (onTick) {
    App.stopTimer();
    App.timer = setInterval(onTick, 1000);
  };
  App.stopTimer = function () { if (App.timer) clearInterval(App.timer); App.timer = null; };

  return App;
})();
