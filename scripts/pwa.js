/* PWA — service-worker registration + custom "install app" button.
   Standalone classic script; loaded after bundle.js in index.html. */
(function () {
  'use strict';

  /* ---- Service worker ---- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('[pwa] service worker registration failed:', err);
      });
    });
  }

  /* ---- Custom install button (beforeinstallprompt) ---- */
  var btn = document.getElementById('install-btn');
  if (!btn) return;

  var deferredPrompt = null;

  function show() {
    btn.classList.remove('hidden');
    btn.classList.add('flex');
  }
  function hide() {
    btn.classList.add('hidden');
    btn.classList.remove('flex');
    deferredPrompt = null;
  }

  // Chromium fires this when the app is installable — stash it, reveal the button.
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    show();
  });

  btn.addEventListener('click', function () {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(hide);
  });

  // Already installed (or just installed) — no need for the button.
  window.addEventListener('appinstalled', hide);
})();
