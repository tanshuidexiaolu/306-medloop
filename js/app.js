/* 306 西综训练台 · 启动脚本 */
(function () {
  'use strict';

  function boot() {
    var St = window.Store, App = window.App;

    // 0) 主题：URL 参数优先，其次本地保存；在首帧之前就定好，避免闪烁与过渡
    var tm = location.search.match(/[?&]theme=(dark|light)/);
    var theme = tm ? tm[1] : St.getTheme();
    document.documentElement.setAttribute('data-theme', theme);

    // 1) 状态
    var st = St.load();

    // 2) 注入用户导入的题库（存在 localStorage，重启后仍在）
    var imported = St.loadImportedBank();
    if (imported && imported.length) {
      window.ML_QUESTION_PARTS = window.ML_QUESTION_PARTS || {};
      window.ML_QUESTION_PARTS.extra = (window.ML_QUESTION_PARTS.extra || []).concat(imported);
      window.MLBank.build();
    }

    // 3) 外壳 + 路由
    App.mountShell();
    if (!location.hash) location.hash = '#/today';
    window.addEventListener('hashchange', function () { App.render(); });
    App.render();

    if (!St.isStorageOk()) {
      App.toast('浏览器禁用了本地存储：本次学习数据不会被保存，建议用 Chrome/Edge 打开', 5000);
    }

    // 4) 首次引导（每个浏览器只出现一次）
    maybeOnboard();

    // 截图/演示用：?quizdemo 直接开一组练习
    if (/[?&]quizdemo/.test(location.search)) {
      var qs = window.Engine.pickQuestions(St.get(), { count: 5, mixExtRatio: 0.4 });
      App.startSession({ mode: 'train', title: '跨章综合 + 变式', subtitle: qs.length + ' 题', questions: qs, back: '#/today' });
    }
  }

  function maybeOnboard() {
    if (/[?&]skiponboard/.test(location.search)) return;   // 截图/演示用
    var key = 'ml306.onboarded.v1';
    try { if (localStorage.getItem(key)) return; } catch (e) { return; }
    try { localStorage.setItem(key, '1'); } catch (e) {}

    var st = window.Store.get();
    window.App.modal({
      title: '先花 30 秒，让系统认识你',
      body: '<div style="display:grid;gap:14px">' +
        '<div class="small muted" style="line-height:1.9">这个工具不靠"刷题量"驱动，而是靠三件事：<b>你的截止日</b>、<b>每个考点的掌握度</b>、<b>记忆衰减</b>。' +
        '现在展示的是演示数据，可以随便点。</div>' +
        '<div class="feas-box">' +
        '<div class="feas-row"><span class="k">① 定截止</span><span class="v">设置「复习截止日」，系统按剩余工作量倒推每天该练多少</span></div>' +
        '<div class="feas-row"><span class="k">② 做诊断</span><span class="v">24 题诊断卷，初始化六科掌握度画像</span></div>' +
        '<div class="feas-row"><span class="k">③ 每天练</span><span class="v">打开今日页，按计划块完成，陈旧考点自动回流复习</span></div>' +
        '<div class="feas-row"><span class="k">④ 验真懂</span><span class="v">同一考点穿插 USMLE / 日医 / 执业变式，测出"只背题面"</span></div>' +
        '</div>' +
        '<div class="xs faint">当前截止日：' + (st.profile.deadline || '—') + ' · 每日 ' + (st.profile.dailyMinutes || 150) + ' 分钟。随时可在「设置」修改。</div>' +
        '</div>',
      footer: '<button class="btn" data-close>先看看演示</button><button class="btn btn-primary" id="ob-go">去设置截止日</button>',
      onMount: function (r) {
        r.querySelector('#ob-go').addEventListener('click', function () {
          window.App.closeModal();
          window.App.go('#/settings');
        });
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
