/* Puneeth — portfolio behaviour.
   Vanilla, no dependencies. Every enhancement degrades safely:
   with JS disabled the page is fully readable and navigable.
   Scroll work is batched through one rAF-throttled listener. */
(function () {
  'use strict';

  var root    = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO   = 'IntersectionObserver' in window;

  root.classList.add('js');

  /* ---------- Theme (applied before paint: no flash) ---------- */
  var THEME_KEY = 'theme';
  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) { /* storage blocked — fall back to OS preference */ }

  function currentTheme() {
    return root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }

  function syncThemeColorMeta(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0A0A0B' : '#FAFAF9');
  }
  syncThemeColorMeta(currentTheme());

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Theme toggle ---------- */
    var toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        syncThemeColorMeta(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      });
    }

    /* ---------- Mobile menu ---------- */
    var burger = document.getElementById('navBurger');
    var links  = document.getElementById('navLinks');

    function closeMenu() {
      if (!links) return;
      links.classList.remove('is-open');
      if (burger) burger.setAttribute('aria-expanded', 'false');
    }

    if (burger && links) {
      burger.addEventListener('click', function () {
        var open = links.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.addEventListener('click', function (e) {
        if (e.target.closest('a')) closeMenu();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });
    }

    /* ---------- Skill depth dots ----------
       Built from data-level so the markup stays clean and the
       dot count can never drift out of sync with the label. */
    var DOTS = 5;
    Array.prototype.forEach.call(document.querySelectorAll('.dep-dots'), function (host) {
      var level = Math.max(0, Math.min(DOTS, parseInt(host.getAttribute('data-level'), 10) || 0));
      var frag = document.createDocumentFragment();
      for (var i = 0; i < DOTS; i++) {
        var dot = document.createElement('i');
        dot.className = i < level ? 'on' : 'off';
        dot.style.setProperty('--j', i);
        frag.appendChild(dot);
      }
      host.appendChild(frag);
    });

    /* ---------- Elements driven by scroll position ---------- */
    var bar      = document.getElementById('progressBar');
    var nav      = document.getElementById('nav');
    var timeline = document.getElementById('timeline');
    var tlFill   = document.getElementById('tlFill');
    var path     = document.getElementById('path');
    var pathFill = document.getElementById('pathFill');

    // Fraction of `el` that has been scrolled past, 0 → 1.
    function railProgress(el) {
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight;
      var start = vh * 0.85;
      var total = r.height + start - vh * 0.25;
      if (total <= 0) return 1;
      return Math.max(0, Math.min(1, (start - r.top) / total));
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        // Progress bar
        if (bar) {
          var h = document.documentElement.scrollHeight - window.innerHeight;
          var p = h > 0 ? window.scrollY / h : 0;
          bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')';
        }

        // Nav background
        if (nav) nav.classList.toggle('is-stuck', window.scrollY > 8);

        // Rails draw as their section passes through the viewport
        if (timeline && tlFill) tlFill.style.transform = 'scaleY(' + railProgress(timeline) + ')';
        if (path && pathFill)   pathFill.style.transform = 'scaleY(' + railProgress(path) + ')';

        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    /* ---------- Active section indicator ---------- */
    var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
    var sections = navAnchors
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    if (sections.length && hasIO) {
      var onScreen = new Set();

      var navObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) onScreen.add(entry.target.id);
          else onScreen.delete(entry.target.id);
        });
        if (!onScreen.size) return;

        // Topmost visible section wins, so the highlight tracks
        // whatever is actually being read.
        var top = sections
          .filter(function (s) { return onScreen.has(s.id); })
          .sort(function (a, b) {
            return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
          })[0];
        if (!top) return;

        navAnchors.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + top.id);
        });
      }, { rootMargin: '-18% 0px -62% 0px', threshold: 0 });

      sections.forEach(function (s) { navObserver.observe(s); });
    }

    /* ---------- Staggered scroll reveal ---------- */
    if (!reduced && hasIO) {
      var groups = document.querySelectorAll(
        '.section-head, .hero-copy, .hero-viz, .about-copy, .pillars, .stats, ' +
        '.tl-item, .feature, .legend, .depth, .skill-group, .card, ' +
        '.building, .path, .learn-side, .contact-grid, .approach-h'
      );

      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -5% 0px' });

      Array.prototype.forEach.call(groups, function (el) {
        el.classList.add('reveal');
        revealObserver.observe(el);
      });

      // Stagger siblings within each row of cards.
      ['.work-grid', '.approach-grid', '.skill-map'].forEach(function (sel) {
        Array.prototype.forEach.call(document.querySelectorAll(sel), function (row) {
          Array.prototype.forEach.call(row.children, function (child, i) {
            child.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
          });
        });
      });

      // Safety net: never leave content hidden if an observer misfires.
      window.addEventListener('load', function () {
        setTimeout(function () {
          Array.prototype.forEach.call(groups, function (el) { el.classList.add('is-in'); });
        }, 1800);
      });
    } else {
      // Reduced motion / no IO: mark the animated groups as settled
      // so their child animations resolve to their final state.
      Array.prototype.forEach.call(
        document.querySelectorAll('.pillars, .depth'),
        function (el) { el.classList.add('is-in'); }
      );
    }

    /* ---------- Experience counter ---------- */
    var counters = document.querySelectorAll('.count');
    if (counters.length && hasIO && !reduced) {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          countObserver.unobserve(el);

          var target = parseFloat(el.getAttribute('data-count'));
          var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
          if (isNaN(target)) return;

          var duration = 1200, start = null;
          function tick(now) {
            if (start === null) start = now;
            var p = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
            el.textContent = (target * eased).toFixed(decimals);
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target.toFixed(decimals);
          }
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.5 });

      Array.prototype.forEach.call(counters, function (el) { countObserver.observe(el); });
    }
  });
})();
