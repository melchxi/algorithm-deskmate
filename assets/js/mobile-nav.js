/* =========================================================
   MOBILE READING AIDS — 目录 + 板块末尾的“下一个”
   Runs only on narrow screens; on desktop it exits immediately
   and never touches the DOM.
   ========================================================= */
(function () {
  "use strict";

  if (!window.matchMedia("(max-width: 900px)").matches) return;
  if (document.body.hasAttribute("data-no-toc")) return;

  var HEADER_OFFSET = 72;
  var main = document.querySelector("main");
  if (!main) return;

  /* ---------------- helpers ---------------- */
  function txt(el) {
    return el ? (el.textContent || "").replace(/\s+/g, " ").trim() : "";
  }
  function clean(s) {
    s = (s || "").replace(/\s+/g, " ").trim();
    s = s.replace(/^[↓→§·•\-—–\s]+/, "").replace(/[↓→§·•\-—–\s]+$/, "");
    return s;
  }
  function clip(s, n) {
    s = clean(s);
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }
  function esc(s) {
    return String(s).replace(/[<>&"]/g, function (c) {
      return { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c];
    });
  }
  function isChrome(el) {
    var cls = " " + (el.className || "") + " ";
    return / (toolbar|filter-row|note-strip|page-navigation|proposal-tools|row|social-row|share-row|file-tag|prompt-tabs|prompt-toolbar|tool-tabs|roundtable-tabs|persona-switch) /.test(cls);
  }

  function classLabel(el) {
    var cls = " " + (el.className || "") + " ";
    var map = [
      [/ prose /, "正文"],
      [/ article-aside /, "延伸阅读"],
      [/ table-wrap /, "数据表"],
      [/ stat-grid /, "关键数据"],
      [/ compare-grid /, "对照"],
      [/ ledger /, "记录表"],
      [/ resource-section /, "资料清单"],
      [/ voice-grid /, "访谈"],
      [/ voice-feature /, "访谈节选"],
      [/ exhibit-grid /, "标本"],
      [/ museum-legend /, "图例"],
      [/ action-band /, "行动"],
      [/ future-signals /, "推演信号"],
      [/ consensus-grid /, "共识"],
      [/ charter-list /, "公约条目"],
      [/ quiz-head /, "开始"],
      [/ game-shell /, "测试"],
      [/ signature-row /, "签署"],
      [/ open-banner /, "开放档案"],
    ];
    for (var i = 0; i < map.length; i++) if (map[i][0].test(cls)) return map[i][1];
    return "";
  }

  /* ---------------- titles ---------------- */
  function headingText(el, sectionTitleText) {
    var cands = [
      "h2", "h3", "h4",
      ".eyebrow", ".panel-head b", ".panel-head span", ".article-label",
      ".hero__en", ".stat__label", ".mono", ".lead-in",
    ];
    var best = "";
    for (var i = 0; i < cands.length; i++) {
      var nodes = el.querySelectorAll(cands[i]);
      for (var j = 0; j < nodes.length; j++) {
        var t = clean(txt(nodes[j]));
        if (t.length < 2) continue;
        if (!best) best = t;
        if (sectionTitleText && t === sectionTitleText) continue;  // avoid repeating the block title
        return clip(t, 36);
      }
    }
    return best ? clip(best, 36) : "";
  }

  function sectionTitle(sec, idx) {
    var direct = [
      ".section-head h2", ".section-head h3", ":scope > .container > .section-head h2",
      "h2", "h1", ".section-head .eyebrow",
      ":scope > .container > .eyebrow", ":scope > .container > .mono",
    ];
    for (var i = 0; i < direct.length; i++) {
      var n = sec.querySelector(direct[i]);
      var t = clean(txt(n));
      if (t.length >= 2) return clip(t, 30);
    }
    return "";
  }

  var pageH1 = clean(txt(document.querySelector(".page-head h1, main h1, h1")));

  /* ---------------- outline ---------------- */
  var sections = [];
  [].slice.call(main.querySelectorAll("section")).forEach(function (sec) {
    if (sec.classList.contains("page-head")) return;
    var cont = sec.querySelector(":scope > .container") || (sec.classList.contains("container") ? sec : null);
    if (!cont) return;

    var rawBlocks = [].slice.call(cont.children).filter(function (el) {
      if (el.classList.contains("section-head") || el.classList.contains("m-next-wrap")) return false;
      return el.getBoundingClientRect().height > 8;
    });
    // the opening hero is one block (its grid columns must never be split)
    if (sec.classList.contains("hero")) {
      sections.push({ el: sec, title: sectionTitle(sec, sections.length + 1), blocks: [{ el: cont, tail: cont, sub: [], hero: true }] });
      return;
    }

    // fold decorative / UI strips into the preceding real block
    var blocks = [];
    rawBlocks.forEach(function (el) {
      var h = el.getBoundingClientRect().height;
      var hasHeading = !!el.querySelector("h2, h3");
      var tiny = h < 150 && !hasHeading;
      var chrome = isChrome(el) && !hasHeading && h < 260;
      if ((tiny || chrome) && blocks.length) {
        blocks[blocks.length - 1].tail = el;
        return;
      }
      if ((tiny || chrome) && !blocks.length) return;
      blocks.push({ el: el, tail: el, subs: [] });
    });
    if (!blocks.length) return;

    sections.push({ el: sec, title: sectionTitle(sec, sections.length + 1), blocks: blocks });
  });

  if (!sections.length) return;

  /* ---------------- long-body splitting (interviews, proposals…) ---------------- */
  function splitLongBlock(block) {
    var el = block.el;
    var cs = getComputedStyle(el);
    if (cs.display !== "block") return [];
    if (el.getBoundingClientRect().height < 1500) return [];
    var heads = [].slice.call(el.querySelectorAll("h2, h3")).filter(function (h) {
      return clean(txt(h)).length >= 2 && !h.closest(".m-next-wrap");
    });
    if (heads.length < 3) return [];
    var out = [];
    for (var i = 0; i < heads.length; i++) {
      var next = heads[i + 1] || null;
      var title = clip(txt(heads[i]), 32);
      if (i === 0) {
        title = block.virtualTitle || block.title || title;
        out.push({ el: el, head: heads[0], label: title, before: null });
      } else {
        out.push({ el: el, head: heads[i], label: title, before: heads[i] });
      }
    }
    return out;
  }

  /* ---------------- ids + titles ---------------- */
  var uid = 0;
  sections.forEach(function (s, si) {
    if (!s.el.id) s.el.id = "m-sec-" + ++uid;
    s.flat = [];
    s.blocks.forEach(function (b, i) {
      // blocks that carry no real heading (long prose, tables, card grids) use a class-based label
      var hasOwnHeading = !!b.el.querySelector("h2, h3, h4");
      b.title = (hasOwnHeading ? headingText(b.el, s.title) : (classLabel(b.el) || headingText(b.el, s.title))) || "";
      if (!b.el.id) b.el.id = "m-blk-" + ++uid;
      var subs = splitLongBlock(b);
      if (subs.length) {
        subs.forEach(function (sb, k) {
          sb.title = sb.label || b.title;
          sb.tail = subs[k + 1] ? subs[k + 1].before : b.tail;   // button sits right before the next slice
          sb.anchor = sb.before || b.el;
          if (!sb.anchor.id) sb.anchor.id = "m-blk-" + ++uid;
        });
        b.subs = subs;
        b.flat = subs;
      } else {
        b.flat = [{ el: b.el, tail: b.tail, title: b.title, before: null, hero: !!b.hero }];
      }
      s.flat = s.flat.concat(b.flat);
    });
    // fall back to the first block's title; single-section pages use the page headline
    if (!s.title) {
      s.title = sections.length === 1
        ? (pageH1 || (s.flat[0] && s.flat[0].title) || "本页")
        : ((s.flat[0] && s.flat[0].title) || pageH1 || "第 " + (si + 1) + " 板块");
    }
    // fill empty / duplicated block titles
    var used = Object.create(null);
    s.flat.forEach(function (b, i) {
      if (!b.title) b.title = "第 " + (i + 1) + " 段";
      used[b.title] = (used[b.title] || 0) + 1;
      if (used[b.title] > 1) b.title = b.title + " · " + used[b.title];
    });
  });

  var flatAll = [];
  sections.forEach(function (s) { s.flat.forEach(function (b) { flatAll.push({ sec: s, block: b }); }); });

  /* ---------------- chapter chain ---------------- */
  var chapters = [];
  [].slice.call(document.querySelectorAll("#site-nav .nav-pop a")).forEach(function (a) {
    var href = a.getAttribute("href");
    if (!chapters.some(function (c) { return c.href === href; })) chapters.push({ href: href, label: clip(txt(a), 24) });
  });
  var here = decodeURIComponent((location.pathname.split("/").pop() || ""));
  var hereIdx = chapters.findIndex(function (c) {
    return decodeURIComponent((c.href || "").split("/").pop()) === here;
  });
  var nextChapter = hereIdx >= 0 ? chapters[hereIdx + 1] : null;
  var homeHref = document.body.getAttribute("data-home") || "主站(无开屏动画).html";

  /* ---------------- jump + buttons ---------------- */
  function jumpTo(el) {
    var y = el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }

  function wrapButton(block, btn) {
    var w = document.createElement("div");
    w.className = "m-next-wrap";
    w.appendChild(btn);

    // hero: sit right below the (overflowing) hero grid, aligned to the page container
    if (block.hero) {
      w.classList.add("container");
      var sec = block.el.parentElement;
      if (sec && sec.parentElement) sec.parentElement.insertBefore(w, sec.nextSibling);
      return w;
    }

    var host = block.before ? block.before.parentElement : block.el.parentElement;
    if (!host) return w;
    // a container wider than the screen (e.g. a hero grid) would clip the button
    if (host.getBoundingClientRect().width > window.innerWidth - 8 && host.parentElement) {
      host.parentElement.insertBefore(w, host.nextSibling);
      return w;
    }
    var cs = getComputedStyle(host);
    if (cs.display.indexOf("grid") >= 0) w.style.gridColumn = "1 / -1";
    if (cs.display.indexOf("flex") >= 0) w.style.flex = "1 0 100%";
    if (block.before) host.insertBefore(w, block.before);
    else host.insertBefore(w, block.el.nextSibling);
    return w;
  }

  function makeButton(kind, label, title, action) {
    var b = document.createElement(kind === "chapter" ? "a" : "button");
    b.className = "m-next" + (kind === "chapter" ? " m-next--chapter" : "");
    if (kind === "chapter") b.href = action;
    else b.type = "button";
    b.innerHTML =
      '<span class="m-next__text"><span class="m-next__label">' + esc(label) + "</span>" +
      '<span class="m-next__title">' + esc(title) + "</span></span>" +
      '<span class="m-next__arrow">→</span>';
    if (kind !== "chapter") b.addEventListener("click", function () { action(); });
    return b;
  }

  for (var gi = 0; gi < flatAll.length; gi++) {
    var cur = flatAll[gi];
    var nxt = flatAll[gi + 1];
    if (nxt && nxt.sec === cur.sec) {
      wrapButton(cur.block, makeButton("next", "下一个 / NEXT", nxt.block.title, (function (t) { return function () { jumpTo(t); }; })(nxt.block.el)));
    } else if (nxt) {
      var secLabel = nxt.sec.title;
      var subLabel = nxt.block.title || "";
      var nextTitle = subLabel && subLabel.indexOf(secLabel) !== 0 ? secLabel + " · " + subLabel : secLabel;
      wrapButton(cur.block, makeButton("section", "下一板块 / NEXT BLOCK", nextTitle, (function (t) { return function () { jumpTo(t); }; })(nxt.sec.el)));
    } else if (nextChapter) {
      wrapButton(cur.block, makeButton("chapter", "下一章 / NEXT CHAPTER", nextChapter.label, nextChapter.href));
    } else if (hereIdx < 0 && chapters.length) {
      // this page is outside the chapter chain (home, 404…) → start from chapter one
      wrapButton(cur.block, makeButton("chapter", "从头开始 / START", chapters[0].label, chapters[0].href));
    } else {
      wrapButton(cur.block, makeButton("chapter", "回到首页 / BACK TO START", "返回首页", homeHref));
    }
  }

  /* ---------------- table of contents ---------------- */
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "m-toc-btn";
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "m-toc");
  btn.innerHTML = '<i aria-hidden="true"></i>目录';

  var backdrop = document.createElement("div");
  backdrop.className = "m-toc-backdrop";

  var panel = document.createElement("div");
  panel.className = "m-toc";
  panel.id = "m-toc";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "本页目录");

  var pageTitle = clean(txt(document.querySelector(".page-head h1, h1"))) || document.title;

  var head = document.createElement("div");
  head.className = "m-toc__head";
  head.innerHTML = "<b>" + esc(clip(pageTitle, 26)) + "</b><span>CONTENTS / " + sections.length + " 板块</span>";
  var closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "m-toc__close";
  closeBtn.setAttribute("aria-label", "关闭目录");
  closeBtn.textContent = "✕";
  closeBtn.addEventListener("click", function () { close(); });
  head.appendChild(closeBtn);

  var body = document.createElement("div");
  body.className = "m-toc__body";

  sections.forEach(function (sec, si) {
    var group = document.createElement("div");
    group.className = "m-toc__group";

    var gt = document.createElement("button");
    gt.type = "button";
    gt.className = "m-toc__group-title";
    gt.dataset.target = sec.el.id;
    gt.innerHTML = "<em>" + String(si + 1).padStart(2, "0") + "</em>" + esc(sec.title);
    gt.addEventListener("click", function () { jumpTo(sec.el); close(); });
    group.appendChild(gt);

    var ul = document.createElement("ul");
    ul.className = "m-toc__list";
    sec.flat.forEach(function (b, i) {
      var li = document.createElement("li");
      var it = document.createElement("button");
      it.type = "button";
      it.className = "m-toc__item";
      it.dataset.target = (b.before || b.el).id || "";
      it.innerHTML = "<b>" + (i + 1) + "</b><span>" + esc(b.title) + "</span>";
      it.addEventListener("click", function () { jumpTo(b.before || b.el); close(); });
      li.appendChild(it);
      ul.appendChild(li);
    });
    group.appendChild(ul);
    body.appendChild(group);
  });

  var foot = document.createElement("div");
  foot.className = "m-toc__foot";
  if (hereIdx > 0) {
    var prev = document.createElement("a");
    prev.href = chapters[hereIdx - 1].href;
    prev.textContent = "← " + chapters[hereIdx - 1].label;
    foot.appendChild(prev);
  } else {
    var sp = document.createElement("span");
    sp.textContent = "已是第一章";
    foot.appendChild(sp);
  }
  if (nextChapter) {
    var nx = document.createElement("a");
    nx.href = nextChapter.href;
    nx.textContent = nextChapter.label + " →";
    foot.appendChild(nx);
  } else {
    var sn = document.createElement("span");
    sn.textContent = "已是最末章";
    foot.appendChild(sn);
  }

  panel.appendChild(head);
  panel.appendChild(body);
  panel.appendChild(foot);
  document.body.appendChild(btn);
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  var lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    panel.classList.add("is-open");
    backdrop.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    document.body.classList.add("m-toc-open");
  }
  function close() {
    panel.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("m-toc-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  btn.addEventListener("click", function () {
    if (panel.classList.contains("is-open")) close(); else open();
  });
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("is-open")) close();
  });

  /* ---------------- scroll spy ---------------- */
  var items = [].slice.call(panel.querySelectorAll(".m-toc__item"));
  function markActive(id) {
    items.forEach(function (it) { it.classList.toggle("is-active", it.dataset.target === id); });
  }
  var spyTargets = [];
  sections.forEach(function (s) {
    s.flat.forEach(function (b) {
      var el = b.before || b.el;
      if (el && el.id) spyTargets.push({ id: el.id, el: el });
    });
  });
  var spyTick = false;
  function updateSpy() {
    spyTick = false;
    var y = window.pageYOffset + 120;
    var current = null;
    for (var i = 0; i < spyTargets.length; i++) {
      var t = spyTargets[i];
      var top = t.el.getBoundingClientRect().top + window.pageYOffset;
      if (top <= y) current = t.id;
      else break;
    }
    if (!current && spyTargets.length) current = spyTargets[0].id;
    markActive(current);
  }
  window.addEventListener("scroll", function () {
    if (!spyTick) { spyTick = true; window.requestAnimationFrame(updateSpy); }
  }, { passive: true });
  window.addEventListener("resize", updateSpy, { passive: true });
  updateSpy();

  var footer = document.querySelector(".site-footer");
  if (footer && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { btn.classList.toggle("is-hidden", e.isIntersecting); });
    }, { threshold: 0.05 }).observe(footer);
  }
})();
