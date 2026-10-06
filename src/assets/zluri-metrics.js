// Demo-mode toggle and Zluri overview iframe for the Zluri page inside the ITRG dashboard.
(function () {
  'use strict';

  // v1-dashboard swaps in its small-screen notice below 1200px, so the overview
  // iframe renders at least this wide and is scaled down to fit narrower layouts.
  var EMBED_MIN_WIDTH = 1280;
  var EMBED_HEIGHT = 720;

  // app.zluri.dev only lets the Vercel deploy frame it, so local builds frame a local v1-dashboard.
  var EMBED_SRC = location.hostname === 'localhost'
    ? 'http://localhost:4040/mock-itrg-overview?partner=Zluri'
    : 'https://app.zluri.dev/mock-itrg-overview?partner=Zluri';

  function fitEmbed(box) {
    if (!box.clientWidth) return;
    var frame = box.querySelector('iframe');
    var scale = Math.min(1, box.clientWidth / EMBED_MIN_WIDTH);
    var spaceBelow = window.innerHeight - (box.getBoundingClientRect().top + window.scrollY);
    var height = Math.max(EMBED_HEIGHT, spaceBelow / scale);
    frame.style.width = scale < 1 ? EMBED_MIN_WIDTH + 'px' : '100%';
    frame.style.height = height + 'px';
    frame.style.transform = scale < 1 ? 'scale(' + scale + ')' : 'none';
    box.style.height = Math.floor(height * scale) + 'px';
  }

  function setMode(mode) {
    document.querySelectorAll('[data-panel]').forEach(function (panel) {
      panel.hidden = panel.dataset.panel !== mode;
    });
    document.querySelectorAll('.proto-toggle button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode));
    });
    var cta = document.getElementById('hero-cta');
    if (cta) {
      var firstDay = mode === 'first-day';
      cta.href = firstDay ? 'zluri-onboarding.html' : 'zluri-overview.html';
      cta.querySelector('[data-cta-label]').textContent = firstDay ? 'Access Zluri' : 'Open Zluri';
    }
    try {
      localStorage.setItem('itrg-zluri-mode', mode);
    } catch (e) {
      /* private window — the toggle still works, it just won't be remembered */
    }
    var embed = document.querySelector('.proto-embed');
    if (mode === 'regular' && embed) {
      var frame = embed.querySelector('iframe');
      if (!frame.getAttribute('src')) frame.setAttribute('src', EMBED_SRC);
      fitEmbed(embed);
    }
  }

  function init() {
    var toggle = document.querySelector('.proto-toggle');
    if (!toggle) return;
    var embed = document.querySelector('.proto-embed');
    if (embed && 'ResizeObserver' in window) {
      new ResizeObserver(function () { fitEmbed(embed); }).observe(embed);
      window.addEventListener('resize', function () { fitEmbed(embed); });
    }
    toggle.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-mode]');
      if (btn) setMode(btn.dataset.mode);
    });
    var saved;
    try {
      saved = localStorage.getItem('itrg-zluri-mode');
    } catch (e) {
      saved = null;
    }
    setMode(saved === 'first-day' ? 'first-day' : 'regular');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
