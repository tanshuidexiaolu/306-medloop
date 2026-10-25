/* 答题会话（训练/复习/诊断/模考） + 模考设置 + 结果报告 */
(function () {
  'use strict';
  var E = window.Engine, UI = window.UI, App = window.App, S = window.Store;

  function my(sel, root) { return (root || document).querySelector(sel); }
  function each(sel, fn, root) { Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn); }

  /* ======================= 答题 ======================= */
  App.register('quiz', {
    meta: { title: '答题中', sub: '' },
    render: function () {
      var s = App.session;
      if (!s) {
        return '<div class="card"><div class="empty"><div class="empty-ico">' + UI.icon('alert') + '</div>' +
          '<div class="empty-t">没有进行中的练习</div><div class="small">从「今日训练」或「自由训练」开始</div>' +
          '<button class="btn btn-primary" data-act="home" style="margin-top:14px">回到今日</button></div></div>';
      }
      if (s.finished) return renderResult(s);

      var q = s.questions[s.idx];
      var sel = s.answers[q.id] || [];
      var revealed = s.instant && !!s.revealed[q.id];
      var correct = s.correct[q.id] === true;
      var p = Math.round((s.idx) / s.questions.length * 100);
      var dots = s.questions.map(function (qq, i) {
        var cls = 'q-dot';
        if (s.revealed[qq.id]) cls += s.correct[qq.id] ? ' ok' : ' bad';
        else if (s.answers[qq.id] && s.answers[qq.id].length) cls += ' done';
        if (i === s.idx) cls += ' cur';
        return '<span class="' + cls + '" title="第 ' + (i + 1) + ' 题"></span>';
      }).join('');

      var html = '<div class="q-wrap">';
      html += '<div class="q-topbar">' +
        '<button class="btn btn-ghost btn-sm" data-act="exit">' + UI.icon('arrow') + ' 退出</button>' +
        '<div style="min-width:0"><div class="plan-h">' + UI.esc(s.title) + '</div>' +
        '<div class="xs faint">' + UI.esc(s.subtitle || '') + '</div></div>' +
        '<div class="q-timer" id="q-timer">' + (s.instant ? '00:00' : '') + '</div>' +
        '</div>';
      html += '<div class="progress" style="margin-bottom:14px"><i style="width:' + p + '%"></i></div>';

      html += '<div class="q-card">' +
        '<div class="q-topbar" style="margin-bottom:10px">' +
        '<span class="q-index">第 ' + (s.idx + 1) + ' / ' + s.questions.length + ' 题</span>' +
        '<span class="xs faint" style="margin-left:auto">' + (q.type === 'X' ? '多选：全部选对才得分' : '单选') + '</span></div>' +
        UI.qHTML(q, { selected: sel, reveal: revealed, correct: correct, showTrans: !!q.orig, showOrig: !!s.showOrig, extra: '<span class="pill">' + UI.esc(q.source || '') + '</span>' }) +
        '</div>';

      html += '<div class="q-actions">';
      if (s.instant) {
        if (!revealed) {
          var need = q.chooseN || 1;
          var ready = sel.length === need;
          html += '<button class="btn btn-primary" data-act="submit" ' + (ready ? '' : 'disabled') + '>提交答案' + (need > 1 ? '（已选 ' + sel.length + '/' + need + '）' : '') + '</button>';
          html += '<span class="xs faint">' + (need > 1 ? '本题需选 ' + need + ' 项' : '按 A–' + String.fromCharCode(64 + q.options.length) + ' 选择，回车提交') + '</span>';
        } else {
          var isLast = s.idx >= s.questions.length - 1;
          var hasAlt = window.MLBank.byKp(q.kpId).some(function (x) { return x.style !== q.style; });
          html += '<button class="btn btn-primary" data-act="next">' + (isLast ? '完成练习' : '下一题') + ' ' + UI.icon('arrow') + '</button>';
          if (hasAlt) html += '<button class="btn" data-act="swap-style">' + UI.icon('refresh') + ' 换个风格再考这个考点</button>';
          html += '<button class="btn btn-ghost" data-act="finish">结束并查看报告</button>';
        }
      } else {
        html += '<button class="btn" data-act="prev" ' + (s.idx === 0 ? 'disabled' : '') + '>上一题</button>';
        html += '<button class="btn" data-act="next" ' + (s.idx >= s.questions.length - 1 ? 'disabled' : '') + '>下一题</button>';
        html += '<button class="btn" data-act="card">答题卡</button>';
        html += '<span class="grow"></span><button class="btn btn-primary" data-act="submit-exam">交卷</button>';
      }
      html += '</div>';
      html += '<div class="q-dots">' + dots + '</div>';
      html += '<div class="xs faint center" style="margin-top:10px">提示：答案会实时保存；关闭页面后重新进入不会丢失该题记录</div>';
      html += '</div>';
      return html;
    },
    mount: function () {
      var s = App.session;
      if (!s || s.finished) { bindResult(); return; }
      var q = s.questions[s.idx];
      var root = document.getElementById('view');
      var revealed = s.instant && !!s.revealed[q.id];

      // 选项点击（chooseN>1 时为多选）
      each('.q-opt', function (el) {
        el.addEventListener('click', function () {
          if (revealed) return;
          var i = Number(el.getAttribute('data-opt'));
          var cur = (s.answers[q.id] || []).slice();
          var need = q.chooseN || 1;
          if (need > 1) {
            var p = cur.indexOf(i);
            if (p >= 0) cur.splice(p, 1);
            else if (cur.length < need) cur.push(i);
            else { App.toast('本题只能选 ' + need + ' 项，先取消一个'); return; }
            s.answers[q.id] = cur;
          } else {
            s.answers[q.id] = [i];
          }
          App.refreshView();
        });
      });

      each('[data-act]', function (el) {
        el.addEventListener('click', function () {
          var act = el.getAttribute('data-act');
          if (act === 'exit') askExit();
          else if (act === 'submit') doSubmit();
          else if (act === 'next') doNext();
          else if (act === 'prev') { if (s.idx > 0) { s.idx--; App.refreshView(); } }
          else if (act === 'finish') finish();
          else if (act === 'card') showAnswerCard();
          else if (act === 'submit-exam') askSubmitExam();
          else if (act === 'swap-style') swapStyle();
          else if (act === 'trans') { s.showOrig = !s.showOrig; App.refreshView(); }
          else if (act === 'home') App.go('#/today');
        });
      });

      // 计时
      App.stopTimer();
      var startAt = s.startedAt;
      App.startTimer(function () {
        var t = my('#q-timer'); if (!t) return;
        if (s.limitSec) {
          var left = s.limitSec - Math.floor((Date.now() - startAt) / 1000);
          if (left <= 0) { t.textContent = '00:00'; App.stopTimer(); gradeExam(); return; }
          t.textContent = UI.fmtDur(left * 1000);
          t.style.color = left < 300 ? 'var(--danger)' : '';
        } else {
          t.textContent = UI.fmtDur(Date.now() - startAt);
        }
      });

      // 键盘
      document.onkeydown = function (e) {
        if (!App.session || App.session.finished) return;
        var k = e.key.toUpperCase();
        if ('ABCDE'.indexOf(k) >= 0) {
          var i = 'ABCDE'.indexOf(k);
          var el = my('.q-opt[data-opt="' + i + '"]');
          if (el) { el.click(); e.preventDefault(); }
        } else if (e.key === 'Enter') {
          var btn = my('[data-act="submit"]') || my('[data-act="next"]');
          if (btn && !btn.disabled) { btn.click(); e.preventDefault(); }
        }
      };
    }
  });

  function askExit() {
    var s = App.session;
    App.modal({
      title: '退出本次练习？',
      body: '<div style="font-size:13.5px;line-height:1.8">已经答过的题目会保留在学习记录里，未答的题目不会计入。' +
        (s && !s.instant ? '<br><b>模考中途退出将不会生成成绩报告。</b>' : '') + '</div>',
      footer: '<button class="btn" data-close>继续答题</button><button class="btn btn-danger" id="do-exit">退出</button>',
      onMount: function (r) {
        my('#do-exit', r).addEventListener('click', function () {
          App.closeModal(); App.endSession();
        });
      }
    });
  }

  function doSubmit() {
    var s = App.session, q = s.questions[s.idx];
    var sel = s.answers[q.id] || [];
    var need = q.chooseN || 1;
    if (sel.length !== need) { App.toast(need > 1 ? '需要选中 ' + need + ' 项' : '请先选择答案'); return; }
    App.answerCurrent(sel);
    App.refreshView();
  }

  /** 同一考点换一种题源再考一次（插入到下一题） */
  function swapStyle() {
    var s = App.session, q = s.questions[s.idx], st = S.get();
    var used = {};
    s.questions.forEach(function (x) { used[x.id] = 1; });
    var alts = window.MLBank.byKp(q.kpId).filter(function (x) { return x.style !== q.style && !used[x.id]; });
    if (!alts.length) { App.toast('这个考点暂无其他题源的变式题'); return; }
    alts.sort(function (a, b) { return (b.difficulty - a.difficulty); });
    var pick = alts[0];
    s.questions.splice(s.idx + 1, 0, pick);
    var sname = (window.ML_STYLES[pick.style] || {}).name || pick.style;
    App.toast('已插入同考点的「' + sname + '」变式');
    s.idx++;
    App.refreshView();
  }

  function doNext() {
    var s = App.session;
    if (s.idx < s.questions.length - 1) { s.idx++; App.refreshView(); }
    else finish();
  }

  /* ======================= 结算 ======================= */
  function finish() {
    var s = App.session;
    if (!s) return;
    s.finished = true;
    s.endedAt = Date.now();
    App.stopTimer();
    document.onkeydown = null;

    var st = S.get();
    var answered = 0, correct = 0, wrong = [], skipped = [], kps = {};
    s.questions.forEach(function (q) {
      if (!s.revealed[q.id]) { skipped.push(q); return; }
      answered++;
      if (s.correct[q.id]) correct++; else wrong.push(q);
      kps[q.kpId] = kps[q.kpId] || { n: 0, c: 0 };
      kps[q.kpId].n++; if (s.correct[q.id]) kps[q.kpId].c++;
    });
    var minutes = Math.max(1, Math.round((s.endedAt - s.startedAt) / 60000));
    var maxScore = 0, gotScore = 0;
    s.questions.forEach(function (q) {
      var per = (s.per[q.id] != null ? s.per[q.id] : (window.ML_TYPES[q.type] || { per: 2 }).per);
      maxScore += per;
      if (s.correct[q.id]) gotScore += per;
    });
    s.summary = {
      answered: answered, correct: correct, total: s.questions.length, minutes: minutes,
      skipped: skipped.length, wrong: wrong, kps: kps,
      maxScore: maxScore, gotScore: gotScore,
      score300: maxScore ? gotScore / maxScore * 300 : 0,
      byType: groupBy(s.questions, 'type'), bySubject: groupBy(s.questions, 'subject'),
      byStyle: groupBy(s.questions, 'style')
    };

    E.addMinutes(st, minutes);
    st.sessions.push({ id: 's' + s.startedAt, mode: s.mode, at: s.startedAt, minutes: minutes, correct: correct, total: answered, title: s.title });
    if (st.sessions.length > 80) st.sessions = st.sessions.slice(-80);
    if (s.mode === 'mock' && s.summary.answered > 0) {
      st.mocks.push({
        id: 'mock' + s.startedAt, at: s.endedAt, size: s.questions.length,
        score: Math.round(s.summary.score300), got: Math.round(s.summary.gotScore), max: Math.round(maxScore),
        used: s.endedAt - s.startedAt, correct: correct, total: answered,
        byType: s.summary.byType, bySubject: s.summary.bySubject
      });
    }
    S.saveNow();
    App.refreshChrome();
    App.refreshView();
  }
  App.finishQuiz = finish;

  function groupBy(qs, field) {
    var out = {};
    qs.forEach(function (q) {
      var k = q[field];
      out[k] = out[k] || { n: 0, c: 0 };
      out[k].n++;
      if (App.session.correct[q.id]) out[k].c++;
    });
    return out;
  }

  function renderResult(s) {
    var m = s.summary || {};
    var acc = m.answered ? m.correct / m.answered : 0;
    var isMock = s.mode === 'mock';
    var html = '<div class="q-wrap">';

    html += '<div class="card" style="padding:22px 24px;margin-bottom:14px">' +
      '<div class="row" style="gap:22px;flex-wrap:wrap">' +
      UI.ring(isMock ? (m.score300 / 300) : acc, isMock ? Math.round(m.score300) + '' : Math.round(acc * 100) + '%', isMock ? '折算 / 300' : '正确率', isMock ? 'var(--accent)' : 'var(--primary)') +
      '<div class="grow" style="min-width:200px">' +
      '<div class="pill primary">' + (s.mode === 'review' ? '复习完成' : s.mode === 'diag' ? '诊断完成' : isMock ? '模考已交卷' : '训练完成') + '</div>' +
      '<h2 style="font-size:19px;margin:8px 0 4px;letter-spacing:-.3px">' + UI.esc(s.title) + '</h2>' +
      '<div class="small muted">答对 ' + m.correct + ' / ' + m.answered + ' 题' + (m.skipped ? '，未作答 ' + m.skipped + ' 题' : '') + '，用时 ' + m.minutes + ' 分钟</div>' +
      '<div class="row wrap" style="gap:8px;margin-top:12px">' +
      '<span class="pill">正确率 ' + Math.round(acc * 100) + '%</span>' +
      '<span class="pill">平均 ' + (m.answered ? (m.minutes / m.answered * 60).toFixed(0) : 0) + ' 秒/题</span>' +
      '<span class="pill">涉及考点 ' + Object.keys(m.kps || {}).length + ' 个</span>' +
      (isMock ? '<span class="pill primary">原始分 ' + Math.round(m.gotScore) + ' / ' + Math.round(m.maxScore) + '</span>' : '') +
      '</div></div></div>';

    html += '<div class="row wrap" style="gap:10px;margin-top:18px">' +
      '<button class="btn btn-primary" data-act="again">再练一组</button>' +
      (m.wrong && m.wrong.length ? '<button class="btn" data-act="redo-wrong">重做错题（' + m.wrong.length + '）</button>' : '') +
      '<button class="btn" data-act="home">回到今日</button></div>';
    html += '</div>';

    if (isMock) {
      html += '<div class="card" style="margin-bottom:14px"><div class="card-h"><div class="card-t">题型表现</div><div class="card-x">按卷面结构</div></div><div class="card-b" style="padding:6px 8px">' +
        '<table class="table"><thead><tr><th>题型</th><th class="r">作答</th><th class="r">正确</th><th class="r">正确率</th></tr></thead><tbody>' +
        ['A1', 'A2', 'B', 'X'].map(function (t) {
          var g = m.byType[t]; if (!g) return '';
          return '<tr><td>' + UI.typeTag(t) + ' ' + window.ML_TYPES[t].label + '</td><td class="r">' + g.n + '</td><td class="r">' + g.c + '</td><td class="r"><b>' + Math.round(g.c / g.n * 100) + '%</b></td></tr>';
        }).join('') + '</tbody></table></div></div>';

      html += '<div class="card" style="margin-bottom:14px"><div class="card-h"><div class="card-t">学科表现</div><div class="card-x">找出失分科目</div></div><div class="card-b">' +
        E.subjects.map(function (sub) {
          var g = m.bySubject[sub.id]; if (!g) return '';
          return UI.subjectBar({ id: sub.id, m: g.c / g.n, score: 0, max: 0 }, false).replace('· 约 0/0 分', '') +
            '<div class="xs faint" style="margin:-4px 0 8px 12px">' + g.c + ' / ' + g.n + ' 题正确</div>';
        }).join('') + '</div></div>';
    }

    var styleKeys = Object.keys(m.byStyle || {}).filter(function (k) { return m.byStyle[k] && m.byStyle[k].n; });
    if (styleKeys.length) {
      var cn = m.byStyle.cn306;
      var extKeys = styleKeys.filter(function (k) { return k !== 'cn306'; });
      var extN = extKeys.reduce(function (a, k) { return a + m.byStyle[k].n; }, 0);
      var extC = extKeys.reduce(function (a, k) { return a + m.byStyle[k].c; }, 0);
      html += '<div class="card" style="margin-bottom:14px"><div class="card-h"><div class="card-t">题源表现</div><div class="card-x">同一考点的跨风格正确率</div></div><div class="card-b" style="padding:6px 8px">' +
        '<table class="table"><thead><tr><th>题源</th><th class="r">作答</th><th class="r">正确率</th><th class="hide-sm">定位</th></tr></thead><tbody>' +
        styleKeys.map(function (k) {
          var g = m.byStyle[k], stl = E.STYLES[k] || {};
          return '<tr><td>' + UI.styleTag(k) + ' ' + UI.esc(stl.name || k) + '</td><td class="r">' + g.n + '</td>' +
            '<td class="r"><b>' + Math.round(g.c / g.n * 100) + '%</b></td><td class="hide-sm faint xs">' + UI.esc(stl.desc || '') + '</td></tr>';
        }).join('') + '</tbody></table>' +
        (cn && extN ? '<div class="xs faint" style="padding:10px 8px 4px">306 题源 ' + Math.round(cn.c / cn.n * 100) + '%　vs　非 306 变式 ' +
          Math.round(extC / extN * 100) + '%　→ ' + (extC / extN + 0.15 < cn.c / cn.n
            ? '<b style="color:var(--danger)">差距明显，这个考点可能只记住了 306 的题面</b>'
            : '<b style="color:var(--ok)">跨风格表现一致，掌握是真实的</b>') + '</div>' : '') +
        '</div></div>';
    }

    if (m.kps && Object.keys(m.kps).length) {
      var list = Object.keys(m.kps).map(function (id) {
        return { id: id, m: E.mastery(S.get(), id), n: m.kps[id].n, c: m.kps[id].c };
      }).sort(function (a, b) { return (a.c / a.n) - (b.c / b.n); }).slice(0, 6);
      html += '<div class="card" style="margin-bottom:14px"><div class="card-h"><div class="card-t">本次涉及的考点</div><div class="card-x">掌握度已更新</div></div><div class="card-b" style="padding:6px 8px">' +
        '<table class="table"><thead><tr><th>考点</th><th class="r">本次</th><th class="r">掌握度</th><th class="r hide-sm">状态</th></tr></thead><tbody>' +
        list.map(function (x) {
          var kp = E.kpById[x.id] || { name: x.id, subject: '' };
          return '<tr><td>' + UI.esc(kp.name) + '<div class="xs faint">' + UI.esc(E.kpLabel(x.id)) + '</div></td>' +
            '<td class="r">' + x.c + '/' + x.n + '</td><td class="r"><b>' + Math.round(x.m * 100) + '%</b></td>' +
            '<td class="r hide-sm">' + UI.statusPill(E.status(S.get(), x.id)) + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';
    }

    if (m.wrong && m.wrong.length) {
      html += '<div class="card"><div class="card-h"><div class="card-t">错题回顾</div><div class="card-x">' + m.wrong.length + ' 题</div></div><div class="card-b" style="padding:6px 8px">' +
        m.wrong.map(function (q) {
          return '<div class="list-item" style="cursor:default;align-items:flex-start">' +
            '<div class="li-main"><div class="li-t" style="white-space:normal;font-weight:550">' + UI.esc(String(q.stem).slice(0, 90)) + (q.stem.length > 90 ? '…' : '') + '</div>' +
            '<div class="li-s">' + UI.typeTag(q.type) + '<span>' + UI.esc(E.kpLabel(q.kpId)) + '</span></div></div>' +
            '<div class="pill ok" style="white-space:nowrap">正确 ' + E.answerText(q) + '</div></div>';
        }).join('') + '</div></div>';
    }
    html += '</div>';
    return html;
  }

  function bindResult() {
    var s = App.session;
    var root = document.getElementById('view');
    each('[data-act]', function (el) {
      el.addEventListener('click', function () {
        var act = el.getAttribute('data-act');
        if (act === 'home') { App.endSession(); }
        else if (act === 'again') {
          var st = S.get();
          var qs = E.pickQuestions(st, { subjects: ['internal', 'surgery'], count: 15, excludeIds: s.questions.map(function (q) { return q.id; }) });
          var mode = s.mode, title = s.title, back = s.back;
          App.session = null;
          App.startSession({ mode: mode, title: title, questions: qs, back: back });
        } else if (act === 'redo-wrong') {
          var wrong = s.summary.wrong.slice();
          App.session = null;
          App.startSession({ mode: 'review', title: '错题重做', subtitle: '针对刚错的 ' + wrong.length + ' 题', questions: wrong, back: '#/review' });
        }
      });
    });
  }

  /* ======================= 模考 ======================= */
  App.register('mock', {
    meta: { title: '全真模考', sub: '按 306 真实卷面结构组卷' },
    render: function () {
      var st = S.get();
      var paper = window.ML_CURRICULUM.exam.paper;
      var bankN = window.MLBank.list().length;
      var mini = E.composeMock(st, 30);
      var full = E.composeMock(st, 165);
      var html = '';

      html += '<div class="grid g3">' +
        '<div class="card kpi"><div class="kpi-label">试卷总分</div><div class="kpi-num">300<small>分</small></div><div class="kpi-foot">考试时长 180 分钟</div></div>' +
        '<div class="card kpi"><div class="kpi-label">题目总数</div><div class="kpi-num">165<small>题</small></div><div class="kpi-foot">A型 115 / B型 20 / X型 30</div></div>' +
        '<div class="card kpi"><div class="kpi-label">题库余量</div><div class="kpi-num">' + bankN + '<small>题</small></div><div class="kpi-foot">' + (bankN >= 165 ? '已可组全真卷' : '距全真卷还差 ' + (165 - bankN) + ' 题') + '</div></div>' +
        '</div>';

      html += '<div class="sec-title">考试结构（2026 考纲）</div><div class="card"><div class="card-b" style="padding:6px 8px"><table class="table">' +
        '<thead><tr><th>题型</th><th>题号</th><th class="r">题数</th><th class="r">每题</th><th class="r">小计</th><th class="hide-sm">考查重点</th></tr></thead><tbody>' +
        paper.map(function (p) {
          return '<tr><td>' + UI.typeTag(p.type) + ' ' + p.label.replace(/^.*·/, '') + '</td>' +
            '<td class="mono">' + p.from + '–' + p.to + '</td><td class="r">' + p.count + '</td><td class="r">' + p.per + ' 分</td><td class="r"><b>' + p.score + '</b></td>' +
            '<td class="hide-sm muted">' + UI.esc(p.note) + '</td></tr>';
        }).join('') +
        '<tr><td colspan="2"><b>合计</b></td><td class="r"><b>165</b></td><td class="r">—</td><td class="r"><b>300</b></td><td class="hide-sm"></td></tr>' +
        '</tbody></table></div></div>';

      html += '<div class="sec-title">开考</div><div class="grid g2">';
      html += '<div class="card card-pad">' +
        '<div class="row-between"><div class="plan-h">迷你模考' + UI.icon('play') + '</div><span class="pill primary">30 题 · 45 分钟</span></div>' +
        '<div class="small muted" style="margin:8px 0 12px">按比例缩小的整卷，用于检验阶段水平。组卷结果：' + mini.got + ' 题' + (mini.approx ? '（其中 ' + mini.approx + ' 题因题库结构缺口做了替代）' : '') + '。</div>' +
        '<button class="btn btn-primary btn-block" data-act="start-mini" ' + (mini.got < 10 ? 'disabled' : '') + '>开始迷你模考</button>' +
        (mini.got < 30 ? '<div class="xs faint" style="margin-top:8px">结构完整度 ' + mini.got + '/30，接入更多题库后会自动补满</div>' : '') +
        '</div>';
      html += '<div class="card card-pad">' +
        '<div class="row-between"><div class="plan-h">全真模考' + UI.icon('flag') + '</div><span class="pill ' + (full.ok ? 'ok' : 'warn') + '">165 题 · 180 分钟</span></div>' +
        '<div class="small muted" style="margin:8px 0 12px">完整 306 卷面：A型 115 题 / B型 20 题 / X型 30 题，按题型计分。当前题库仅能组出 ' + full.got + ' 题。</div>' +
        '<button class="btn btn-block ' + (full.ok ? 'btn-primary' : '') + '" data-act="start-full" ' + (full.ok ? '' : 'disabled') + '>' + (full.ok ? '开始全真模考' : '题库不足，需先导入') + '</button>' +
        '<div class="row" style="gap:8px;margin-top:8px"><button class="btn btn-sm btn-ghost" data-act="import">' + UI.icon('upload') + ' 导入题库</button>' +
        '<span class="xs faint">还差 ' + Math.max(0, 165 - full.got) + ' 题</span></div>' +
        '</div>';
      html += '</div>';

      var mocks = st.mocks.slice(-5).reverse();
      html += '<div class="sec-title">历史模考</div>';
      if (!mocks.length) {
        html += '<div class="card"><div class="empty"><div class="empty-ico">' + UI.icon('calendar') + '</div><div class="empty-t">还没有模考记录</div><div class="small">建议在阶段复习结束后安排一次，检验真实水平</div></div></div>';
      } else {
        html += '<div class="card"><div class="card-b" style="padding:6px 8px"><table class="table">' +
          '<thead><tr><th>时间</th><th class="r">题量</th><th class="r">正确率</th><th class="r">折算分</th><th class="r hide-sm">用时</th></tr></thead><tbody>' +
          mocks.map(function (m2) {
            return '<tr><td>' + new Date(m2.at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + '</td>' +
              '<td class="r">' + m2.size + '</td><td class="r">' + Math.round(m2.correct / Math.max(1, m2.total) * 100) + '%</td>' +
              '<td class="r"><b>' + m2.score + '</b></td><td class="r hide-sm">' + (m2.used ? Math.round(m2.used / 60000) + ' 分钟' : '—') + '</td></tr>';
          }).join('') + '</tbody></table></div></div>';
      }

      html += '<div class="card" style="margin-top:14px"><div class="card-b small muted" style="line-height:1.9">' +
        '<b style="color:var(--ink)">评分规则</b>：A1 / B 型每题 1.5 分，A2 / X 型每题 2 分；X 型多选、少选、错选均不得分。' +
        '模考成绩按实际组卷满分折算为 300 分制，便于与目标分对比。考试结束前不显示答案，交卷后统一解析。<br>' +
        '<b style="color:var(--ink)">题源</b>：全真模考<b>只使用 306 题源</b>；执业医师 / USMLE / 日本医师的题只进日常训练与专项，不参与模考计分。</div></div>';
      return html;
    },
    mount: function () {
      var root = document.getElementById('view');
      each('[data-act]', function (el) {
        el.addEventListener('click', function () {
          var act = el.getAttribute('data-act');
          var st = S.get();
          if (act === 'start-mini' || act === 'start-full') {
            var size = act === 'start-mini' ? 30 : 165;
            var job = E.composeMock(st, size);
            var per = {};
            job.items.forEach(function (it) { per[it.q.id] = it.per; });
            App.startSession({
              mode: 'mock', title: act === 'start-mini' ? '迷你模考' : '全真模考',
              subtitle: job.items.length + ' 题 · ' + (act === 'start-mini' ? 45 : 180) + ' 分钟',
              questions: job.items.map(function (it) { return it.q; }),
              per: per, instant: false, limitSec: (act === 'start-mini' ? 45 : 180) * 60, back: '#/mock'
            });
          } else if (act === 'import') {
            App.openImportBank();
          }
        });
      });
    }
  });

  function showAnswerCard() {
    var s = App.session;
    var grid = s.questions.map(function (q, i) {
      var done = s.answers[q.id] && s.answers[q.id].length;
      return '<div class="chip ' + (done ? 'on' : '') + '" data-jump="' + i + '" style="justify-content:center;min-width:38px">' + (i + 1) + '</div>';
    }).join('');
    App.modal({
      title: '答题卡 · 已答 ' + s.questions.filter(function (q) { return s.answers[q.id] && s.answers[q.id].length; }).length + ' / ' + s.questions.length,
      body: '<div class="row wrap" style="gap:6px">' + grid + '</div>',
      footer: '<button class="btn" data-close>继续答题</button>',
      onMount: function (r) {
        each('[data-jump]', function (el) {
          el.addEventListener('click', function () {
            s.idx = Number(el.getAttribute('data-jump'));
            App.closeModal(); App.refreshView();
          }, r);
        }, r);
      }
    });
  }

  function askSubmitExam() {
    var s = App.session;
    var answered = s.questions.filter(function (q) { return s.answers[q.id] && s.answers[q.id].length; }).length;
    var left = s.questions.length - answered;
    App.modal({
      title: '确认交卷？',
      body: '<div style="font-size:13.5px;line-height:1.8">已作答 <b>' + answered + '</b> 题' + (left ? '，还有 <b>' + left + '</b> 题未作答（将按错题处理）' : '') + '。<br>交卷后立即出分，并更新你的知识掌握度。</div>',
      footer: '<button class="btn" data-close>再检查一下</button><button class="btn btn-primary" id="do-submit">确认交卷</button>',
      onMount: function (r) {
        my('#do-submit', r).addEventListener('click', function () { App.closeModal(); gradeExam(); });
      }
    });
  }

  function gradeExam() {
    var s = App.session;
    if (!s) return;
    var st = S.get();
    s.questions.forEach(function (q) {
      if (s.revealed[q.id]) return;
      var sel = s.answers[q.id] || [];
      if (!sel.length) { s.revealed[q.id] = true; s.correct[q.id] = false; return; }
      var res = E.applyAnswer(st, q, sel);
      s.revealed[q.id] = true; s.correct[q.id] = res.correct;
    });
    S.saveNow();
    finish();
  }
  App.gradeExam = gradeExam;
})();
