/* 今日训练 + 自由训练 视图 v0.2（截止日倒推 / 多题源） */
(function () {
  'use strict';
  var E = window.Engine, UI = window.UI, App = window.App, S = window.Store;

  function hourGreet() {
    var h = new Date().getHours();
    return h < 6 ? '夜深了' : h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
  }
  function todayLog() {
    return S.get().logs[E.dayKey(Date.now())] || { minutes: 0, answered: 0, correct: 0 };
  }
  function learnedCount() {
    var m = S.get().mastery, n = 0;
    Object.keys(m).forEach(function (k) { if (m[k] && m[k].n) n++; });
    return n;
  }
  function pctStr(v) { return Math.round(v * 100) + '%'; }

  /** 用临时的截止日/时长预演可行性 */
  function previewFeasibility(st, patch) {
    var prof = Object.assign({}, st.profile, patch);
    var target = new Date(prof.deadline + 'T' + (prof.deadlineTime || '23:59') + ':00');
    var span = Math.max(1, Math.ceil((target - Date.now()) / 864e5));
    var clone = Object.assign({}, st, { profile: Object.assign({}, prof, { deadlineSetAt: Date.now(), deadlineSpanDays: span }) });
    return E.feasibility(clone);
  }

  /* ======================= 今日 ======================= */
  App.register('today', {
    meta: { title: '今日训练', sub: '' },
    render: function () {
      var st = S.get();
      var plan = E.buildPlan(st);
      var dl = E.deadlineInfo(st);
      var feas = E.feasibility(st);
      var prog = E.progressInfo(st);
      var pace = E.pace(st);
      var logs = todayLog();
      var due = E.dueKps(st);
      var pred = E.predictScore(st);
      var learned = learnedCount();
      var totalKp = E.kps.length;
      var rw = E.remainingWork(st);
      var examName = window.ML_CURRICULUM.exam.name;
      var behind = prog.gap < -0.05;

      var insight = plan.blocks[0]
        ? plan.blocks[0].reason
        : '还没有学习记录，先做一次能力诊断，系统会按你的薄弱点生成计划。';
      if (st.profile.demo) insight = '当前是演示数据。先随意点一圈，再到「设置 → 数据」一键清空，开始记录你自己的学习。';

      var html = '';

      if (st.profile.demo) {
        html += '<div class="card" style="margin-bottom:16px;border:1px solid color-mix(in srgb,var(--warn) 35%,transparent);background:var(--warn-soft)">' +
          '<div class="card-b row" style="gap:10px;padding:14px 16px;font-size:13px;color:var(--warn)">' +
          UI.icon('alert') + '<span class="grow">当前展示的是<b>演示数据</b>（含示例学习记录与错题），用于预览各项功能。</span>' +
          '<button class="btn btn-sm" data-act="clear-demo">清空演示数据</button></div></div>';
      }

      /* ---------- HERO ---------- */
      html += '<div class="hero">' +
        '<div class="hero-top">' +
        '<div class="grow" style="min-width:240px">' +
        '<div class="hero-greet">' + UI.todayLabel() + ' · ' + hourGreet() + '</div>' +
        '<div class="hero-title">距复习截止（' + dl.date + ' ' + dl.time + '）还有 <b>' + (dl.passed ? 0 : dl.days) + '</b> 天</div>' +
        '<div class="hero-desc">' + UI.esc(insight) + '</div>' +
        '<div class="hero-act">' +
        '<button class="btn btn-white" data-act="start-today">' + UI.icon('play') + ' 开始今日训练（' + plan.target + ' 题）</button>' +
        (due.length ? '<button class="btn" data-act="review">' + UI.icon('rotate') + ' 复习 ' + due.length + ' 个到期考点</button>' : '') +
        '<button class="btn" data-act="deadline">' + UI.icon('calendar') + ' 调整截止日</button>' +
        '</div>' +
        '</div>' +
        '<div class="hero-right">' +
        '<div class="hero-greet">' + (pred.enough ? '当前水平预测' : '水平预测 · 样本不足') + '</div>' +
        '<div class="hero-big">' + (pred.enough ? Math.round(pred.total) : '—') + '<small> / 300</small></div>' +
        '<div class="hero-greet">' + (pred.enough
          ? '区间 ' + pred.range[0] + '–' + pred.range[1] + ' · ' + examName
          : '已答 ' + pred.answered + ' 题 · 按六科自评粗估约 ' + Math.round(pred.total) + ' 分') + '</div>' +
        '</div></div>' +

        /* 进度 vs 应达 + 可行性 */
        '<div class="hero-stats" style="gap:26px">' +
        '<div class="hero-stat" style="min-width:200px;flex:1">' +
        '<div class="k" style="margin-bottom:6px">整体进度 <b>' + pctStr(prog.done) + '</b> · 应达 ' + pctStr(prog.expected) +
        (behind ? '（落后 ' + Math.round(Math.abs(prog.gap) * 100) + ' 个点）' : '（进度正常）') + '</div>' +
        '<div class="progress" style="height:8px;background:color-mix(in srgb,currentColor 22%,transparent)">' +
        '<i style="width:' + pctStr(prog.done) + ';background:currentColor"></i></div>' +
        '<div style="position:relative;height:0"><div style="position:absolute;left:' + pctStr(prog.expected) + ';top:-16px;width:2px;height:14px;background:currentColor"></div></div>' +
        '<div class="k" style="margin-top:8px;opacity:.78">竖线 = 按时间应达到的位置</div>' +
        '</div>' +
        '<div class="hero-stat"><div class="v">' + Math.round(rw.W) + '<small style="font-size:11px"> 题量当量</small></div><div class="k">剩余工作量</div></div>' +
        '<div class="hero-stat"><div class="v">' + plan.target + '</div><div class="k">今日需完成题量</div></div>' +
        '<div class="hero-stat"><div class="v">' + feas.label + '</div><div class="k">截止可行性 F=' + (feas.F > 90 ? '∞' : feas.F.toFixed(2)) + '</div></div>' +
        '</div>' +
        (feas.solutions.length ? '<div class="hero-desc" style="margin-top:12px;background:color-mix(in srgb,currentColor 14%,transparent);padding:12px 14px;border-radius:12px">' +
          '<b>按此截止日排不下</b>：' + feas.solutions.map(function (s) { return s.k + ' ' + s.v; }).join('；') + '</div>' : '') +
        '</div>';

      /* ---------- KPI ---------- */
      html += '<div class="grid g4" style="margin-top:14px">' +
        '<div class="card kpi"><div class="kpi-label">今日已学</div><div class="kpi-num">' + (logs.minutes || 0) + '<small>min</small></div>' +
        '<div class="kpi-foot">计划 ' + plan.minutes + ' 分钟</div></div>' +
        '<div class="card kpi"><div class="kpi-label">今日答题</div><div class="kpi-num">' + (logs.answered || 0) + '<small>题</small></div>' +
        '<div class="kpi-foot">' + (logs.answered ? '正确率 ' + Math.round(logs.correct / logs.answered * 100) + '%' : '还没开始') + '</div></div>' +
        '<div class="card kpi"><div class="kpi-label">待复习考点</div><div class="kpi-num" style="color:var(--warn)">' + due.length + '</div>' +
        '<div class="kpi-foot">明日起预计 ' + E.dueKps(st, Date.now() + 864e5).length + ' 个</div></div>' +
        '<div class="card kpi"><div class="kpi-label">知识覆盖</div><div class="kpi-num">' + Math.round(learned / totalKp * 100) + '<small>%</small></div>' +
        '<div class="kpi-foot">' + learned + ' / ' + totalKp + ' 个考点 · 连续 ' + E.streak(st) + ' 天</div></div>' +
        '</div>';

      /* ---------- 截止可行性 ---------- */
      var onTrack = pace.etaDays != null && pace.etaDays <= (dl.days || 0);
      html += '<div class="sec-title">截止前能不能复习完</div>';
      html += '<div class="card card-pad"><div class="row wrap" style="gap:22px;align-items:flex-start">' +
        UI.ring(prog.done, pctStr(prog.done), '整体进度', 'var(--primary)') +
        '<div class="grow" style="min-width:260px">' +
        '<div class="row-between"><b style="font-size:13.5px">剩余 ' + Math.round(rw.W) + ' 题量当量 / ' + feas.D + ' 个有效学习日</b>' +
        '<span class="pill ' + feas.cls + '">可行性：' + feas.label + '</span></div>' +
        '<div class="small muted" style="margin-top:6px">每日需完成 <b>' + Math.ceil(feas.need) + '</b> 题；按 ' + (st.profile.dailyMinutes || 150) + ' 分钟/天，容量约 <b>' + Math.round(feas.cap) + '</b> 题。' + UI.esc(feas.advice) + '</div>' +
        '<div class="feas-box" style="margin-top:12px">' +
        '<div class="feas-row"><span class="k">近 7 天速度</span><span class="v">' + pace.perDay + ' 题/天</span>' +
        '<span class="faint xs">' + (pace.perDay > 0 ? '按此速度预计 ' + (pace.eta ? E.dayKey(pace.eta) + ' 完成' : '—') : '暂无数据') + '</span></div>' +
        '<div class="feas-row"><span class="k">状态分布</span><span class="v">未学 ' + feas.counts.new + ' · 薄弱 ' + feas.counts.weak + ' · 待复习 ' + feas.counts.due + ' · 已掌握 ' + feas.counts.mastered + '</span></div>' +
        '<div class="feas-row"><span class="k">结论</span><span class="v" style="color:' + (onTrack ? 'var(--ok)' : 'var(--danger)') + '">' +
        (pace.etaDays == null ? '累计 7 天数据后给出预测' : (onTrack ? '按当前速度可在截止前完成' : '按当前速度会晚 ' + (pace.etaDays - (dl.days || 0)) + ' 天')) + '</span></div>' +
        (feas.solutions.length ? '<div class="feas-sol">' + feas.solutions.map(function (s) {
          return '<div class="s"><b>' + s.k + '</b><span>' + s.v + '</span></div>';
        }).join('') + '</div>' : '') +
        '</div></div></div></div>';

      /* ---------- 今日计划 ---------- */
      html += '<div class="sec-title">今日计划 · 由截止日、薄弱点与遗忘曲线自动生成</div>';
      html += '<div class="card"><div class="card-b" style="padding:14px">' + plan.blocks.map(UI.planBlock).join('') +
        '<div class="xs faint" style="margin-top:10px;padding:0 4px">计划按「剩余工作量 ÷ 有效学习日」倒推；改截止日会立即重算（' +
        (plan.tight ? '当前偏紧，复习块降到 20%、短板升到 50%' : '当前宽松，复习块 26%、短板 40%、综合 34%') + '）。</div>' +
        '</div></div>';

      /* ---------- 能力画像 ---------- */
      var avgCov = E.subjects.reduce(function (a, s) { return a + E.subjectStat(st, s.id).coverage; }, 0) / E.subjects.length;
      html += '<div class="sec-title">能力画像</div><div class="grid g2">';
      html += '<div class="card"><div class="card-h"><div class="card-t">各科预测得分</div><div class="card-x">' + (pred.enough ? '共 300 分' : '样本不足，仅供参考') + ' · 变式修正 ' + Math.round(pred.migrationFactor * 100) + '%</div></div><div class="card-b">' +
        pred.bySubject.map(function (s) { return UI.subjectBar(s, true); }).join('') + '</div></div>';
      html += '<div class="card"><div class="card-h"><div class="card-t">已学考点掌握度</div><div class="card-x">平均覆盖 ' + Math.round(avgCov * 100) + '%</div></div>' +
        '<div class="card-b center">' + UI.radar(E.subjects.map(function (s) {
          var stt = E.subjectStat(st, s.id);
          return { label: s.name, value: stt.m, color: s.color };
        }), 300) +
        '<div class="xs faint center" style="margin-top:4px">只统计已学考点；未开始的学科为 0%</div></div></div>';
      html += '</div>';

      /* ---------- 最该补的考点 ---------- */
      var weak = E.kps.map(function (kp) {
        return { kp: kp, s: E.status(st, kp.id), p: E.priority(st, kp.id), t: E.styleTransfer(st, kp.id) };
      }).filter(function (x) { return x.s === 'weak' || (x.s === 'due' && E.mastery(st, x.kp.id) < 0.6); })
        .sort(function (a, b) { return b.p - a.p; }).slice(0, 4);

      html += '<div class="sec-title">最该补的考点</div>';
      if (!weak.length) {
        html += '<div class="card"><div class="empty"><div class="empty-ico">' + UI.icon('check') + '</div><div class="empty-t">暂无高优先级薄弱点</div><div class="small">继续按计划推进，或做一次诊断测评刷新画像</div></div></div>';
      } else {
        html += '<div class="card">' + weak.map(function (x) {
          var kp = x.kp, subj = E.SUBJ[kp.subject];
          var mig = x.t ? (x.t.value < 0.7 ? '<span class="pill danger">迁移 ' + x.t.value.toFixed(2) + '</span>' : '<span class="pill ok">迁移 ' + x.t.value.toFixed(2) + '</span>') : '';
          return '<div class="list-item" data-act="drill" data-kp="' + encodeURIComponent(kp.id) + '">' +
            '<div class="plan-ico" style="background:' + subj.color + '1a;color:' + subj.color + ';width:32px;height:32px;border-radius:9px">' + UI.icon('brain') + '</div>' +
            '<div class="li-main"><div class="li-t">' + UI.esc(kp.name) + '</div>' +
            '<div class="li-s"><span>' + UI.esc(subj.name) + ' · ' + UI.esc(kp.chapter) + '</span>' +
            '<span>掌握 ' + Math.round(E.mastery(st, kp.id) * 100) + '%</span>' +
            '<span>保持率 ' + Math.round(E.retention(st, kp.id) * 100) + '%</span>' + mig + '</div></div>' +
            UI.statusPill(x.s) +
            '<button class="btn btn-sm btn-soft">专练</button></div>';
        }).join('') + '</div>';
      }

      /* ---------- 14 天趋势 ---------- */
      var logsAll = st.logs, labels = [], mins = [], accs = [];
      for (var i = 13; i >= 0; i--) {
        var d = new Date(Date.now() - i * 864e5), k = E.dayKey(d);
        var lg = logsAll[k];
        labels.push((d.getMonth() + 1) + '/' + d.getDate());
        mins.push(lg ? lg.minutes / 60 : 0);
        accs.push(lg && lg.answered ? lg.correct / lg.answered : 0);
      }
      html += '<div class="sec-title">最近 14 天节奏</div><div class="grid g2">' +
        '<div class="card"><div class="card-h"><div class="card-t">每日学习时长</div><div class="card-x"><span class="legend"><span><i style="background:var(--primary)"></i>小时</span></span></div></div><div class="card-b">' +
        UI.line(mins, labels, { height: 170, max: Math.max(1, Math.ceil(Math.max.apply(null, mins))) }) + '</div></div>' +
        '<div class="card"><div class="card-h"><div class="card-t">每日正确率</div><div class="card-x"><span class="legend"><span><i style="background:var(--accent)"></i>%</span></span></div></div><div class="card-b">' +
        UI.line(accs, labels, { height: 170, max: 1, color: 'var(--accent)', fmt: function (v) { return Math.round(v * 100); } }) + '</div></div>' +
        '</div>';

      return html;
    },
    mount: function () {
      var st = S.get();
      var plan = E.buildPlan(st);
      var root = document.getElementById('view');
      root.addEventListener('click', function (e) {
        var el = e.target.closest('[data-act]');
        var blockBtn = e.target.closest('[data-start-block]');
        if (blockBtn) {
          var b = plan.blocks.filter(function (x) { return x.id === blockBtn.getAttribute('data-start-block'); })[0];
          if (b) startBlock(b);
          return;
        }
        if (!el) return;
        var act = el.getAttribute('data-act');
        if (act === 'clear-demo') {
          App.modal({
            title: '清空演示数据？',
            body: '<div style="font-size:13.5px;line-height:1.8">将删除示例学习记录、错题与掌握度，保留你的个人设置（复习截止日、每日时长、六科自评）。之后所有数据都从你真实的学习行为重新积累。</div>',
            footer: '<button class="btn" data-close>取消</button><button class="btn btn-primary" id="do-clear">确认清空</button>',
            onMount: function (r) {
              r.querySelector('#do-clear').addEventListener('click', function () {
                S.clearDemo(); App.closeModal(); App.toast('已清空演示数据'); App.refreshChrome(); App.render();
              });
            }
          });
        } else if (act === 'start-today') {
          startBlock(plan.blocks[0]);
        } else if (act === 'review') {
          var due = E.dueKps(st);
          var qs = E.pickQuestions(st, { kpIds: due.map(function (d) { return d.kpId; }), count: Math.min(20, Math.max(6, due.length)) });
          App.startSession({ mode: 'review', title: '遗忘曲线复习', subtitle: '到期考点 · 按记忆保持率排序', questions: qs, back: '#/today' });
        } else if (act === 'diag') {
          startDiagnostic();
        } else if (act === 'deadline') {
          openDeadlineModal();
        } else if (act === 'drill') {
          var kpId = decodeURIComponent(el.getAttribute('data-kp'));
          drill(kpId);
        }
      });
    }
  });

  function startBlock(b) {
    if (!b) return;
    var st = S.get();
    var opts = { kpIds: b.kpIds, subjects: b.subjectIds, types: b.types, count: b.count, mixExtRatio: b.mixExtRatio || 0 };
    var qs = E.pickQuestions(st, opts);
    if (qs.length < Math.min(3, b.count)) {
      qs = E.pickQuestions(st, { types: b.types, count: b.count, mixExtRatio: b.mixExtRatio || 0 });
    }
    if (!qs.length) { App.toast('这个计划块暂时没有可用题目'); return; }
    App.startSession({
      mode: b.kind === 'review' ? 'review' : 'train',
      title: b.title, subtitle: qs.length + ' 题 · 约 ' + b.minutes + ' 分钟',
      questions: qs, back: '#/today', meta: { block: b.id }
    });
  }
  App.startBlock = startBlock;

  function drill(kpId) {
    var st = S.get();
    var qs = E.pickQuestions(st, { kpIds: [kpId], count: 6, mixExtRatio: 0.3 });
    if (!qs.length) { App.toast('这个考点暂时没有题目'); return; }
    App.startSession({ mode: 'train', title: '考点专练', subtitle: E.kpLabel(kpId), questions: qs, back: '#/today' });
  }
  App.drill = drill;

  function startDiagnostic() {
    var st = S.get();
    var qs = [];
    E.subjects.forEach(function (s) {
      var picked = E.pickQuestions(st, { subjects: [s.id], count: 4, excludeIds: qs.map(function (q) { return q.id; }), mixExtRatio: 0.25 });
      qs = qs.concat(picked);
    });
    if (qs.length < 8) { App.toast('题库不足以生成诊断卷，请先导入更多题目'); return; }
    App.startSession({
      mode: 'diag', title: '能力诊断测评', subtitle: qs.length + ' 题 · 覆盖 6 个学科，用于初始化掌握度画像',
      questions: qs, back: '#/today', meta: { diag: true }
    });
  }
  App.startDiagnostic = startDiagnostic;

  /* ---------------- 调整复习截止日 ---------------- */
  function openDeadlineModal() {
    var st = S.get();
    var prof = st.profile;
    var fmt = function (d) {
      var m = d.getMonth() + 1, dd = d.getDate();
      return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
    };
    var plus = function (n) { return fmt(new Date(Date.now() + n * 864e5)); };
    var body = '<div style="display:grid;gap:14px">' +
      '<div class="row" style="gap:10px;flex-wrap:wrap">' +
      '<div class="field" style="flex:1;min-width:150px"><label>复习截止日</label>' +
      '<input class="input" type="date" id="dl-date" value="' + prof.deadline + '"></div>' +
      '<div class="field" style="width:120px"><label>时刻</label>' +
      '<input class="input" type="time" id="dl-time" value="' + (prof.deadlineTime || '23:59') + '"></div></div>' +
      '<div class="row wrap" style="gap:8px">' +
      '<div class="chip" data-quick="' + plus(14) + '">两周后</div>' +
      '<div class="chip" data-quick="' + plus(30) + '">一个月后</div>' +
      '<div class="chip" data-quick="' + plus(60) + '">两个月后</div>' +
      '<div class="chip" data-quick="2026-12-20">12-20</div>' +
      '<div class="chip" data-quick="2026-12-27">12-27</div>' +
      '</div>' +
      '<div class="feas-box" id="dl-preview"></div>' +
      '<div class="xs faint">调整后立即重算每日题量；学习记录不会变化。当前进度 ' + Math.round(E.progressInfo(st).done * 100) + '%</div>' +
      '</div>';
    App.modal({
      title: '复习截止时间',
      body: body,
      footer: '<button class="btn" data-close>取消</button><button class="btn btn-primary" id="dl-save">保存并重算</button>',
      onMount: function (r) {
        var dateEl = r.querySelector('#dl-date'), timeEl = r.querySelector('#dl-time');
        var prev = r.querySelector('#dl-preview');
        var renderPreview = function () {
          var f = previewFeasibility(st, { deadline: dateEl.value, deadlineTime: timeEl.value || '23:59' });
          var dl = E.deadlineInfo({ profile: Object.assign({}, st.profile, { deadline: dateEl.value, deadlineTime: timeEl.value }) });
          prev.innerHTML =
            '<div class="feas-row"><span class="k">剩余天数</span><span class="v">' + dl.days + ' 天 · 有效学习日 ' + f.D + '</span></div>' +
            '<div class="feas-row"><span class="k">每日需完成</span><span class="v">' + Math.ceil(f.need) + ' 题（容量约 ' + Math.round(f.cap) + ' 题）</span></div>' +
            '<div class="feas-row"><span class="k">可行性</span><span class="pill ' + f.cls + '">' + f.label + ' · F=' + (f.F > 90 ? '∞' : f.F.toFixed(2)) + '</span></div>' +
            (f.solutions.length ? '<div class="feas-sol">' + f.solutions.map(function (s) { return '<div class="s"><b>' + s.k + '</b><span>' + s.v + '</span></div>'; }).join('') + '</div>' : '');
        };
        dateEl.addEventListener('change', renderPreview);
        timeEl.addEventListener('change', renderPreview);
        renderPreview();
        r.querySelectorAll('[data-quick]').forEach(function (c) {
          c.addEventListener('click', function () {
            dateEl.value = c.getAttribute('data-quick');
            renderPreview();
          });
        });
        r.querySelector('#dl-save').addEventListener('click', function () {
          var v = dateEl.value;
          if (!v) { App.toast('请选择日期'); return; }
          var t = timeEl.value || '23:59';
          var target = new Date(v + 'T' + t + ':00');
          prof.deadline = v;
          prof.deadlineTime = t;
          prof.deadlineSetAt = Date.now();
          prof.deadlineSpanDays = Math.max(1, Math.ceil((target - Date.now()) / 864e5));
          S.saveNow();
          App.closeModal();
          App.toast('已更新截止日，计划已重算');
          App.refreshChrome();
          App.render();
        });
      }
    });
  }
  App.openDeadlineModal = openDeadlineModal;

  /* ======================= 自由训练 ======================= */
  var picked = { subjects: ['internal', 'surgery'], types: ['A1', 'A2', 'X'], styles: [], count: 15, chapters: [] };

  App.register('train', {
    meta: { title: '自由训练', sub: '按学科 / 题型 / 题源自由组卷，题目按薄弱度智能排序' },
    render: function () {
      var st = S.get();
      var due = E.dueKps(st);
      var weakCh = E.rankChapters(st).slice(0, 3);
      var bank = window.MLBank.list();
      var styleTotals = E.styleTotals(st);

      var html = '';
      html += '<div class="sec-title">快速开始</div><div class="grid g3">' +
        quickCard('rotate', 'warn', '到期复习', due.length + ' 个考点保持率跌破阈值', '复习', 'quick-review') +
        quickCard('target', 'primary', '短板突破', weakCh.map(function (c) { return E.SUBJ[c.subject].name + '·' + c.name; }).slice(0, 2).join(' / '), '突破', 'quick-weak') +
        quickCard('spark', 'accent', '随机综合', '全科随机 ' + Math.min(20, bank.length) + ' 题，含 15% 变式', '综合', 'quick-mix') +
        '</div>';

      html += '<div class="sec-title">自定义组卷</div><div class="card"><div class="card-b">';
      html += '<div class="row-between" style="margin-bottom:8px"><b style="font-size:12.5px">学科</b><span class="xs faint">已选 ' + picked.subjects.length + ' / 6</span></div>';
      html += '<div class="row wrap" style="gap:8px">' + E.subjects.map(function (s) {
        return '<div class="chip ' + (picked.subjects.indexOf(s.id) >= 0 ? 'on' : '') + '" data-subj="' + s.id + '">' +
          '<span style="width:16px;height:16px;border-radius:5px;background:' + s.color + ';display:inline-grid;place-items:center;color:#fff;font-size:9.5px;font-weight:800">' + s.short + '</span>' +
          s.name + '</div>';
      }).join('') + '</div>';

      /* 章节（只显示所选学科下的章节；不选 = 全部章节） */
      var chapPool = E.chapters.filter(function (c) { return picked.subjects.indexOf(c.subject) >= 0; });
      var chapCount = {};
      window.MLBank.list().forEach(function (q) { chapCount[q.chapterId] = (chapCount[q.chapterId] || 0) + 1; });
      html += '<div class="row-between" style="margin:16px 0 8px"><b style="font-size:12.5px">章节</b><span class="xs faint">' +
        (chapPool.length ? (picked.chapters.length ? '已选 ' + picked.chapters.length + ' 章 · 再点取消' : '不选 = 所选学科全部章节') : '先选学科，再按章节筛') + '</span></div>';
      if (chapPool.length) {
        html += '<div class="row wrap" style="gap:8px;max-height:132px;overflow:auto">' + chapPool.map(function (c) {
          var n = chapCount[c.id] || 0;
          return '<div class="chip ' + (picked.chapters.indexOf(c.id) >= 0 ? 'on' : '') + '" data-chapter="' + c.id + '" ' + (n ? '' : 'style="opacity:.4"') + '>' +
            '<span style="width:7px;height:7px;border-radius:50%;background:' + E.SUBJ[c.subject].color + '"></span>' + c.name + ' <span class="xs">' + n + '</span></div>';
        }).join('') +
        (picked.chapters.length ? '<div class="chip" data-chapter-clear="1">清空</div>' : '') + '</div>';
      } else {
        html += '<div class="xs faint">选择学科后可按章节筛选</div>';
      }

      html += '<div class="row-between" style="margin:16px 0 8px"><b style="font-size:12.5px">题型</b><span class="xs faint">X / 选2项：多选少选均不得分</span></div>';
      html += '<div class="row wrap" style="gap:8px">' + ['A1', 'A2', 'B', 'X', 'X2'].map(function (t) {
        var n = window.MLBank.byType(t).length;
        return '<div class="chip ' + (picked.types.indexOf(t) >= 0 ? 'on' : '') + '" data-type="' + t + '" ' + (n ? '' : 'style="opacity:.4"') + '>' +
          UI.typeTag(t) + ' ' + (window.ML_TYPES[t] ? window.ML_TYPES[t].label : t) + ' <span class="xs">' + n + '</span></div>';
      }).join('') + '</div>';

      html += '<div class="row-between" style="margin:16px 0 8px"><b style="font-size:12.5px">题源</b><span class="xs faint">不选 = 全部（按 15% 变式混排）</span></div>';
      html += '<div class="row wrap" style="gap:8px">' + Object.keys(E.STYLES).map(function (k) {
        var s = E.STYLES[k], n = window.MLBank.byStyle(k).length;
        return '<div class="chip ' + (picked.styles.indexOf(k) >= 0 ? 'on' : '') + '" data-style="' + k + '" ' + (n ? '' : 'style="opacity:.4"') + '>' +
          '<span style="width:7px;height:7px;border-radius:50%;background:' + s.color + '"></span>' + s.name + ' <span class="xs">' + n + '</span></div>';
      }).join('') + '</div>';

      html += '<div class="row-between" style="margin:16px 0 8px"><b style="font-size:12.5px">题量</b>' +
        '<span class="xs faint">近 7 天作答：' + ['cn306', 'cn_practice', 'usmle', 'jp'].map(function (k) {
          return (E.STYLES[k] ? E.STYLES[k].short : k) + ' ' + (styleTotals[k] ? styleTotals[k].n : 0);
        }).join(' · ') + '</span></div>';
      html += '<div class="row wrap" style="gap:8px">' + [10, 15, 20, 30].map(function (n) {
        return '<div class="chip ' + (picked.count === n ? 'on' : '') + '" data-count="' + n + '">' + n + ' 题</div>';
      }).join('') + '</div>';

      html += '<div class="row" style="margin-top:18px;gap:10px;flex-wrap:wrap">' +
        '<button class="btn btn-primary" data-act="start-custom">' + UI.icon('play') + ' 开始训练</button>' +
        '<button class="btn" data-act="start-diag">' + UI.icon('target') + ' 重新诊断</button>' +
        '<span class="xs faint">按掌握度与遗忘曲线排序，优先出「刚好不会」的题</span></div>';
      html += '</div></div>';

      /* 题库构成 */
      html += '<div class="sec-title">题库构成</div><div class="card"><div class="card-b" style="padding:6px 8px">' +
        '<table class="table"><thead><tr><th>学科</th><th class="r">A1</th><th class="r">A2</th><th class="r">B</th><th class="r">X</th><th class="r">变式</th><th class="r">合计</th><th class="r hide-sm">考纲占分</th></tr></thead><tbody>' +
        E.subjects.map(function (s) {
          var qs = window.MLBank.bySubject(s.id);
          var ext = qs.filter(function (q) { return q.style !== 'cn306'; }).length;
          return '<tr><td>' + UI.subjDot(s.id) + ' ' + s.name + '</td>' + ['A1', 'A2', 'B', 'X'].map(function (t) {
            return '<td class="r">' + qs.filter(function (q) { return q.type === t; }).length + '</td>';
          }).join('') + '<td class="r">' + (ext ? '<b style="color:var(--accent)">' + ext + '</b>' : '—') + '</td>' +
            '<td class="r"><b>' + qs.length + '</b></td><td class="r hide-sm">' + Math.round(s.share * 100) + '%</td></tr>';
        }).join('') + '</tbody></table>' +
        '<div class="xs faint" style="padding:8px 8px 4px">题源分布：' +
        Object.keys(E.STYLES).map(function (k) {
          return '<b style="color:' + E.STYLES[k].color + '">' + E.STYLES[k].name + '</b> ' + window.MLBank.byStyle(k).length + ' 题';
        }).join(' · ') + '</div></div></div>';

      var recent = st.sessions.slice(-6).reverse();
      html += '<div class="sec-title">最近训练</div>';
      html += recent.length ? '<div class="card">' + recent.map(function (s) {
        var acc = s.total ? Math.round(s.correct / s.total * 100) : 0;
        return '<div class="list-item"><div class="li-main"><div class="li-t">' + UI.esc(s.title || (s.mode === 'review' ? '复习' : '训练')) + '</div>' +
          '<div class="li-s"><span>' + new Date(s.at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + '</span>' +
          '<span>' + s.total + ' 题</span><span>' + (s.minutes || 0) + ' 分钟</span></div></div>' +
          '<div class="pill ' + (acc >= 60 ? 'ok' : 'danger') + '">正确率 ' + acc + '%</div></div>';
      }).join('') + '</div>' : '<div class="card"><div class="empty"><div class="empty-ico">' + UI.icon('play') + '</div><div class="empty-t">还没有训练记录</div><div class="small">从上面的「快速开始」选一个开始</div></div></div>';

      return html;
    },
    mount: function () {
      var root = document.getElementById('view');
      root.addEventListener('click', function (e) {
        var clr = e.target.closest('[data-chapter-clear]');
        if (clr) { picked.chapters = []; App.refreshView(); return; }
        var chip = e.target.closest('[data-subj],[data-type],[data-style],[data-count],[data-chapter]');
        if (chip) {
          if (chip.hasAttribute('data-subj')) {
            toggle(picked.subjects, chip.getAttribute('data-subj'));
            // 学科变化后，剔除不属于已选学科的章节
            picked.chapters = picked.chapters.filter(function (id) {
              var c = E.chapterById[id];
              return c && picked.subjects.indexOf(c.subject) >= 0;
            });
          }
          if (chip.hasAttribute('data-type')) toggle(picked.types, chip.getAttribute('data-type'));
          if (chip.hasAttribute('data-style')) toggle(picked.styles, chip.getAttribute('data-style'));
          if (chip.hasAttribute('data-count')) picked.count = Number(chip.getAttribute('data-count'));
          if (chip.hasAttribute('data-chapter')) toggle(picked.chapters, chip.getAttribute('data-chapter'));
          App.refreshView();
          return;
        }
        var el = e.target.closest('[data-act]');
        if (!el) return;
        var act = el.getAttribute('data-act');
        var st = S.get();
        if (act === 'start-custom') {
          if (!picked.subjects.length || !picked.types.length) { App.toast('请至少选择一个学科和一个题型'); return; }
          var qs = E.pickQuestions(st, {
            subjects: picked.subjects, types: picked.types, count: picked.count,
            chapters: picked.chapters.length ? picked.chapters : null,
            styles: picked.styles.length ? picked.styles : null,
            mixExtRatio: picked.styles.length ? 0 : 0.15
          });
          if (!qs.length) { App.toast('没有符合条件的题目，试试放宽筛选'); return; }
          App.startSession({ mode: 'train', title: '自由训练', subtitle: qs.length + ' 题', questions: qs, back: '#/train' });
        } else if (act === 'start-diag') {
          startDiagnostic();
        } else if (act === 'quick-review') {
          var due = E.dueKps(st);
          if (!due.length) { App.toast('当前没有到期的复习点，先去学新内容吧'); return; }
          var q1 = E.pickQuestions(st, { kpIds: due.map(function (d) { return d.kpId; }), count: Math.min(20, due.length) });
          App.startSession({ mode: 'review', title: '到期复习', questions: q1, back: '#/train' });
        } else if (act === 'quick-weak') {
          var ranks = E.rankChapters(st).slice(0, 3);
          var kpIds = [];
          ranks.forEach(function (c) { E.chapterById[c.id].kps.forEach(function (k) { kpIds.push(k.id); }); });
          var q2 = E.pickQuestions(st, { kpIds: kpIds, count: 15, mixExtRatio: 0.2 });
          App.startSession({ mode: 'train', title: '短板突破', questions: q2, back: '#/train' });
        } else if (act === 'quick-mix') {
          var q3 = E.pickQuestions(st, { subjects: E.subjects.map(function (s) { return s.id; }), count: 15, mixExtRatio: 0.15 });
          App.startSession({ mode: 'train', title: '随机综合', questions: q3, back: '#/train' });
        }
      });
    }
  });

  function quickCard(icon, tone, title, desc, btn, act) {
    return '<div class="card card-pad" style="display:flex;flex-direction:column;gap:10px">' +
      '<div class="plan-ico ' + tone + '" style="width:48px;height:48px;border-radius:14px">' + UI.icon(icon) + '</div>' +
      '<div class="plan-h">' + title + '</div>' +
      '<div class="small muted" style="min-height:40px">' + UI.esc(desc) + '</div>' +
      '<button class="btn btn-soft btn-sm" data-act="' + act + '" style="align-self:flex-start">' + btn + UI.icon('arrow') + '</button></div>';
  }
  function toggle(arr, v) {
    var i = arr.indexOf(v);
    if (i >= 0) arr.splice(i, 1); else arr.push(v);
  }
})();
