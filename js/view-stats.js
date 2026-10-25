/* 学习报告 + 设置 + 关于 + 题库导入 */
(function () {
  'use strict';
  var E = window.Engine, UI = window.UI, App = window.App, S = window.Store;
  function each(sel, fn, root) { Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn); }
  function qs(sel, root) { return (root || document).querySelector(sel); }

  /* ======================= 学习报告 ======================= */
  App.register('stats', {
    meta: { title: '学习报告', sub: '进度、正确率、迁移度与复习负荷' },
    render: function () {
      var st = S.get();
      var pred = E.predictScore(st);
      var prog = E.progressInfo(st);
      var feas = E.feasibility(st);
      var pace = E.pace(st);
      var rw = E.remainingWork(st);
      var dl = E.deadlineInfo(st);

      var totalMin = 0, totalAns = 0, totalCorr = 0;
      Object.keys(st.logs).forEach(function (k) {
        var l = st.logs[k];
        totalMin += l.minutes || 0; totalAns += l.answered || 0; totalCorr += l.correct || 0;
      });
      var acc = totalAns ? totalCorr / totalAns : 0;

      var html = '';
      html += '<div class="grid g4">' +
        '<div class="card kpi"><div class="kpi-label">预测分</div><div class="kpi-num">' + (pred.enough ? Math.round(pred.total) : '—') + '<small>/300</small></div>' +
        '<div class="kpi-foot">' + (pred.enough ? '区间 ' + pred.range[0] + '–' + pred.range[1] : '样本不足 · 已答 ' + pred.answered + ' 题') + '</div></div>' +
        '<div class="card kpi"><div class="kpi-label">累计学习</div><div class="kpi-num">' + Math.round(totalMin / 60) + '<small>小时</small></div><div class="kpi-foot">' + Object.keys(st.logs).length + ' 天有记录</div></div>' +
        '<div class="card kpi"><div class="kpi-label">累计答题</div><div class="kpi-num">' + totalAns + '<small>题</small></div><div class="kpi-foot">平均 ' + (totalAns ? (totalMin / totalAns * 60).toFixed(0) : 0) + ' 秒/题</div></div>' +
        '<div class="card kpi"><div class="kpi-label">平均正确率</div><div class="kpi-num">' + Math.round(acc * 100) + '<small>%</small></div><div class="kpi-foot">连续 ' + E.streak(st) + ' 天</div></div>' +
        '</div>';

      /* 截止进度 */
      html += '<div class="sec-title">截止进度（' + dl.date + ' ' + dl.time + '）</div>';
      html += '<div class="card"><div class="card-b">' +
        '<div class="row-between" style="margin-bottom:6px"><span class="small"><b>整体进度 ' + Math.round(prog.done * 100) + '%</b><span class="muted"> · 按时间应达 ' + Math.round(prog.expected * 100) + '%</span></span>' +
        '<span class="pill ' + feas.cls + '">可行性 ' + feas.label + '</span></div>' +
        '<div style="position:relative"><div class="progress" style="height:10px"><i style="width:' + (prog.done * 100) + '%"></i></div>' +
        '<div style="position:absolute;top:-3px;left:' + (prog.expected * 100) + '%;width:2px;height:16px;background:var(--ink)"></div></div>' +
        '<div class="row wrap" style="gap:18px;margin-top:14px;font-size:12.5px">' +
        '<span>剩余工作量 <b>' + Math.round(rw.W) + '</b> 题量当量</span>' +
        '<span>有效学习日 <b>' + feas.D + '</b> 天</span>' +
        '<span>每日需 <b>' + Math.ceil(feas.need) + '</b> 题</span>' +
        '<span>近 7 天速度 <b>' + pace.perDay + '</b> 题/天</span>' +
        '<span>预计完成 <b>' + (pace.eta ? E.dayKey(pace.eta) : '—') + '</b></span>' +
        '</div>' +
        '<div class="xs faint" style="margin-top:8px">工作量折算：未学习 4 题 / 薄弱 3 题 / 待复习 1.5 题 / 已掌握 0。</div>' +
        '</div></div>';

      /* 趋势 */
      var labels = [], mins = [], accs = [];
      for (var i = 29; i >= 0; i--) {
        var d = new Date(Date.now() - i * 864e5), k = E.dayKey(d);
        var lg = st.logs[k];
        labels.push((d.getMonth() + 1) + '/' + d.getDate());
        mins.push(lg ? (lg.minutes || 0) / 60 : 0);
        accs.push(lg && lg.answered ? lg.correct / lg.answered : 0);
      }
      html += '<div class="sec-title">最近 30 天</div><div class="grid g2">' +
        '<div class="card"><div class="card-h"><div class="card-t">学习时长（小时）</div></div><div class="card-b">' +
        UI.line(mins, labels, { height: 180, max: Math.max(1, Math.ceil(Math.max.apply(null, mins))) }) + '</div></div>' +
        '<div class="card"><div class="card-h"><div class="card-t">正确率</div></div><div class="card-b">' +
        UI.line(accs, labels, { height: 180, max: 1, color: 'var(--accent)', fmt: function (v) { return Math.round(v * 100); } }) + '</div></div>' +
        '</div>';

      /* 学科 */
      var avgCov = E.subjects.reduce(function (a, s) { return a + E.subjectStat(st, s.id).coverage; }, 0) / E.subjects.length;
      html += '<div class="sec-title">学科掌握度</div><div class="grid g2">' +
        '<div class="card"><div class="card-h"><div class="card-t">已学考点掌握度</div><div class="card-x">平均覆盖 ' + Math.round(avgCov * 100) + '% · 变式修正 ' + Math.round(pred.migrationFactor * 100) + '%</div></div>' +
        '<div class="card-b center">' + UI.radar(E.subjects.map(function (s) {
          var stt = E.subjectStat(st, s.id);
          return { label: s.name, value: stt.m, color: s.color };
        }), 300) + '<div class="xs faint" style="margin-top:4px">只统计已学考点；未开始的学科为 0%</div></div></div>' +
        '<div class="card"><div class="card-h"><div class="card-t">预测得分</div></div><div class="card-b">' +
        pred.bySubject.map(function (s) { return UI.subjectBar(s, true); }).join('') + '</div></div>' +
        '</div>';

      /* 题型 / 题源 */
      var byType = {}, byStyle = {};
      window.MLBank.list().forEach(function (q) {
        var s = st.qstats[q.id]; if (!s) return;
        byType[q.type] = byType[q.type] || { n: 0, c: 0 };
        byType[q.type].n += s.seen; byType[q.type].c += s.correct;
        byStyle[q.style] = byStyle[q.style] || { n: 0, c: 0 };
        byStyle[q.style].n += s.seen; byStyle[q.style].c += s.correct;
      });
      html += '<div class="sec-title">题型与题源表现</div><div class="grid g2">' +
        '<div class="card"><div class="card-b" style="padding:6px 8px"><table class="table"><thead><tr><th>题型</th><th class="r">作答</th><th class="r">正确率</th></tr></thead><tbody>' +
        ['A1', 'A2', 'B', 'X', 'X2'].map(function (t) {
          var g = byType[t]; if (!g) return '';
          return '<tr><td>' + UI.typeTag(t) + ' ' + (window.ML_TYPES[t] ? window.ML_TYPES[t].label : t) + '</td><td class="r">' + g.n + '</td>' +
            '<td class="r"><b>' + Math.round(g.c / g.n * 100) + '%</b></td></tr>';
        }).join('') + '</tbody></table></div></div>' +
        '<div class="card"><div class="card-b" style="padding:6px 8px"><table class="table"><thead><tr><th>题源</th><th class="r">作答</th><th class="r">正确率</th></tr></thead><tbody>' +
        Object.keys(E.STYLES).map(function (key) {
          var g = byStyle[key]; if (!g) return '';
          return '<tr><td>' + UI.styleTag(key) + ' ' + UI.esc(E.STYLES[key].name) + '</td><td class="r">' + g.n + '</td>' +
            '<td class="r"><b>' + Math.round(g.c / g.n * 100) + '%</b></td></tr>';
        }).join('') + '</tbody></table></div></div></div>';

      /* 迁移度最低的考点 */
      var mig = E.kps.map(function (kp) { return { kp: kp, t: E.styleTransfer(st, kp.id) }; })
        .filter(function (x) { return x.t; })
        .sort(function (a, b) { return a.t.value - b.t.value; }).slice(0, 8);
      html += '<div class="sec-title">风格迁移度（最低的考点）</div>';
      if (!mig.length) {
        html += '<div class="card"><div class="empty"><div class="empty-ico">' + UI.icon('refresh') + '</div><div class="empty-t">样本还不够</div><div class="small">同一考点在 306 与非 306 题源上各答 2 题以上，才会计算迁移度</div></div></div>';
      } else {
        html += '<div class="card"><div class="card-b" style="padding:6px 8px"><table class="table">' +
          '<thead><tr><th>考点</th><th class="r">306</th><th class="r">变式</th><th class="r">迁移</th><th class="r">建议</th></tr></thead><tbody>' +
          mig.map(function (x) {
            return '<tr><td>' + UI.esc(x.kp.name) + '<div class="xs faint">' + UI.esc(E.SUBJ[x.kp.subject].name) + ' · ' + UI.esc(x.kp.chapter) + '</div></td>' +
              '<td class="r">' + Math.round(x.t.base * 100) + '%</td><td class="r">' + Math.round(x.t.ext * 100) + '%</td>' +
              '<td class="r"><b style="color:' + (x.t.value < 0.7 ? 'var(--danger)' : 'var(--ok)') + '">' + x.t.value.toFixed(2) + '</b></td>' +
              '<td class="r"><button class="btn btn-sm btn-ghost" data-drill="' + encodeURIComponent(x.kp.id) + '">换风格练</button></td></tr>';
          }).join('') + '</tbody></table></div></div>';
      }

      /* 复习负荷 */
      var load = [];
      for (var dd = 0; dd < 7; dd++) {
        var ts = Date.now() + dd * 864e5, n = 0;
        E.kps.forEach(function (kp) {
          var s = st.mastery[kp.id];
          if (!s || !s.n) return;
          if (E.retention(st, kp.id, ts) < E.cfg(st).dueAt) n++;
        });
        load.push(n);
      }
      var lmax = Math.max(1, Math.max.apply(null, load));
      html += '<div class="sec-title">未来 7 天复习负荷预测</div><div class="card"><div class="card-b">' +
        '<div class="row" style="gap:8px;align-items:flex-end;height:120px">' +
        load.map(function (n, i) {
          var d2 = new Date(Date.now() + i * 864e5);
          return '<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px;height:100%">' +
            '<div class="xs mono" style="color:var(--muted)">' + n + '</div>' +
            '<div style="width:100%;max-width:42px;height:' + Math.max(3, n / lmax * 82) + '%;border-radius:6px 6px 3px 3px;background:' + (i === 0 ? 'var(--warn)' : 'color-mix(in srgb,var(--primary) ' + (45 + i * 6) + '%, var(--panel-3))') + '"></div>' +
            '<div class="xs faint">' + (i === 0 ? '今天' : (d2.getMonth() + 1) + '/' + d2.getDate()) + '</div></div>';
        }).join('') + '</div>' +
        '<div class="xs faint" style="margin-top:10px">按当前记忆稳定性推算：越往后越多考点跌破复习阈值，建议每天固定 20~30 分钟做复习块，避免累积。</div>' +
        '</div></div>';

      /* 热力图 */
      html += '<div class="sec-title">学习日历（近 12 周）</div><div class="card"><div class="card-b" style="overflow-x:auto">' +
        UI.heatmap(st.logs, 12) +
        '<div class="legend" style="margin-top:10px"><span>少</span><span><i style="background:var(--panel-3)"></i></span><span><i style="background:color-mix(in srgb,var(--primary) 30%,var(--panel-3))"></i></span><span><i style="background:color-mix(in srgb,var(--primary) 55%,var(--panel-3))"></i></span><span><i style="background:color-mix(in srgb,var(--primary) 80%,var(--panel-3))"></i></span><span><i style="background:var(--primary)"></i></span><span>多</span></div>' +
        '</div></div>';

      return html;
    },
    mount: function () {
      var root = document.getElementById('view');
      root.addEventListener('click', function (e) {
        var d = e.target.closest('[data-drill]');
        if (d) App.drill(decodeURIComponent(d.getAttribute('data-drill')));
      });
    }
  });

  /* ======================= 设置 ======================= */
  var WD = ['一', '二', '三', '四', '五', '六', '日'];

  App.register('settings', {
    meta: { title: '设置', sub: '复习截止日、学习强度、六科自评与数据管理' },
    render: function () {
      var st = S.get(), p = st.profile;
      var feas = E.feasibility(st);
      var html = '';

      /* 截止日 */
      html += '<div class="card" style="margin-bottom:14px"><div class="card-h"><div class="card-t">复习截止时间</div>' +
        '<div class="card-x"><span class="pill ' + feas.cls + '">可行性 ' + feas.label + '</span></div></div><div class="card-b">' +
        '<div class="row wrap" style="gap:16px;align-items:center">' +
        '<div><div class="xs faint">当前截止</div><div style="font-size:20px;font-weight:800" class="mono">' + p.deadline + ' <span style="font-size:13px;opacity:.6">' + (p.deadlineTime || '23:59') + '</span></div></div>' +
        '<div><div class="xs faint">剩余</div><div style="font-size:20px;font-weight:800">' + E.deadlineInfo(st).days + ' <span style="font-size:12px;opacity:.6">天</span></div></div>' +
        '<div><div class="xs faint">每日需完成</div><div style="font-size:20px;font-weight:800">' + Math.ceil(feas.need) + ' <span style="font-size:12px;opacity:.6">题</span></div></div>' +
        '<button class="btn btn-primary" data-act="deadline" style="margin-left:auto">调整截止日</button>' +
        '</div>' +
        (feas.solutions.length ? '<div class="feas-box" style="margin-top:12px"><b class="small">按当前截止日排不下，可选：</b>' +
          feas.solutions.map(function (s) { return '<div class="s"><b>' + s.k + '</b><span>' + s.v + '</span></div>'; }).join('') + '</div>' : '') +
        '</div></div>';

      /* 学习强度 */
      html += '<div class="card" style="margin-bottom:14px"><div class="card-h"><div class="card-t">学习强度</div></div><div class="card-b">';
      html += '<div class="setting-row"><div class="st-main"><div class="st-t">每日可用时长</div><div class="st-d">决定每日容量与计划块时长</div></div>' +
        '<div class="st-x"><select class="select" data-set="dailyMinutes">' +
        [60, 90, 120, 150, 180, 240, 300].map(function (m) {
          return '<option value="' + m + '" ' + (p.dailyMinutes === m ? 'selected' : '') + '>' + m + ' 分钟</option>';
        }).join('') + '</select></div></div>';

      html += '<div class="setting-row"><div class="st-main"><div class="st-t">每周学习日</div><div class="st-d">有效学习日 = 剩余天数 × 学习日占比</div></div>' +
        '<div class="st-x"><div class="row" style="gap:4px">' + WD.map(function (w, i) {
          var on = (p.weekdays || []).indexOf(i + 1) >= 0;
          return '<div class="chip ' + (on ? 'on' : '') + '" data-wd="' + (i + 1) + '" style="padding:4px 8px">' + w + '</div>';
        }).join('') + '</div></div></div>';

      html += '<div class="setting-row"><div class="st-main"><div class="st-t">达标线（掌握度）</div><div class="st-d">达到多少算「已掌握」；紧急时可降到 0.65 换取覆盖率</div></div>' +
        '<div class="st-x"><div class="row" style="gap:10px"><input type="range" min="0.55" max="0.92" step="0.01" value="' + p.masterLine + '" data-set="masterLine" style="width:120px">' +
        '<b class="mono" id="v-masterLine" style="width:38px;text-align:right">' + p.masterLine.toFixed(2) + '</b></div></div></div>';

      html += '<div class="setting-row"><div class="st-main"><div class="st-t">变式题占比</div><div class="st-d">训练中掺入多少非 306 风格的题（0 = 只用 306）</div></div>' +
        '<div class="st-x"><div class="row" style="gap:6px">' + [0, 0.1, 0.15, 0.25, 0.4].map(function (r) {
          return '<div class="chip ' + (Math.abs(p.styleMixRatio - r) < 0.001 ? 'on' : '') + '" data-mix="' + r + '">' + Math.round(r * 100) + '%</div>';
        }).join('') + '</div></div></div>';
      html += '</div></div>';

      /* 六科自评 */
      html += '<div class="card" style="margin-bottom:14px"><div class="card-h"><div class="card-t">六科基础自评</div><div class="card-x">只影响冷启动先验，随作答会被真实数据覆盖</div></div><div class="card-b">';
      E.subjects.forEach(function (s) {
        var v = (p.base && p.base[s.id] != null) ? p.base[s.id] : 45;
        html += '<div class="setting-row" style="padding:10px 0"><div class="st-main" style="display:flex;align-items:center;gap:8px">' +
          UI.subjDot(s.id) + '<b style="font-size:13px">' + s.name + '</b><span class="xs faint">占分 ' + Math.round(s.share * 100) + '%</span></div>' +
          '<div class="st-x"><div class="row" style="gap:10px"><input type="range" min="0" max="100" step="5" value="' + v + '" data-base="' + s.id + '" style="width:140px">' +
          '<b class="mono" id="v-base-' + s.id + '" style="width:34px;text-align:right">' + v + '</b></div></div></div>';
      });
      html += '</div></div>';

      /* 数据管理 */
      html += '<div class="card" style="margin-bottom:14px"><div class="card-h"><div class="card-t">数据与题库</div>' +
        '<div class="card-x">' + (S.isStorageOk() ? '本地存储正常' : '<span style="color:var(--danger)">本地存储不可用（仅内存）</span>') + '</div></div><div class="card-b">';
      html += '<div class="setting-row"><div class="st-main"><div class="st-t">导出备份</div><div class="st-d">学习记录、掌握度、错题；建议每周导一次</div></div>' +
        '<div class="st-x"><button class="btn btn-sm" data-act="export">' + UI.icon('download') + ' 导出 JSON</button></div></div>';
      html += '<div class="setting-row"><div class="st-main"><div class="st-t">导入备份</div><div class="st-d">从导出的 JSON 恢复学习记录</div></div>' +
        '<div class="st-x"><button class="btn btn-sm" data-act="import">' + UI.icon('upload') + ' 导入</button></div></div>';
      html += '<div class="setting-row"><div class="st-main"><div class="st-t">导入题库</div><div class="st-d">粘贴 JSON 题目数组，自动校验并挂载考点</div></div>' +
        '<div class="st-x"><button class="btn btn-sm btn-soft" data-act="import-bank">' + UI.icon('plus') + ' 导入题目</button></div></div>';
      html += '<div class="setting-row"><div class="st-main"><div class="st-t">清空演示数据</div><div class="st-d">保留设置，清掉示例记录，开始记录真实学习</div></div>' +
        '<div class="st-x"><button class="btn btn-sm" data-act="clear-demo">清空</button></div></div>';
      html += '<div class="setting-row"><div class="st-main"><div class="st-t" style="color:var(--danger)">重置全部</div><div class="st-d">删除所有数据（含导入的题库）</div></div>' +
        '<div class="st-x"><button class="btn btn-sm btn-danger" data-act="reset">重置</button></div></div>';
      html += '</div></div>';

      /* 题库状态 */
      var rep = window.MLBank.report();
      html += '<div class="card"><div class="card-h"><div class="card-t">题库状态</div><div class="card-x">可用 ' + rep.usable + ' 题 / 共 ' + rep.total + ' 条</div></div><div class="card-b">' +
        '<div class="row wrap" style="gap:10px;margin-bottom:10px">' + Object.keys(E.STYLES).map(function (k) {
          return '<span class="pill" style="background:' + E.STYLES[k].color + '1a;color:' + E.STYLES[k].color + '"><b>' + window.MLBank.byStyle(k).length + '</b> · ' + E.STYLES[k].name + '</span>';
        }).join('') + '</div>' +
        '<div class="row wrap" style="gap:10px;margin-bottom:10px">' +
        (rep.cases.length ? '<span class="pill">串题组 ' + rep.cases.length + ' 组</span>' : '') +
        (rep.bgroups.length ? '<span class="pill">配伍组 ' + rep.bgroups.length + ' 组</span>' : '') +
        (rep.beyond ? '<span class="pill">拓展题 ' + rep.beyond + '</span>' : '') +
        '<span class="pill">被丢弃 ' + rep.rejected.length + ' 条</span></div>' +
        (rep.rejected.length ? '<div style="max-height:180px;overflow:auto;font-size:11.5px;line-height:1.8;color:var(--muted)">' +
          rep.rejected.slice(0, 30).map(function (r) {
            return '· ' + (r.id || '(无 id)') + '：' + r.errs.join('；');
          }).join('<br>') + '</div>' : '<div class="xs faint">所有题目均通过校验。</div>') +
        '<div class="xs faint" style="margin-top:10px">校验项：字段合法性 / 考点挂载 / 答案下标 / 单选唯一性 / 选N项数量 / 串题组材料一致性 / 配伍组选项一致性。</div>' +
        '</div></div>';
      return html;
    },
    mount: function () {
      var root = document.getElementById('view');
      root.addEventListener('click', function (e) {
        var el = e.target.closest('[data-act]');
        if (el) {
          var act = el.getAttribute('data-act');
          if (act === 'deadline') { App.openDeadlineModal(); return; }
          if (act === 'export') { exportData(); return; }
          if (act === 'import') { openImportData(); return; }
          if (act === 'import-bank') { App.openImportBank(); return; }
          if (act === 'clear-demo') { App.clearDemoFlow(); return; }
          if (act === 'reset') { App.resetFlow(); return; }
          return;
        }
        var wd = e.target.closest('[data-wd]');
        if (wd) {
          var n = Number(wd.getAttribute('data-wd'));
          var p = S.get().profile;
          var i = p.weekdays.indexOf(n);
          if (i >= 0) p.weekdays.splice(i, 1); else p.weekdays.push(n);
          if (!p.weekdays.length) p.weekdays = [1, 2, 3, 4, 5, 6, 7];
          S.saveNow(); App.refreshView(); return;
        }
        var mix = e.target.closest('[data-mix]');
        if (mix) {
          S.get().profile.styleMixRatio = Number(mix.getAttribute('data-mix'));
          S.saveNow(); App.refreshView(); return;
        }
      });

      each('[data-set]', function (el) {
        var key = el.getAttribute('data-set');
        var lbl = qs('#v-' + key);
        var handler = function () {
          var v = key === 'masterLine' ? Number(el.value) : Number(el.value);
          S.get().profile[key] = v;
          if (lbl) lbl.textContent = key === 'masterLine' ? v.toFixed(2) : v;
          S.saveNow();
        };
        el.addEventListener('input', handler);
        el.addEventListener('change', function () { handler(); App.refreshChrome(); App.refreshView(); });
      });
      each('[data-base]', function (el) {
        var sid = el.getAttribute('data-base');
        var lbl = qs('#v-base-' + sid);
        el.addEventListener('input', function () {
          var v = Number(el.value);
          S.get().profile.base[sid] = v;
          if (lbl) lbl.textContent = v;
          S.save();
        });
        el.addEventListener('change', function () { S.saveNow(); });
      });
    }
  });

  function exportData() {
    var text = S.exportJson();
    try {
      var blob = new Blob([text], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '306-训练数据-' + E.dayKey(Date.now()) + '.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      App.toast('已导出备份文件');
    } catch (e) {
      App.modal({ title: '导出数据', body: '<textarea class="textarea" style="min-height:300px" readonly>' + UI.esc(text) + '</textarea>', footer: '<button class="btn" data-close>关闭</button>' });
    }
  }

  function openImportData() {
    App.modal({
      title: '导入学习数据',
      body: '<div style="display:grid;gap:10px"><div class="small muted">粘贴之前导出的 JSON，或选择文件。导入会覆盖同名字段的学习记录。</div>' +
        '<input type="file" accept=".json,application/json" id="imp-file" class="input">' +
        '<textarea class="textarea" id="imp-text" placeholder="或在此粘贴 JSON…"></textarea></div>',
      footer: '<button class="btn" data-close>取消</button><button class="btn btn-primary" id="imp-do">导入</button>',
      onMount: function (r) {
        var file = r.querySelector('#imp-file'), text = r.querySelector('#imp-text');
        file.addEventListener('change', function () {
          var f = file.files[0]; if (!f) return;
          var reader = new FileReader();
          reader.onload = function () { text.value = reader.result; };
          reader.readAsText(f);
        });
        r.querySelector('#imp-do').addEventListener('click', function () {
          try {
            S.importJson(text.value);
            App.closeModal(); App.toast('已导入学习数据'); App.refreshChrome(); App.render();
          } catch (e) { App.toast('导入失败：' + e.message); }
        });
      }
    });
  }

  /* ---------------- 导入题库 ---------------- */
  App.importBankText = function (text) {
    var data = JSON.parse(text);
    var arr = Array.isArray(data) ? data : (data && data.questions ? data.questions : (data && data.id ? [data] : null));
    if (!Array.isArray(arr)) throw new Error('需要 JSON 数组，或 {"questions": [...]}');
    var before = window.MLBank.report();
    window.ML_QUESTION_PARTS = window.ML_QUESTION_PARTS || {};
    var extra = window.ML_QUESTION_PARTS.extra = (window.ML_QUESTION_PARTS.extra || []).concat(arr);
    var rep = window.MLBank.build();
    S.saveImportedBank(extra);
    return { added: rep.usable - before.usable, rejected: rep.rejected.length - before.rejected.length, usable: rep.usable, rejectedList: rep.rejected };
  };

  App.openImportBank = function () {
    var sample = JSON.stringify([{
      id: "imp-001", subject: "internal", chapter: "循环系统疾病", kp: "心力衰竭",
      style: "cn306", type: "A1", difficulty: 0.5, stem: "题干", options: ["A 项", "B 项", "C 项", "D 项"],
      answer: [1], explain: "解析（≥60 字）", source: "自编"
    }], null, 2);
    App.modal({
      title: '导入题库',
      body: '<div style="display:grid;gap:10px">' +
        '<div class="small muted">支持 JSON 数组，字段：subject / chapter / kp / type / style / stem / options / answer / explain。' +
        'chapter 与 kp 必须与大纲逐字一致，否则该题会被丢弃。导入的题会保存在浏览器本地。</div>' +
        '<div class="row wrap" style="gap:8px"><span class="xs faint">placeholders：</span>' +
        Object.keys(E.STYLES).map(function (k) { return '<span class="pill" style="background:' + E.STYLES[k].color + '1a;color:' + E.STYLES[k].color + '">' + k + '</span>'; }).join('') + '</div>' +
        '<input type="file" accept=".json" id="bank-file" class="input">' +
        '<textarea class="textarea" id="bank-text" placeholder="在此粘贴题目 JSON…" style="min-height:180px">' + UI.esc(sample) + '</textarea>' +
        '<div id="bank-result" class="small"></div></div>',
      footer: '<button class="btn" data-close>取消</button><button class="btn btn-primary" id="bank-do">校验并导入</button>',
      onMount: function (r) {
        var file = r.querySelector('#bank-file'), text = r.querySelector('#bank-text'), out = r.querySelector('#bank-result');
        file.addEventListener('change', function () {
          var f = file.files[0]; if (!f) return;
          var reader = new FileReader();
          reader.onload = function () { text.value = reader.result; };
          reader.readAsText(f);
        });
        r.querySelector('#bank-do').addEventListener('click', function () {
          try {
            var res = App.importBankText(text.value);
            out.innerHTML = '<div class="pill ' + (res.added ? 'ok' : 'danger') + '">入库 ' + res.added + ' 题，丢弃 ' + res.rejected + ' 条</div>' +
              (res.rejected ? '<div class="xs faint" style="margin-top:6px">原因见「设置 → 题库状态」</div>' : '');
            App.toast('导入完成：新增 ' + res.added + ' 题');
            App.refreshChrome();
            setTimeout(function () { App.closeModal(); App.render(); }, 900);
          } catch (e) { out.innerHTML = '<div class="pill danger">' + UI.esc(e.message) + '</div>'; }
        });
      }
    });
  };

  /* ======================= 关于框架 ======================= */
  App.register('about', {
    meta: { title: '关于框架', sub: '这套系统怎么运行、数据长什么样、后续怎么扩展' },
    render: function () {
      var rep = window.MLBank.report();
      var totalKp = E.kps.length, totalCh = E.chapters.length;
      var html = '';
      html += '<div class="card" style="margin-bottom:14px"><div class="card-b">' +
        '<div class="row" style="gap:12px;align-items:center"><div class="brand-mark" style="width:44px;height:44px;border-radius:13px">306</div>' +
        '<div><div style="font-size:16px;font-weight:800">306 西综训练台 · MedLoop</div>' +
        '<div class="xs faint">个性化训练框架 v0.2 · 复习截止日驱动 · 四题源变式</div></div></div>' +
        '<div class="small muted" style="margin-top:12px;line-height:1.9">把 306 的 ' + totalKp + ' 个考点做成一张会衰减的掌握度地图：按你设定的复习截止日倒推每日任务，' +
        '用 306 / 执业医师 / USMLE / 日本医师四种风格反复验证同一考点是否真懂。纯静态页面，数据只存在你本机。</div>' +
        '</div></div>';

      html += '<div class="sec-title">模块架构</div><div class="card"><div class="card-b"><pre class="mono" style="font-size:11.5px;line-height:1.75;margin:0;overflow:auto;color:var(--ink-2)">' +
        'view-*.js   今日 训练 模考 图谱 题库 复习 报告 设置 关于\n' +
        '   │  只渲染 + 绑事件，不写算法\n' +
        'ui.js       外壳 / 路由 / 图表 / 题目渲染（串题·选N项·否定提问）/ 答题状态机\n' +
        '   │\n' +
        'engine.js   掌握度 · 记忆保持率 · 截止日倒推 · 可行性 · 组卷 · 预测分 · 风格迁移度\n' +
        '   │\n' +
        'store.js    状态与 localStorage        │  bank.js  题库装配 + 校验\n' +
        '   │\n' +
        'data.js     ' + totalCh + ' 章 / ' + totalKp + ' 考点 / 试卷结构   │  data/q-*.js  题库分片</pre></div></div>';

      html += '<div class="sec-title">核心算法</div><div class="card"><div class="card-b"><pre class="mono" style="font-size:11.5px;line-height:1.9;margin:0;overflow:auto;color:var(--ink-2)">' +
        '掌握度   答对 m += 0.22(1−m)(0.7+0.6d)   答错 m −= 0.30m(0.5+0.8(1−d))\n' +
        '记忆     R = exp(−Δt/S)   答对 S ×= 1.7+0.35d   答错 S ×= 0.5\n' +
        '复习     R < 0.78 进复习队列 → 决定"今天复习什么"\n' +
        '计划     剩余工作量 W ÷ 有效学习日 D = 每日目标 w̄；可行性 F = 容量 c ÷ w̄\n' +
        '组卷     优先级 = 0.45(1−m)+0.35(1−R)+0.15错率+0.05久未练，难度匹配 p≈0.65\n' +
        '预测     学科分 = 满分×(0.16+0.84×估算)，估算 = 覆盖×已学掌握度 + (1−覆盖)×自评先验\n' +
        '         已学考点<20 且 已答题<40 → 样本不足，界面显示"—"与区间，不冒充精确分\n' +
        '迁移度   非306正确率 ÷ 306正确率   <0.70 → 可能只记住了题面</pre></div></div>';

      html += '<div class="sec-title">四类题源</div><div class="card"><div class="card-b" style="padding:6px 8px"><table class="table">' +
        '<thead><tr><th>题源</th><th class="r">题量</th><th>角色</th><th class="hide-sm">结构特征</th></tr></thead><tbody>' +
        Object.keys(E.STYLES).map(function (k) {
          return '<tr><td>' + UI.styleTag(k) + ' ' + UI.esc(E.STYLES[k].name) + '</td>' +
            '<td class="r"><b>' + window.MLBank.byStyle(k).length + '</b></td>' +
            '<td class="xs">' + (k === 'cn306' ? '主线：计划、模考、算分' : '同考点变式：抗题面记忆') + '</td>' +
            '<td class="hide-sm xs faint">' + UI.esc(E.STYLES[k].desc) + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';

      html += '<div class="sec-title">题目数据契约</div><div class="card"><div class="card-b"><pre class="mono" style="font-size:11px;line-height:1.8;margin:0;overflow:auto;color:var(--ink-2)">' +
        '{\n' +
        '  "id": "int-001", "subject": "internal",\n' +
        '  "chapter": "循环系统疾病", "kp": "心力衰竭",   // 必须与大纲逐字一致\n' +
        '  "style": "cn306|cn_practice|usmle|jp",\n' +
        '  "type": "A1|A2|B|X|X2", "ask": "normal|negative",\n' +
        '  "chooseN": 1, "caseId": "CASE-01", "caseOrder": 1, "caseText": "共用病例材料",\n' +
        '  "beyond": false, "difficulty": 0.5,\n' +
        '  "stem": "…", "options": ["…"], "answer": [1],\n' +
        '  "explain": "≥60 字，逐项说明错因", "tip": "记忆点", "source": "自编·人卫P264"\n' +
        '}</pre></div></div>';

      html += '<div class="sec-title">分期进度</div><div class="card"><div class="card-b">' +
        [['P0', '骨架可看', '已完成', 'ok'], ['P1', '四模块打通 + 截止日驱动', '已完成', 'ok'],
        ['P2', '模考与报告', '已可用（待题库铺满后开全真卷）', 'primary'],
        ['P3', '306 题库铺满 410 题', '待审核入库', 'warn'],
        ['P4', '拓展题 120 题 + 迁移度', '样例题已跑通（当前 ' + (rep.usable - window.MLBank.byStyle('cn306').length) + ' 道变式）', 'warn']].map(function (r) {
          return '<div class="setting-row" style="padding:10px 0"><div class="st-main"><div class="st-t">' + r[0] + ' · ' + r[1] + '</div></div>' +
            '<span class="pill ' + r[3] + '">' + r[2] + '</span></div>';
        }).join('') +
        '<div class="xs faint" style="margin-top:10px">题库现状：可用 ' + rep.usable + ' 题（306 主线 ' + window.MLBank.byStyle('cn306').length + ' · 执业 ' + window.MLBank.byStyle('cn_practice').length +
        ' · USMLE ' + window.MLBank.byStyle('usmle').length + ' · 日医 ' + window.MLBank.byStyle('jp').length + '）。</div>' +
        '</div></div>';
      return html;
    }
  });

  /* ---------------- 通用流程 ---------------- */
  App.clearDemoFlow = function () {
    App.modal({
      title: '清空演示数据？',
      body: '<div style="font-size:13.5px;line-height:1.8">删除示例学习记录、错题与掌握度，保留你的设置（截止日、每日时长、六科自评）。</div>',
      footer: '<button class="btn" data-close>取消</button><button class="btn btn-primary" id="cd-do">确认清空</button>',
      onMount: function (r) {
        qs('#cd-do', r).addEventListener('click', function () {
          S.clearDemo(); App.closeModal(); App.toast('已清空演示数据'); App.refreshChrome(); App.render();
        });
      }
    });
  };

  App.resetFlow = function () {
    App.modal({
      title: '重置全部数据？',
      body: '<div style="font-size:13.5px;line-height:1.8;color:var(--danger)">这会删除所有学习记录、掌握度、错题与已导入的题库，且不可恢复。<br><b>建议先导出备份。</b></div>',
      footer: '<button class="btn" data-close>取消</button><button class="btn btn-danger" id="rs-do">我确认重置</button>',
      onMount: function (r) {
        qs('#rs-do', r).addEventListener('click', function () {
          S.clearImportedBank();
          S.reset();
          window.MLBank.build();
          App.closeModal(); App.toast('已重置'); App.refreshChrome(); App.render();
        });
      }
    });
  };
})();
