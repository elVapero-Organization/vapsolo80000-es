/* Age gate (18+): asked once per browser; "no" sends the visitor to Google */
(function () {
  'use strict';
  var KEY = 'vapsolo80k-age-ok';
  var root = document.documentElement;

  function confirmed() {
    try { if (window.localStorage.getItem(KEY) === '1') { return true; } } catch (e) { /* storage blocked */ }
    try { if (window.sessionStorage.getItem(KEY) === '1') { return true; } } catch (e) { /* storage blocked */ }
    return false;
  }
  function remember() {
    var saved = false;
    try { window.localStorage.setItem(KEY, '1'); saved = true; } catch (e) { saved = false; }
    if (!saved) {
      try { window.sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
    }
  }

  if (confirmed()) { return; }
  root.classList.add('age-pending');

  function start() {
    var gate = document.querySelector('[data-agegate]');
    if (!gate) { root.classList.remove('age-pending'); return; }
    var yes = gate.querySelector('[data-age-yes]');
    var no = gate.querySelector('[data-age-no]');
    var others = [];
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el !== gate && el.tagName !== 'SCRIPT') { others.push(el); el.setAttribute('inert', ''); }
    });
    function release() {
      others.forEach(function (el) { el.removeAttribute('inert'); });
      root.classList.remove('age-pending');
      var main = document.getElementById('main');
      if (main) { main.setAttribute('tabindex', '-1'); try { main.focus({ preventScroll: true }); } catch (e) { main.focus(); } }
    }
    if (yes) {
      yes.addEventListener('click', function () { remember(); release(); });
      setTimeout(function () { yes.focus(); }, 60);
    }
    if (no) {
      no.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.replace(no.getAttribute('href') || 'https://www.google.com/');
      });
    }
    gate.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); return; }
      if (e.key === 'Tab' && yes && no) {
        var a = document.activeElement;
        if (e.shiftKey && a === yes) { e.preventDefault(); no.focus(); }
        else if (!e.shiftKey && a === no) { e.preventDefault(); yes.focus(); }
        else if (a !== yes && a !== no) { e.preventDefault(); yes.focus(); }
      }
    });
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); }
  else { start(); }
})();
