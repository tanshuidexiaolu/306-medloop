(function(){
  var paper = document.getElementById('paper');
  if (!paper) return JSON.stringify({ error: 'no #paper' });
  var out = [], section = '';
  var kids = Array.prototype.slice.call(paper.children);
  for (var i = 0; i < kids.length; i++) {
    var el = kids[i];
    if (el.tagName === 'H1') { var t = (el.innerText || '').trim(); if (/型题/.test(t)) section = t; continue; }
    if (!el.classList || !el.classList.contains('qcontent')) continue;
    var p = el.querySelector('p') || el;
    var ps = Array.prototype.slice.call(el.querySelectorAll('p'));
    if (!ps.length) ps = [p];
    var stemParts = [], options = [];
    ps.forEach(function (node) {
      var t = (node.innerText || '').replace(/\s+/g, ' ').trim();
      if (!t) return;
      var mm = t.match(/^([A-Ea-e])\s*[\.、．:：]\s*(.*)$/);
      if (mm && options.length < 5) options.push({ key: mm[1].toUpperCase(), text: (mm[2] || '').trim() });
      else if (!options.length) stemParts.push(t);
      else options[options.length - 1].text = (options[options.length - 1].text + ' ' + t).trim();
    });
    var stem = stemParts.join(' ').replace(/^\s*\d+\s*[\.、]\s*/, '');

    // 结构 A：选项在 <ol><li><span class="acontent">
    var olOpts = [];
    var sib0 = el.nextElementSibling, g0 = 0;
    while (sib0 && g0++ < 10) {
      if (sib0.tagName === 'OL') {
        Array.prototype.forEach.call(sib0.querySelectorAll('li'), function (li) {
          var a = li.querySelector('.acontent') || li;
          olOpts.push({ key: String.fromCharCode(65 + olOpts.length), text: (a.innerText || '').replace(/\s+/g, ' ').trim() });
        });
      }
      if (sib0.classList && sib0.classList.contains('answer_div')) break;
      sib0 = sib0.nextElementSibling;
    }
    if (olOpts.length >= 2 && options.length < 2) options = olOpts;

    // 结构 B：选项挤在同一段，带标点
    if (!options.length) {
      var text = ps.map(function (n) { return (n.innerText || ''); }).join('\n').replace(/\r/g, '');
      text = text.replace(/^\s*\d+\s*[\.、]\s*/, '');
      var idxs = [], re = /([A-Ea-e])\s*[\.、．:：]\s*/g, m;
      while ((m = re.exec(text))) {
        var before = m.index === 0 ? ' ' : text.charAt(m.index - 1);
        if (!/\s/.test(before)) continue;
        idxs.push({ key: m[1].toUpperCase(), start: m.index, end: re.lastIndex });
      }
      if (idxs.length >= 2) {
        stem = text.slice(0, idxs[0].start).trim();
        for (var k = 0; k < idxs.length; k++) {
          var end = k + 1 < idxs.length ? idxs[k + 1].start : text.length;
          options.push({ key: idxs[k].key, text: text.slice(idxs[k].end, end).replace(/\s+/g, ' ').trim() });
        }
      }
    }

    // 结构 C：选项挤在一起、标点后无空格（A、甲B、乙）
    if (options.length < 4) {
      var s3 = ps.map(function (n) { return (n.innerText || ''); }).join('\n').replace(/\r/g, '');
      s3 = s3.replace(/^\s*\d+\s*[\.、]\s*/, '');
      var seq = [], expect = 0, letters = 'ABCDE';
      var re4 = /([A-E])\s*[\.、．:：]\s*/g, m4;
      while ((m4 = re4.exec(s3))) {
        if (m4[1] === letters.charAt(expect)) { seq.push({ key: m4[1], start: m4.index, end: re4.lastIndex }); expect++; }
      }
      if (seq.length > options.length) {
        stem = s3.slice(0, seq[0].start).trim();
        options = seq.map(function (x, i) {
          var e3 = i + 1 < seq.length ? seq[i + 1].start : s3.length;
          return { key: x.key, text: s3.slice(x.end, e3).replace(/\s+/g, ' ').trim() };
        });
      }
    }

    // 结构 D：字母+空格分隔（A 甲 B 乙），无标点
    if (options.length < 4) {
      var s4 = ps.map(function (n) { return (n.innerText || ''); }).join(' ').replace(/\s+/g, ' ');
      s4 = s4.replace(/^\s*\d+\s*[\.、]\s*/, '');
      var marks = [], re5 = /\s([A-E])\s+/g, m5;
      while ((m5 = re5.exec(s4))) marks.push({ key: m5[1], start: m5.index + 1, end: re5.lastIndex });
      if (marks.length >= 3 && marks.length > options.length) {
        stem = s4.slice(0, marks[0].start).trim();
        options = marks.map(function (x, i) {
          var e4 = i + 1 < marks.length ? marks[i + 1].start : s4.length;
          return { key: x.key, text: s4.slice(x.end, e4).replace(/\s+/g, ' ').trim() };
        });
      }
    }

    var qid = '', answer = '';
    var sib = el.nextElementSibling, guard = 0;
    while (sib && guard++ < 12) {
      if (!qid && sib.tagName === 'BUTTON' && /_colBtn$/.test(sib.id || '')) qid = sib.id.replace(/_colBtn$/, '');
      if (sib.classList && sib.classList.contains('answer_div')) {
        var ai = sib.querySelector('.ansIndex');
        if (ai) answer = (ai.innerText || '').trim();
        break;
      }
      sib = sib.nextElementSibling;
    }
    out.push({ qid: qid, section: section, stem: stem, options: options, answer: answer });
  }
  return JSON.stringify({ count: out.length, questions: out });
})()
