/* Puneeth - portfolio: shared nav/footer loader.
   Runs before script.js so nav/footer exist in the DOM first.
   `data-base` on <body> is "" for root pages, "../" for one level
   deep (projects/*, case-studies/*) - every relative link/src found
   inside an injected partial gets that prefix rewritten in. */
(function () {
  'use strict';

  var base = document.body.getAttribute('data-base') || '';

  function fixRelative(container) {
    if (!base) return;
    var els = container.querySelectorAll('a[href], img[src]');
    Array.prototype.forEach.call(els, function (el) {
      var attr = el.hasAttribute('href') ? 'href' : 'src';
      var val = el.getAttribute(attr);
      if (!val || /^(https?:|mailto:|tel:|#|\/\/)/.test(val)) return;
      el.setAttribute(attr, base + val);
    });
  }

  function inject(url, slotId, done) {
    fetch(base + url)
      .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
      .then(function (html) {
        var slot = document.getElementById(slotId);
        if (slot) {
          slot.innerHTML = html;
          fixRelative(slot);
        }
        done();
      })
      .catch(function () { done(); });
  }

  var pending = 2;
  function next() {
    pending -= 1;
    if (pending > 0) return;
    // Nav/footer are in the DOM now - safe to bring in the behaviour script.
    var s = document.createElement('script');
    s.src = base + 'script.js';
    document.body.appendChild(s);
  }

  inject('partials/nav.html', 'navSlot', next);
  inject('partials/footer.html', 'footerSlot', next);
})();
