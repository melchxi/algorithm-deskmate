/* =========================================================
   ALGORITHM DESKMATE — shared behaviour
   No libraries. No trackers. No external requests.
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function toast(message) {
    const stack = $("#toast-stack");
    if (!stack) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    stack.appendChild(el);
    window.setTimeout(() => {
      el.classList.add("is-out");
      window.setTimeout(() => el.remove(), 280);
    }, 2200);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;left:-9999px;top:0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      toast("已复制到剪贴板");
      return true;
    } catch (err) {
      toast("复制失败，请手动选择文本");
      return false;
    }
  }
  window.ADM = { $, $$, toast, copyText, escapeHTML, reduced };

  /* ---------------- Theme ---------------- */
  function setTheme(theme, persist = true) {
    root.setAttribute("data-theme", theme);
    if (persist) {
      try { localStorage.setItem("adm-theme", theme); } catch (e) {}
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "paper" ? "#f2eee4" : "#070a0f");
    $$("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-label", theme === "dark" || theme === "lab" ? "切换到浅色主题" : "切换到深色主题");
    });
    window.dispatchEvent(new CustomEvent("adm:theme", { detail: { theme } }));
  }

  function initTheme() {
    let stored = null;
    let queryTheme = null;
    try {
      stored = localStorage.getItem("adm-theme");
      queryTheme = new URLSearchParams(window.location.search).get("theme");
    } catch (e) {}
    const initial = (queryTheme === "paper" || queryTheme === "lab")
      ? queryTheme
      : (stored === "paper" ? "paper" : "lab");
    setTheme(initial, false);
    $$("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setTheme(root.getAttribute("data-theme") === "paper" ? "lab" : "paper");
      });
    });
  }

  /* ---------------- Header / menu ---------------- */
  function initMenu() {
    const menuBtn = $("[data-menu-toggle]");
    const nav = $("#site-nav");
    if (!menuBtn || !nav) return;

    function closeMenu() {
      document.body.classList.remove("menu-open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "打开菜单");
    }

    menuBtn.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });

    $$(".nav-toggle", nav).forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const group = btn.closest(".nav-group");
        const open = group.classList.contains("is-open");
        $$(".nav-group", nav).forEach((item) => {
          item.classList.remove("is-open");
          const t = $(".nav-toggle", item);
          if (t) t.setAttribute("aria-expanded", "false");
        });
        if (!open) {
          group.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".nav-group")) {
        $$(".nav-group", nav).forEach((item) => {
          item.classList.remove("is-open");
          const t = $(".nav-toggle", item);
          if (t) t.setAttribute("aria-expanded", "false");
        });
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        $$(".nav-group", nav).forEach((item) => item.classList.remove("is-open"));
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 920) closeMenu();
    });
  }

  /* ---------------- Search ---------------- */
  function initSearch() {
    const overlay = $("#search-overlay");
    const input = $("#search-input");
    const results = $("#search-results");
    if (!overlay || !input || !results) return;
    const data = Array.isArray(window.SITE_INDEX) ? window.SITE_INDEX : [];
    let current = -1;
    let lastFocus = null;

    const open = () => {
      lastFocus = document.activeElement;
      overlay.classList.add("is-open");
      document.body.classList.add("overlay-open");
      input.value = "";
      render("");
      window.setTimeout(() => input.focus(), 30);
    };

    const close = () => {
      overlay.classList.remove("is-open");
      document.body.classList.remove("overlay-open");
      current = -1;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    const homeTarget = document.body.dataset.home || "home.html";
    const contentPrefix = document.body.dataset.contentPrefix || "";
    const resultHref = (item) => item.url === "home.html"
      ? homeTarget
      : contentPrefix + item.url;

    const render = (query) => {
      const q = query.trim().toLowerCase();
      let items = data;
      if (q) {
        items = data.filter((item) => {
          const hay = [item.title, item.label, item.group, item.desc, item.keywords].join(" ").toLowerCase();
          return hay.includes(q);
        });
      } else {
        items = data.slice(0, 9);
      }
      current = q && items.length ? 0 : -1;
      if (!items.length) {
        results.innerHTML = '<div class="search-empty">没有找到相关页面。<br>试试“AI”“依赖”“幻觉”“社区”或“公约”。</div>';
        return;
      }
      results.innerHTML = items.map((item, i) => (
        `<a class="search-result${i === current ? " is-current" : ""}" href="${escapeHTML(resultHref(item))}" role="option" aria-selected="${i === current}">` +
        `<span class="search-result__num">${escapeHTML(item.num)}</span>` +
        `<span><span class="search-result__title">${escapeHTML(item.title)}</span><span class="search-result__desc">${escapeHTML(item.desc)}</span></span>` +
        `<span class="search-result__group">${escapeHTML(item.group)}</span>` +
        `</a>`
      )).join("");
      $$(".search-result", results).forEach((el, index) => {
        el.addEventListener("mouseenter", () => setCurrent(index));
      });
    };

    const setCurrent = (index) => {
      const items = $$(".search-result", results);
      if (!items.length) return;
      current = (index + items.length) % items.length;
      items.forEach((el, i) => {
        el.classList.toggle("is-current", i === current);
        el.setAttribute("aria-selected", String(i === current));
      });
      items[current].scrollIntoView({ block: "nearest" });
    };

    const openers = $$("[data-search-open]");
    openers.forEach((btn) => btn.addEventListener("click", open));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    $$(".search-foot").forEach((el) => el.addEventListener("click", close));

    input.addEventListener("input", () => render(input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setCurrent(current + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setCurrent(current - 1);
      } else if (event.key === "Enter") {
        const items = $$(".search-result", results);
        if (items[current]) window.location.href = items[current].getAttribute("href");
      }
    });

    document.addEventListener("keydown", (event) => {
      const tag = (event.target.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select" || event.target.isContentEditable;
      if ((event.key === "/" || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) && !typing) {
        event.preventDefault();
        if (overlay.classList.contains("is-open")) close();
        else open();
      } else if (event.key === "Escape" && overlay.classList.contains("is-open")) {
        close();
      }
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -4% 0px" });
    items.forEach((el) => observer.observe(el));
    // Above-the-fold elements should not wait for scroll.
    window.setTimeout(() => {
      items.slice(0, 4).forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add("is-in");
      });
    }, 120);
  }

  /* ---------------- Reading progress ---------------- */
  function initProgress() {
    const bar = $("#read-progress");
    if (!bar) return;
    let ticking = false;
    let scrollable = 0;
    // Read the document height only when the document actually changes size,
    // never inside the scroll frame itself.
    const measure = () => {
      scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    };
    const update = () => {
      const value = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      bar.style.width = (value * 100).toFixed(2) + "%";
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    if ("ResizeObserver" in window) {
      new ResizeObserver(measure).observe(document.body);
    }
    measure();
    update();
  }

  /* ---------------- Hero signal field ---------------- */
  function initSignalCanvas() {
    const canvas = $("#signal-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 0, height = 0, dpr = 1, nodes = [], raf = 0, visible = true;
    let colorA = "#62e3d5", colorB = "#c9ff4d";

    const readColors = () => {
      const cs = getComputedStyle(root);
      const a = cs.getPropertyValue("--cyan").trim();
      const b = cs.getPropertyValue("--signal").trim();
      if (a) colorA = a;
      if (b) colorB = b;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(18, Math.min(58, Math.round((width * height) / 21000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.6 + 0.6,
        tone: Math.random() > 0.82 ? "b" : "a",
        phase: Math.random() * Math.PI * 2
      }));
    };

    const draw = (time = 0) => {
      ctx.clearRect(0, 0, width, height);
      // connections
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 13924) {
            const dist = Math.sqrt(d2);
            const alpha = (1 - dist / 118) * 0.16;
            ctx.strokeStyle = `rgba(145, 180, 171, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // dots
      nodes.forEach((n, i) => {
        const drift = reduced ? 0 : 0.45 + Math.sin(time / 1400 + n.phase) * 0.35;
        n.x += n.vx * drift;
        n.y += n.vy * drift;
        if (n.x < -10) n.x = width + 10;
        if (n.x > width + 10) n.x = -10;
        if (n.y < -10) n.y = height + 10;
        if (n.y > height + 10) n.y = -10;
        const color = n.tone === "b" ? colorB : colorA;
        ctx.globalAlpha = i % 9 === 0 ? 0.72 : 0.42;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, i % 11 === 0 ? n.r + 1.2 : n.r, 0, Math.PI * 2);
        ctx.fill();
        if (i % 11 === 0) {
          ctx.globalAlpha = 0.12;
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 7, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });
      if (!reduced && visible) raf = window.requestAnimationFrame(draw);
    };

    resize();
    readColors();
    draw();
    const onResize = () => { window.cancelAnimationFrame(raf); resize(); draw(); };
    let timer;
    window.addEventListener("resize", () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(onResize, 160);
    });
    window.addEventListener("adm:theme", () => { readColors(); if (reduced) draw(); });
    document.addEventListener("visibilitychange", () => {
      if (reduced) return;
      if (document.hidden) window.cancelAnimationFrame(raf);
      else { window.cancelAnimationFrame(raf); draw(); }
    });
    // Stop the animation loop entirely while the hero is scrolled out of view.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const next = entry.isIntersecting;
          if (next === visible) return;
          visible = next;
          if (visible && !reduced) {
            window.cancelAnimationFrame(raf);
            draw(performance.now());
          }
        });
      }, { threshold: 0 }).observe(canvas);
    }
  }

  /* ---------------- Hero typewriter & counters ---------------- */
  function initHero() {
    const typedEl = $("#hero-typed");
    if (typedEl) {
      const full = typedEl.textContent || "";
      if (!reduced) {
        typedEl.textContent = "";
        let i = 0;
        window.setTimeout(() => {
          const timer = window.setInterval(() => {
            typedEl.textContent = full.slice(0, i++);
            if (i > full.length) window.clearInterval(timer);
          }, 38);
        }, 900);
      }
    }
    $$("[data-count]").forEach((el) => {
      const target = Number(el.getAttribute("data-count"));
      if (!Number.isFinite(target)) return;
      if (reduced) return;
      let start = null;
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1200;
      // Build the <small> once and only rewrite the number afterwards.
      const small = document.createElement("small");
      small.textContent = suffix;
      const number = document.createTextNode(String(el.textContent || "").replace(suffix, ""));
      el.textContent = "";
      el.appendChild(number);
      el.appendChild(small);
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min(1, (ts - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        number.nodeValue = String(Math.round(target * eased));
        if (p < 1) window.requestAnimationFrame(step);
      };
      window.setTimeout(() => window.requestAnimationFrame(step), 650);
    });
  }

  /* ---------------- Clock ---------------- */
  function initClock() {
    const els = $$("[data-local-time]");
    if (!els.length) return;
    // One formatter for the page instead of building one on every tick.
    const formatter = new Intl.DateTimeFormat("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tick = () => {
      const value = formatter.format(new Date());
      els.forEach((el) => { el.textContent = value; });
    };
    tick();
    window.setInterval(tick, 1000);
  }

  /* ---------------- Copy buttons ---------------- */
  function initCopy() {
    document.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-copy-target]");
      if (!btn) return;
      const id = btn.getAttribute("data-copy-target");
      const target = document.getElementById(id);
      if (!target) return;
      const text = ("value" in target && !target.textContent.trim()) ? target.value : (target.textContent || "");
      copyText(text.trim()).then((ok) => {
        if (!ok) return;
        const original = btn.textContent;
        btn.textContent = "已复制 ✓";
        btn.classList.add("is-copied");
        window.setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove("is-copied");
        }, 1800);
      });
    });
    document.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-copy-text]");
      if (!btn) return;
      copyText(btn.getAttribute("data-copy-text") || "");
    });
  }

  /* ---------------- Reveal buttons ---------------- */
  function initReveals() {
    document.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-reveal-target]");
      if (!btn) return;
      const target = document.getElementById(btn.getAttribute("data-reveal-target"));
      if (!target) return;
      const open = target.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      btn.innerHTML = open ? '收起 <span class="arrow">−</span>' : '拆开展示 <span class="arrow">＋</span>';
    });
  }

  /* ---------------- Filters (voices) ---------------- */
  function initFilters() {
    $$("[data-filter-group]").forEach((group) => {
      const buttons = $$("[data-filter]", group);
      const scope = group.getAttribute("data-filter-group");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          buttons.forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          const filter = btn.getAttribute("data-filter");
          const cards = $$("[data-category]");
          let visible = 0;
          cards.forEach((card) => {
            const show = filter === "all" || card.getAttribute("data-category") === filter;
            card.hidden = !show;
            if (show) visible += 1;
          });
          const empty = document.querySelector(`[data-filter-empty="${scope}"]`);
          if (empty) empty.hidden = visible !== 0;
        });
      });
    });
  }

  /* ---------------- Roundtable tabs ---------------- */
  function initRoundtable() {
    const tablist = $(".roundtable-tabs");
    if (!tablist) return;
    const buttons = $$("[data-tab]", tablist);
    const panels = $$(".roundtable-panel");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        const id = btn.getAttribute("aria-controls");
        panels.forEach((panel) => {
          const active = panel.id === id;
          panel.classList.toggle("is-active", active);
          panel.hidden = !active;
        });
      });
    });
  }

  /* ---------------- Homepage claim ---------------- */
  function initHomeClaim() {
    const btn = document.querySelector("[data-reveal-target='home-claim-reveal']");
    if (!btn) return;
    btn.setAttribute("aria-expanded", "false");
  }

  function initEntryWipe() {
    if (!root.classList.contains("is-wiping")) return;
    window.setTimeout(() => {
      root.classList.remove("is-wiping");
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("wipe");
        history.replaceState(null, "", url.pathname + url.search + url.hash);
      } catch (e) {}
    }, 1200);
  }

  /* ---------------- Init ---------------- */
  function boot() {
    initTheme();
    initMenu();
    initSearch();
    initReveal();
    initProgress();
    initSignalCanvas();
    initHero();
    initClock();
    initCopy();
    initReveals();
    initFilters();
    initRoundtable();
    initHomeClaim();
    initEntryWipe();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
