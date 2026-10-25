/* 知识图谱 / 题库浏览 / 错题复习 */
(function () {
  'use strict';
  var E = window.Engine, UI = window.UI, App = window.App, S = window.Store;
  function each(sel, fn, root) { Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn); }

  /* ======================= 知识图谱 ======================= */
  var mapState = { subject: 'physiology', filter: 'all', open: {}, closed: {}, renderedOpen: {}, initialized: {} };
  var FILTERS = [
    { id: 'all', name: '全部' },
    { id: 'weak', name: '薄弱' },
    { id: 'due', name: '待复习' },
    { id: 'new', name: '未学习' },
    { id: 'mastered', name: '已掌握' }
  ];

  App.register('map', {
    meta: { title: '知识图谱', sub: '6 学科 / 203 考点，按大纲逐层拆解' },
    render: function (q) {
      if (q && q.s && E.SUBJ[q.s]) mapState.subject = q.s;
      var st = S.get();
      var sid = mapState.subject;
      var subj = E.SUBJ[sid];
      var ret = function (kpId) { return E.retention(st, kpId); };

      var html = '';
      /* 学科卡片 */
      html += '<div class="grid g3" style="margin-bottom:16px">';
      E.subjects.forEach(function (s) {
        var stt = E.subjectStat(st, s.id);
        var learnedVals = E.subjKps[s.id].filter(function (kp) { var m = st.mastery[kp.id]; return m && m.n; })
          .map(function (kp) { return Math.round(st.mastery[kp.id].m * 100) + '%'; });
        var mTitle = stt.learned
          ? '全科掌握度 = 已学 ' + stt.learned + ' 个考点的平均掌握度(' + Math.round(stt.m * 100) + '%) × 覆盖率(' + stt.learned + '/' + stt.total + ')；各考点：' + learnedVals.join(' / ')
          : '还没有学过该学科的考点';
        html += '<div class="card card-pad" data-subject="' + s.id + '" style="cursor:pointer;' + (s.id === sid ? 'border-color:' + s.color + ';box-shadow:0 0 0 2px ' + s.color + '22' : '') + '">' +
          '<div class="row-between"><div class="row" style="gap:8px">' +
          '<span style="width:22px;height:22px;border-radius:6px;background:' + s.color + ';color:#fff;display:grid;place-items:center;font-size:11px;font-weight:800">' + s.short + '</span>' +
          '<b style="font-size:13px">' + s.name + '</b></div>' +
          '<span class="xs faint">占分 ' + Math.round(s.share * 100) + '%</span></div>' +
          '<div class="row-between" style="margin-top:10px" title="' + UI.esc(mTitle) + '"><span class="xs faint">全科掌握度</span><b class="mono" style="font-size:13px">' + (stt.learned ? Math.round(stt.mTotal * 100) + '%' : '—') + '</b></div>' +
          '<div class="bar" style="margin-top:5px"><i style="width:' + (stt.learned ? Math.round(stt.mTotal * 100) : 0) + '%;background:' + s.color + '"></i></div>' +
          '<div class="row-between" style="margin-top:7px"><span class="xs faint">覆盖 ' + stt.learned + '/' + stt.total + (stt.learned ? ' · 已学平均 ' + Math.round(stt.m * 100) + '%' : '') + '</span>' +
          (stt.due ? '<span class="pill warn" style="font-size:10px">待复习 ' + stt.due + '</span>' : '') + '</div></div>';
      });
      html += '</div>';

      /* 筛选 */
      html += '<div class="row wrap" style="gap:8px;align-items:center;margin:6px 0 12px">' +
        '<span class="small muted" style="font-weight:700">筛选</span>' +
        FILTERS.map(function (f) {
          return '<div class="chip ' + (mapState.filter === f.id ? 'on' : '') + '" data-filter="' + f.id + '">' + f.name + '</div>';
        }).join('') +
        '<span class="grow"></span><span class="xs faint">迁移 = 非306正确率 ÷ 306正确率，&lt;0.70 说明只记住了题面 · 掌握度 = 已学平均 × 覆盖率（未学按 0 计）</span></div>';

      /* 章节 */
      var chapters = E.chapters.filter(function (c) { return c.subject === sid; });
      // 每个学科首次进入时默认展开第一章，且只初始化一次，避免"点一下没反应"
      if (!mapState.initialized[sid]) {
        mapState.initialized[sid] = true;
        if (chapters[0]) mapState.open[chapters[0].id] = true;
      }
      html += chapters.map(function (c) {
        var sum = 0, weak = 0, due = 0, learned = 0, shown = 0;
        c.kps.forEach(function (kp) {
          var s = E.status(st, kp.id);
          var kst = st.mastery[kp.id];
          // 只统计已学考点；未学考点不按自评先验充数
          if (kst && kst.n) { learned++; sum += kst.m; }
          if (s === 'weak') weak++;
          if (s === 'due') due++;
        });
        var avgLearned = learned ? sum / learned : 0;                       // 已学考点平均
        var avg = sum / Math.max(1, c.kps.length);                          // 全科掌握度（未学按 0 计）
        var kps = c.kps.filter(function (kp) {
          if (mapState.filter === 'all') return true;
          var s = E.status(st, kp.id);
          if (mapState.filter === 'weak') return s === 'weak';
          if (mapState.filter === 'due') return s === 'due';
          if (mapState.filter === 'new') return s === 'new';
          return s === 'mastered';
        });
        shown = kps.length;
        var open = !mapState.closed[c.id] && (!!mapState.open[c.id] || (mapState.filter !== 'all' && shown > 0));
        mapState.renderedOpen[c.id] = open;
        if (shown === 0 && mapState.filter !== 'all') return '';
        var body = kps.map(function (kp) {
          var s = E.status(st, kp.id);
          var kst = st.mastery[kp.id];
          var has = !!(kst && kst.n);
          var m = has ? kst.m : 0;                       // 未学考点显示 0，不显示自评先验
          var tr = E.styleTransfer(st, kp.id);
          var color = s === 'mastered' ? 'var(--ok)' : s === 'due' ? 'var(--warn)' : s === 'weak' ? 'var(--danger)' : s === 'new' ? 'var(--faint)' : 'var(--primary)';
          return '<div class="kp-row">' +
            '<div class="kp-name" style="width:190px;min-width:140px">' + UI.esc(kp.name) + '</div>' +
            '<div class="kp-bar"><div class="bar sm"><i style="width:' + Math.round(m * 100) + '%;background:' + color + '"></i></div></div>' +
            '<div class="kp-val">' + (has ? Math.round(m * 100) + '%' : '—') + '</div>' +
            '<div style="width:56px;text-align:right">' +
            (tr ? '<span class="pill ' + (tr.value < 0.7 ? 'danger' : 'ok') + '" style="font-size:10px" title="非306正确率 ' + Math.round(tr.ext * 100) + '% / 306 ' + Math.round(tr.base * 100) + '%">迁移 ' + tr.value.toFixed(2) + '</span>'
              : '<span class="xs faint">—</span>') +
            '</div>' +
            '<div class="kp-state">' + UI.statusPill(s) + '</div>' +
            '<button class="btn btn-sm btn-ghost" data-drill="' + encodeURIComponent(kp.id) + '">练</button>' +
            '</div>';
        }).join('');
        // 章节内容始终渲染，关闭时用 hidden 隐藏 —— 点击展开/收起只切属性，不重建整页
        return '<div class="chapter' + (open ? ' open' : '') + '">' +
          '<div class="ch-head" data-chapter="' + encodeURIComponent(c.id) + '">' +
          UI.icon('chevron') +
          '<div class="grow"><div class="ch-name">' + UI.esc(c.name) + '</div>' +
          '<div class="ch-meta">' + c.kps.length + ' 考点 · 已学 ' + learned +
          (learned ? ' · 已学平均 ' + Math.round(avgLearned * 100) + '%' : '') +
          (weak ? ' · <span style="color:var(--danger)">薄弱 ' + weak + '</span>' : '') +
          (due ? ' · <span style="color:var(--warn)">待复习 ' + due + '</span>' : '') + '</div></div>' +
          '<div style="width:110px" title="全科掌握度 = 已学平均 × 覆盖率（未学按 0 计）"><div class="bar sm"><i style="width:' + Math.round(avg * 100) + '%;background:' + subj.color + '"></i></div></div>' +
          '<b class="mono xs" style="width:38px;text-align:right" title="全科掌握度 = 已学平均(' + Math.round(avgLearned * 100) + '%) × 覆盖率(' + learned + '/' + c.kps.length + ')">' + (learned ? Math.round(avg * 100) + '%' : '—') + '</b>' +
          '<button class="btn btn-sm btn-ghost" data-chapter-drill="' + encodeURIComponent(c.id) + '" style="margin-left:10px" title="按本章考点随机生成一组练习">' + UI.icon('play') + '练本章</button>' +
          '</div>' +
          '<div class="ch-body"' + (open ? '' : ' hidden') + '>' + body + '</div>' +
          '</div>';
      }).join('');

      if (mapState.filter !== 'all' && !html) {
        html += '<div class="card"><div class="empty"><div class="empty-ico">' + UI.icon('check') + '</div><div class="empty-t">该筛选下没有考点</div><div class="small">换个筛选条件试试</div></div></div>';
      }
      return html;
    },
    mount: function () {
      var root = document.getElementById('view');
      root.addEventListener('click', function (e) {
        var sub = e.target.closest('[data-subject]');
        if (sub) { mapState.subject = sub.getAttribute('data-subject'); App.refreshView(); return; }
        var f = e.target.closest('[data-filter]');
        if (f) { mapState.filter = f.getAttribute('data-filter'); App.refreshView(); return; }
        var cdr = e.target.closest('[data-chapter-drill]');
        if (cdr) {
          var cid = decodeURIComponent(cdr.getAttribute('data-chapter-drill'));
          var chap = E.chapterById[cid];
          if (!chap) return;
          var kpIds = chap.kps.map(function (k) { return k.id; });
          var qs = E.pickQuestions(S.get(), { kpIds: kpIds, count: 12, mixExtRatio: 0.2 });
          if (!qs.length) { App.toast('本章暂时没有题目'); return; }
          App.startSession({ mode: 'train', title: '章节专练 · ' + chap.name, subtitle: qs.length + ' 题', questions: qs, back: '#/map' });
          return;
        }
        var ch = e.target.closest('[data-chapter]');
        if (ch) {
          // 直接切换 DOM，不触发整页重渲染（图谱点击的关键流畅度）
          var chap = ch.closest('.chapter');
          var body = chap ? chap.querySelector('.ch-body') : null;
          if (!body) return;
          var willOpen = body.hasAttribute('hidden');
          if (willOpen) body.removeAttribute('hidden');
          else body.setAttribute('hidden', '');
          if (chap) chap.classList.toggle('open', willOpen);
          mapState.renderedOpen[decodeURIComponent(ch.getAttribute('data-chapter'))] = willOpen;
          var id0 = decodeURIComponent(ch.getAttribute('data-chapter'));
          if (willOpen) { mapState.closed[id0] = false; mapState.open[id0] = true; }
          else { mapState.closed[id0] = true; mapState.open[id0] = false; }
          return;
        }
        var dr = e.target.closest('[data-drill]');
        if (dr) {
          var kpId = decodeURIComponent(dr.getAttribute('data-drill'));
          drill(kpId); return;
        }
      });
    }
  });

  function drill(kpId) {
    var st = S.get();
    var qs = E.pickQuestions(st, { kpIds: [kpId], count: 6 });
    if (!qs.length) { App.toast('这个考点暂时没有题目'); return; }
    App.startSession({ mode: 'train', title: '考点专练', subtitle: E.kpLabel(kpId), questions: qs, back: '#/map' });
  }

  /* ======================= 题库 ======================= */
  var bankState = { subjects: [], types: [], styles: [], search: '', limit: 15 };

  App.register('bank', {
    meta: { title: '题库浏览', sub: '按学科 / 题型 / 题源 / 关键词检索，点击查看解析' },
    render: function () {
      var st = S.get();
      var all = window.MLBank.list();
      var list = all.filter(function (q) {
        if (bankState.subjects.length && bankState.subjects.indexOf(q.subject) < 0) return false;
        if (bankState.types.length && bankState.types.indexOf(q.type) < 0) return false;
        if (bankState.styles.length && bankState.styles.indexOf(q.style) < 0) return false;
        if (bankState.search) {
          var s = bankState.search.toLowerCase();
          if ((q.stem + q.options.join('') + q.kp + q.explain + (q.caseText || '')).toLowerCase().indexOf(s) < 0) return false;
        }
        return true;
      });
      var html = '';
      html += '<div class="card card-pad" style="margin-bottom:14px">' +
        '<div class="row wrap" style="gap:8px;margin-bottom:10px">' +
        E.subjects.map(function (s) {
          return '<div class="chip ' + (bankState.subjects.indexOf(s.id) >= 0 ? 'on' : '') + '" data-bsubj="' + s.id + '">' + s.name + ' <span class="xs">' + window.MLBank.bySubject(s.id).length + '</span></div>';
        }).join('') + '</div>' +
        '<div class="row wrap" style="gap:8px;margin-bottom:10px">' +
        Object.keys(E.STYLES).map(function (k) {
          var s = E.STYLES[k], n = window.MLBank.byStyle(k).length;
          return '<div class="chip ' + (bankState.styles.indexOf(k) >= 0 ? 'on' : '') + '" data-bstyle="' + k + '">' +
            '<span style="width:7px;height:7px;border-radius:50%;background:' + s.color + '"></span>' + s.name + ' ' + n + '</div>';
        }).join('') + '</div>' +
        '<div class="row wrap" style="gap:8px">' +
        ['A1', 'A2', 'B', 'X', 'X2'].map(function (t) {
          return '<div class="chip ' + (bankState.types.indexOf(t) >= 0 ? 'on' : '') + '" data-btype="' + t + '">' + (window.ML_TYPES[t] ? window.ML_TYPES[t].label : t) + '</div>';
        }).join('') +
        '<input class="input" id="bank-search" placeholder="搜索题干 / 考点关键词…" value="' + UI.esc(bankState.search) + '" style="flex:1;min-width:160px;max-width:280px">' +
        '<span class="grow"></span><span class="xs faint">命中 ' + list.length + ' / ' + all.length + ' 题</span></div></div>';

      if (!list.length) {
        html += '<div class="card"><div class="empty"><div class="empty-ico">' + UI.icon('layers') + '</div><div class="empty-t">没有匹配的题目</div><div class="small">清空筛选或换个关键词</div></div></div>';
        return html;
      }

      html += '<div class="card">' + list.slice(0, bankState.limit).map(function (q) {
        var stat = st.qstats[q.id];
        var acc = stat && stat.seen ? Math.round(stat.correct / stat.seen * 100) : null;
        return '<div class="list-item" data-open="' + q.id + '">' +
          '<div class="li-main"><div class="li-t" style="white-space:normal;font-weight:550;line-height:1.5">' + UI.esc(q.stem.slice(0, 80)) + (q.stem.length > 80 ? '…' : '') + '</div>' +
          '<div class="li-s">' + UI.typeTag(q.type) + UI.styleTag(q.style) + '<span>' + UI.esc(E.SUBJ[q.subject].name) + ' · ' + UI.esc(q.chapter) + '</span>' +
          '<span>' + UI.esc(q.kp) + '</span>' + (q.bgroup ? '<span class="pill" style="font-size:10px">配伍组</span>' : '') +
          (q.caseId ? '<span class="pill" style="font-size:10px">串题</span>' : '') + (q.beyond ? '<span class="pill" style="font-size:10px">拓展</span>' : '') + '</div></div>' +
          (acc === null ? '<span class="pill">未做</span>' : '<span class="pill ' + (acc >= 60 ? 'ok' : 'danger') + '">' + (stat.seen) + ' 次 · ' + acc + '%</span>') +
          '</div>';
      }).join('') + '</div>';

      if (list.length > bankState.limit) {
        html += '<div class="center" style="margin-top:12px"><button class="btn" data-more>加载更多（剩余 ' + (list.length - bankState.limit) + ' 题）</button></div>';
      }
      return html;
    },
    mount: function () {
      var root = document.getElementById('view');
      var input = document.getElementById('bank-search');
      if (input) {
        input.addEventListener('input', function () {
          bankState.search = input.value;
          bankState.limit = 15;
          App.refreshView();
          var i2 = document.getElementById('bank-search');
          if (i2) { i2.focus(); i2.setSelectionRange(i2.value.length, i2.value.length); }
        });
      }
      root.addEventListener('click', function (e) {
        var s1 = e.target.closest('[data-bsubj]');
        if (s1) { tog(bankState.subjects, s1.getAttribute('data-bsubj')); bankState.limit = 15; App.refreshView(); return; }
        var k1 = e.target.closest('[data-bstyle]');
        if (k1) { tog(bankState.styles, k1.getAttribute('data-bstyle')); bankState.limit = 15; App.refreshView(); return; }
        var t1 = e.target.closest('[data-btype]');
        if (t1) { tog(bankState.types, t1.getAttribute('data-btype')); bankState.limit = 15; App.refreshView(); return; }
        if (e.target.closest('[data-more]')) { bankState.limit += 20; App.refreshView(); return; }
        var o = e.target.closest('[data-open]');
        if (o) { openQuestion(window.MLBank.get(o.getAttribute('data-open'))); return; }
      });
    }
  });

  function openQuestion(q) {
    if (!q) return;
    var st = S.get();
    var stat = st.qstats[q.id];
    App.modal({
      title: '题目详情',
      body: UI.qHTML(q, { reveal: true, selected: q.answer, correct: true, extra: '<span class="pill">' + UI.esc(q.source) + '</span>' }) +
        (stat ? '<div class="xs faint" style="margin-top:12px">历史作答 ' + stat.seen + ' 次，正确 ' + stat.correct + ' 次</div>' : ''),
      footer: '<button class="btn" data-close>关闭</button><button class="btn btn-primary" id="do-drill">练这个考点</button>',
      onMount: function (r) {
        r.querySelector('#do-drill').addEventListener('click', function () {
          App.closeModal(); drill(q.kpId);
        });
      }
    });
  }
  App.openQuestion = openQuestion;

  function tog(arr, v) { var i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); }

  /* ======================= 错题 / 复习 ======================= */
  var reviewTab = 'due';

  App.register('review', {
    meta: { title: '错题复习', sub: '遗忘曲线复习队列 + 错题本' },
    render: function () {
      var st = S.get();
      var due = E.dueKps(st);
      var wrongQs = Object.keys(st.qstats).map(function (id) { return { q: window.MLBank.get(id), s: st.qstats[id] }; })
        .filter(function (x) { return x.q && x.s.wrong > 0; })
        .sort(function (a, b) { return (b.s.lastWrong || 0) - (a.s.lastWrong || 0); });
      var html = '';

      html += '<div class="grid g3" style="margin-bottom:16px">' +
        '<div class="card kpi"><div class="kpi-label">今日待复习</div><div class="kpi-num" style="color:var(--warn)">' + due.length + '<small>个考点</small></div><div class="kpi-foot">记忆保持率 < ' + Math.round(E.cfg(st).dueAt * 100) + '%</div></div>' +
        '<div class="card kpi"><div class="kpi-label">错题本</div><div class="kpi-num" style="color:var(--danger)">' + wrongQs.length + '<small>题</small></div><div class="kpi-foot">做错过的题目</div></div>' +
        '<div class="card kpi"><div class="kpi-label">已掌握</div><div class="kpi-num" style="color:var(--ok)">' + E.kps.filter(function (k) { return E.status(st, k.id) === 'mastered'; }).length + '<small>考点</small></div><div class="kpi-foot">保持率高且掌握度 ≥ ' + Math.round(E.cfg(st).mastered * 100) + '%</div></div>' +
        '</div>';

      html += '<div class="tabs row wrap" style="gap:8px;margin-bottom:14px">' +
        '<div class="chip ' + (reviewTab === 'due' ? 'on' : '') + '" data-tab="due">复习队列 ' + due.length + '</div>' +
        '<div class="chip ' + (reviewTab === 'wrong' ? 'on' : '') + '" data-tab="wrong">错题本 ' + wrongQs.length + '</div>' +
        '<span class="grow"></span>' +
        (due.length ? '<button class="btn btn-primary btn-sm" data-act="start-review">' + UI.icon('rotate') + ' 开始复习</button>' : '') +
        (wrongQs.length ? '<button class="btn btn-sm" data-act="redo-all">重做全部错题</button>' : '') +
        '</div>';

      if (reviewTab === 'due') {
        if (!due.length) {
          html += '<div class="card"><div class="empty"><div class="empty-ico">' + UI.icon('check') + '</div><div class="empty-t">复习队列已清空</div><div class="small">所有学过的考点保持率都还在阈值以上</div></div></div>';
        } else {
          html += '<div class="card"><div class="card-b" style="padding:6px 8px"><table class="table">' +
            '<thead><tr><th>考点</th><th class="r">掌握度</th><th class="r">保持率</th><th class="r hide-sm">上次复习</th><th class="r">操作</th></tr></thead><tbody>' +
            due.slice(0, 40).map(function (d) {
              var kp = E.kpById[d.kpId], stt = st.mastery[d.kpId];
              var days = Math.max(0, Math.round((Date.now() - (stt.last || Date.now())) / 864e5));
              return '<tr><td><b style="font-size:12.5px">' + UI.esc(kp.name) + '</b><div class="xs faint">' + UI.esc(E.SUBJ[kp.subject].name) + ' · ' + UI.esc(kp.chapter) + '</div></td>' +
                '<td class="r">' + Math.round(d.m * 100) + '%</td>' +
                '<td class="r" style="color:' + (d.r < 0.5 ? 'var(--danger)' : 'var(--warn)') + '"><b>' + Math.round(d.r * 100) + '%</b></td>' +
                '<td class="r hide-sm">' + (days === 0 ? '今天' : days + ' 天前') + '</td>' +
                '<td class="r"><button class="btn btn-sm btn-ghost" data-drill="' + encodeURIComponent(d.kpId) + '">专练</button></td></tr>';
            }).join('') + '</tbody></table></div></div>';
        }
      } else {
        if (!wrongQs.length) {
          html += '<div class="card"><div class="empty"><div class="empty-ico">' + UI.icon('flag') + '</div><div class="empty-t">错题本是空的</div><div class="small">做错的题会自动收录，并按错误次数排序</div></div></div>';
        } else {
          html += '<div class="card">' + wrongQs.map(function (x) {
            var q = x.q;
            return '<div class="list-item" data-open="' + q.id + '">' +
              '<div class="li-main"><div class="li-t" style="white-space:normal;font-weight:550;line-height:1.5">' + UI.esc(q.stem.slice(0, 70)) + (q.stem.length > 70 ? '…' : '') + '</div>' +
              '<div class="li-s">' + UI.typeTag(q.type) + UI.styleTag(q.style) + '<span>' + UI.esc(E.SUBJ[q.subject].name) + '</span><span>' + UI.esc(q.kp) + '</span></div></div>' +
              '<span class="pill danger">错 ' + x.s.wrong + ' 次</span></div>';
          }).join('') + '</div>';
        }
      }
      return html;
    },
    mount: function () {
      var root = document.getElementById('view');
      root.addEventListener('click', function (e) {
        var tb = e.target.closest('[data-tab]');
        if (tb) { reviewTab = tb.getAttribute('data-tab'); App.refreshView(); return; }
        var act = e.target.closest('[data-act]');
        if (act) {
          var st = S.get();
          if (act.getAttribute('data-act') === 'start-review') {
            var due = E.dueKps(st);
            var qs = E.pickQuestions(st, { kpIds: due.map(function (d) { return d.kpId; }), count: Math.min(20, Math.max(5, due.length)) });
            App.startSession({ mode: 'review', title: '遗忘曲线复习', subtitle: due.length + ' 个到期考点', questions: qs, back: '#/review' });
          } else if (act.getAttribute('data-act') === 'redo-all') {
            var wrong = Object.keys(st.qstats).map(function (id) { return window.MLBank.get(id); })
              .filter(function (q) { return q && st.qstats[q.id].wrong > 0; });
            if (!wrong.length) { App.toast('错题本是空的'); return; }
            App.startSession({ mode: 'review', title: '错题重做', subtitle: wrong.length + ' 题', questions: wrong, back: '#/review' });
          }
          return;
        }
        var o = e.target.closest('[data-open]');
        if (o) { openQuestion(window.MLBank.get(o.getAttribute('data-open'))); return; }
        var dr = e.target.closest('[data-drill]');
        if (dr) { drill(decodeURIComponent(dr.getAttribute('data-drill'))); return; }
      });
    }
  });
})();
