/* Puneeth - portfolio behaviour.
   Vanilla, no dependencies. Every enhancement degrades safely:
   with JS disabled the page is fully readable and navigable.
   Loaded dynamically by partials.js after nav/footer are injected,
   so it must not assume DOMContentLoaded hasn't already fired. */
(function () {
  'use strict';

  var root    = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO   = 'IntersectionObserver' in window;

  root.classList.add('js');

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {

    /* ---------- Theme toggle (attribute is set pre-paint by an inline
       head script on every page; this just wires the button). ---------- */
    var THEME_KEY = 'theme';
    function currentTheme() {
      return root.getAttribute('data-theme') ||
        (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    }
    function syncThemeColorMeta(theme) {
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', theme === 'dark' ? '#000000' : '#FFFFFF');
    }
    syncThemeColorMeta(currentTheme());

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

    /* ---------- Active nav item: which page is this? ---------- */
    var currentPage = document.body.getAttribute('data-page');
    if (links && currentPage) {
      Array.prototype.forEach.call(links.querySelectorAll('a[data-page]'), function (a) {
        if (a.getAttribute('data-page') === currentPage) a.classList.add('is-active');
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
        if (bar) {
          var h = document.documentElement.scrollHeight - window.innerHeight;
          var p = h > 0 ? window.scrollY / h : 0;
          bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')';
        }
        if (nav) nav.classList.toggle('is-stuck', window.scrollY > 8);
        if (timeline && tlFill) tlFill.style.transform = 'scaleY(' + railProgress(timeline) + ')';
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    /* ---------- Staggered scroll reveal ---------- */
    if (!reduced && hasIO) {
      var groups = document.querySelectorAll(
        '.page-hero, .section-head, .hero-copy, .hero-diagram, .about-copy, .pillars, .metrics, ' +
        '.tl-item, .feature, .legend, .depth, .skill-group, .card, ' +
        '.building, .contact-grid, .principle, .growth'
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

      ['.grid-2', '.grid-3', '.grid-4', '.bento-wide', '.skill-map', '.principles'].forEach(function (sel) {
        Array.prototype.forEach.call(document.querySelectorAll(sel), function (row) {
          Array.prototype.forEach.call(row.children, function (child, i) {
            child.style.transitionDelay = Math.min(i, 5) * 60 + 'ms';
          });
        });
      });

      // Safety net: reveal everything shortly after load even if an
      // observer never fires. script.js loads dynamically (after the
      // nav/footer partials are injected), so the window 'load' event
      // may have already happened by the time this listener registers
      // - guard against that the same way ready() does above.
      function armRevealFallback() {
        setTimeout(function () {
          Array.prototype.forEach.call(groups, function (el) { el.classList.add('is-in'); });
        }, 1600);
      }
      if (document.readyState === 'complete') armRevealFallback();
      else window.addEventListener('load', armRevealFallback);
    } else {
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

          var duration = 1100, start = null;
          function tick(now) {
            if (start === null) start = now;
            var p = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
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
