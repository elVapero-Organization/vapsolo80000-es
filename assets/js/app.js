/* VapSolo Quads 80K · progressive enhancement only (content works without JS) */
(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  root.classList.add('js');

  var isWeb = location.protocol === 'http:' || location.protocol === 'https:';
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduce = false; }

  function all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function one(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function tail(s, t) { return s.length >= t.length && s.slice(s.length - t.length) === t; }
  function norm(s) {
    var d = String(s).toLowerCase();
    try { d = d.normalize('NFD'); } catch (e) { /* old engines */ }
    var out = '';
    for (var i = 0; i < d.length; i++) {
      var c = d.charCodeAt(i);
      if (c < 768 || c > 879) { out += d.charAt(i); }
    }
    return out.trim();
  }

  /* ---------- clean URLs on the web host, index.html kept on file:// ---------- */
  if (isWeb) {
    all('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (!h || h.indexOf('http') === 0 || h.indexOf('mailto:') === 0 || h.charAt(0) === '#' || h.charAt(0) === '/') { return; }
      var hash = '';
      var p = h.indexOf('#');
      if (p > -1) { hash = h.slice(p); h = h.slice(0, p); }
      if (tail(h, 'index.html')) {
        h = h.slice(0, h.length - 'index.html'.length);
        if (h === '') { h = './'; }
        a.setAttribute('href', h + hash);
      }
    });
    try {
      var path = location.pathname;
      if (tail(path, 'index.html')) {
        history.replaceState(null, '', path.slice(0, path.length - 'index.html'.length) + location.search + location.hash);
      }
    } catch (e) { /* ignore */ }
    try {
      if (!one('link[rel="manifest"]')) {
        var base = 'site.webmanifest';
        var depth = 0;
        var meta = one('link[rel="icon"]');
        if (meta) {
          var ih = meta.getAttribute('href') || '';
          while (ih.indexOf('../') === 0) { depth++; ih = ih.slice(3); }
        }
        var lm = doc.createElement('link');
        lm.rel = 'manifest';
        var pre = '';
        for (var k = 0; k < depth; k++) { pre += '../'; }
        lm.href = pre + base;
        doc.head.appendChild(lm);
      }
    } catch (e) { /* ignore */ }
  }

  /* ---------- mobile menu ---------- */
  var drawer = one('[data-drawer]');
  var scrim = one('[data-scrim]');
  var burger = one('[data-open]');
  var lastFocus = null;
  function focusables() {
    return all('a[href], button:not([disabled])', drawer).filter(function (el) { return el.offsetParent !== null || el === doc.activeElement; });
  }
  function openMenu() {
    if (!drawer) { return; }
    lastFocus = doc.activeElement;
    drawer.classList.add('is-open');
    if (scrim) { scrim.classList.add('is-open'); }
    if (burger) { burger.setAttribute('aria-expanded', 'true'); }
    root.style.overflow = 'hidden';
    setTimeout(function () {
      var f = focusables();
      var target = one('[data-close]', drawer) || f[0];
      if (target) { target.focus(); }
    }, 60);
  }
  function closeMenu() {
    if (!drawer || !drawer.classList.contains('is-open')) { return; }
    drawer.classList.remove('is-open');
    if (scrim) { scrim.classList.remove('is-open'); }
    if (burger) { burger.setAttribute('aria-expanded', 'false'); }
    root.style.overflow = '';
    var back = burger || lastFocus;
    if (back && back.focus) { back.focus(); }
  }
  if (burger) { burger.addEventListener('click', openMenu); }
  if (scrim) { scrim.addEventListener('click', closeMenu); }
  all('[data-close]').forEach(function (b) { b.addEventListener('click', closeMenu); });
  if (drawer) {
    all('a', drawer).forEach(function (a) { a.addEventListener('click', function () { if (drawer.classList.contains('is-open')) { drawer.classList.remove('is-open'); if (scrim) { scrim.classList.remove('is-open'); } if (burger) { burger.setAttribute('aria-expanded', 'false'); } root.style.overflow = ''; } }); });
  }
  doc.addEventListener('keydown', function (e) {
    if (!drawer || !drawer.classList.contains('is-open')) { return; }
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key === 'Tab') {
      var f = focusables();
      if (!f.length) { return; }
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (drawer.contains(doc.activeElement) === false) { e.preventDefault(); first.focus(); }
    }
  });
  try {
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function (m) { if (m.matches) { closeMenu(); } });
  } catch (e) { /* ignore */ }

  /* ---------- hero stage slider ---------- */
  var stage = one('[data-stage]');
  if (stage) {
    var sprites = all('.stage__spr', stage);
    var thumbs = all('.thumb', stage);
    var tagBox = one('[data-tag]', stage);
    var tagNum = one('[data-tag-num]', stage);
    var flav = one('[data-flav]', stage);
    var frame = one('.stage__frame', stage);
    var strip = one('[data-thumbs]', stage);
    var cur = 0;
    var clsAll = [];
    thumbs.forEach(function (t) { clsAll.push(t.getAttribute('data-cls')); });
    var show = function (i, fromUser) {
      var n = sprites.length;
      cur = (i + n) % n;
      sprites.forEach(function (s, k) {
        var on = k === cur;
        s.classList.toggle('is-on', on);
        s.setAttribute('alt', on ? thumbs[k].getAttribute('aria-label') : '');
      });
      thumbs.forEach(function (t, k) {
        t.classList.toggle('is-on', k === cur);
        t.setAttribute('aria-pressed', k === cur ? 'true' : 'false');
      });
      var th = thumbs[cur];
      var cls = th.getAttribute('data-cls');
      clsAll.forEach(function (c) { if (c) { tagBox.classList.remove(c); flav.classList.remove(c); } });
      tagBox.classList.add(cls);
      flav.classList.add(cls);
      tagNum.textContent = 'Combinación ' + th.getAttribute('data-num');
      flav.textContent = th.getAttribute('data-flavors').split('|').join(' · ');
      if (strip && fromUser !== 'init') {
        var left = th.offsetLeft - (strip.clientWidth - th.clientWidth) / 2;
        try { strip.scrollTo({ left: left, behavior: reduce ? 'auto' : 'smooth' }); } catch (e) { strip.scrollLeft = left; }
      }
    };
    thumbs.forEach(function (t, k) { t.addEventListener('click', function () { show(k, true); }); });
    var pv = one('[data-prev]', stage);
    var nx = one('[data-next]', stage);
    if (pv) { pv.addEventListener('click', function () { show(cur - 1, true); }); }
    if (nx) { nx.addEventListener('click', function () { show(cur + 1, true); }); }
    if (frame) {
      frame.setAttribute('tabindex', '0');
      frame.setAttribute('role', 'group');
      frame.setAttribute('aria-roledescription', 'carrusel');
      frame.setAttribute('aria-label', 'Combinaciones del VapSolo Quads 80K');
      frame.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1, true); }
        if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1, true); }
      });
      var sx = null;
      var sy = null;
      frame.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; });
      frame.addEventListener('pointerup', function (e) {
        if (sx === null) { return; }
        var dx = e.clientX - sx;
        var dy = e.clientY - sy;
        sx = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { show(cur + (dx < 0 ? 1 : -1), true); }
      });
      frame.addEventListener('pointercancel', function () { sx = null; });
    }
    show(0, 'init');
  }

  /* ---------- filter helpers (home arena + combinations page) ---------- */
  var chipsBox = one('[data-chips]');
  var chips = chipsBox ? all('[data-chip]', chipsBox) : [];
  var countBox = one('[data-count]');
  var searchForm = one('[data-search]');
  var qInput = searchForm ? one('input', searchForm) : null;
  var clearBtn = searchForm ? one('[data-clear]', searchForm) : null;
  var emptyBox = one('[data-empty]');
  var grid = one('[data-grid]');
  var arena = one('[data-arena]');
  var term = '';

  if (chipsBox) { chipsBox.hidden = false; }

  function pluralSabores(n) { return n + ' sabor' + (n === 1 ? '' : 'es') + ' distinto' + (n === 1 ? '' : 's'); }

  function filterTargets() {
    if (grid) { return all('.card[data-find]', grid).map(function (el) { return { el: el, box: el, find: el.getAttribute('data-find'), fl: el.getAttribute('data-find') }; }); }
    if (arena) { return all('.roster__item', arena).map(function (el) { return { el: el, box: el.parentNode, find: el.getAttribute('data-find'), fl: el.getAttribute('data-flavors') }; }); }
    return [];
  }

  function updateTile() {
    if (!grid) { return; }
    var tile = one('.card--cta', grid);
    if (!tile) { return; }
    var cards = all('.card[data-find]', grid).filter(function (c) { return !c.hidden; });
    var cols = 1;
    try { cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length; } catch (e) { cols = 2; }
    var rem = cards.length % cols;
    var span = rem === 0 ? cols : cols - rem;
    tile.style.setProperty('--tile', String(span));
  }

  function applyFilter(q) {
    term = norm(q);
    var words = term.split(' ').filter(function (w) { return w; });
    var targets = filterTargets();
    var shown = 0;
    var seen = {};
    var firstVisible = null;
    targets.forEach(function (t) {
      var hay = norm(t.find);
      var ok = words.every(function (w) { return hay.indexOf(w) > -1; });
      t.box.hidden = !ok;
      if (ok) {
        shown++;
        if (!firstVisible) { firstVisible = t.el; }
        var names = t.el.getAttribute('data-flavors');
        if (names) { names.split('|').forEach(function (n) { seen[n] = 1; }); }
        else if (grid) { /* flavours stored in find text for cards */ }
      }
    });
    if (grid) {
      var uniq = {};
      all('.card[data-find]', grid).forEach(function (c) {
        if (c.hidden) { return; }
        all('.setcard__name span', c).forEach(function (s) { uniq[s.textContent] = 1; });
      });
      seen = uniq;
    }
    var flavN = Object.keys(seen).length;
    if (countBox) {
      countBox.innerHTML = '';
      var s1 = doc.createElement('strong');
      s1.textContent = shown + ' combinaci' + (shown === 1 ? 'ón' : 'ones');
      var s2 = doc.createElement('strong');
      s2.textContent = pluralSabores(flavN);
      countBox.appendChild(s1);
      countBox.appendChild(doc.createTextNode(' · '));
      countBox.appendChild(s2);
    }
    if (emptyBox) { emptyBox.hidden = shown !== 0; }
    chips.forEach(function (c) {
      var v = c.getAttribute('data-chip');
      var on = v === 'all' ? term === '' : norm(v) === term;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (clearBtn) { clearBtn.hidden = term === ''; }
    updateTile();
    if (arena && arenaApi) { arenaApi.ensureVisible(firstVisible); }
  }

  function syncUrl(q) {
    if (!isWeb && location.protocol !== 'file:') { return; }
    try {
      var u = location.pathname + (q ? '?q=' + encodeURIComponent(q) : '') + location.hash;
      history.replaceState(null, '', u);
    } catch (e) { /* ignore */ }
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var v = c.getAttribute('data-chip');
      var q = v === 'all' ? '' : v;
      if (qInput) { qInput.value = q; syncUrl(q); }
      applyFilter(q);
    });
  });
  if (searchForm && qInput) {
    searchForm.addEventListener('submit', function (e) { e.preventDefault(); syncUrl(qInput.value.trim()); applyFilter(qInput.value); });
    qInput.addEventListener('input', function () { syncUrl(qInput.value.trim()); applyFilter(qInput.value); });
    if (clearBtn) { clearBtn.addEventListener('click', function () { qInput.value = ''; syncUrl(''); applyFilter(''); qInput.focus(); }); }
  }

  /* ---------- arena (spotlight + roster) ---------- */
  var arenaApi = null;
  if (arena) {
    var spot = one('[data-spot]', arena);
    var spotImg = one('[data-spot-img]', arena);
    var photo = one('.spot__photo', arena);
    var lab = one('[data-spot-label]', arena);
    var fl = one('[data-spot-flavors]', arena);
    var items = all('.roster__item', arena);
    var rootPath = arena.getAttribute('data-root') || '';
    var active = 0;
    var timer = null;
    var allCls = items.map(function (b) { return b.getAttribute('data-cls'); });

    var visibleItems = function () { return items.filter(function (b) { return !b.parentNode.hidden; }); };
    var select = function (idx, focus) {
      var b = items[idx];
      if (!b) { return; }
      active = idx;
      items.forEach(function (x, k) {
        x.classList.toggle('is-on', k === idx);
        x.setAttribute('aria-pressed', k === idx ? 'true' : 'false');
        x.setAttribute('tabindex', k === idx ? '0' : '-1');
      });
      var slug = b.getAttribute('data-slug');
      var flavs = b.getAttribute('data-flavors').split('|');
      var base = rootPath + 'assets/img/square/' + slug;
      var alt = 'VapSolo® Quads 80K, combinación ' + b.getAttribute('data-num') + ': ' + flavs[0] + ', ' + flavs[1] + ', ' + flavs[2] + ' y ' + flavs[3];
      allCls.forEach(function (c) { spot.classList.remove(c); });
      spot.classList.add(b.getAttribute('data-cls'));
      lab.textContent = 'Combinación ' + b.getAttribute('data-num');
      fl.innerHTML = '';
      flavs.forEach(function (n) { var li = doc.createElement('li'); li.textContent = n; fl.appendChild(li); });
      photo.classList.add('is-swap');
      clearTimeout(timer);
      var pre = new Image();
      var apply = function () {
        photo.setAttribute('srcset', base + '-400.webp 400w, ' + base + '-800.webp 800w, ' + base + '-1000.webp 1000w');
        photo.setAttribute('src', base + '-800.webp');
        photo.setAttribute('alt', alt);
        photo.classList.remove('is-swap');
      };
      pre.onload = function () { timer = setTimeout(apply, reduce ? 0 : 120); };
      pre.onerror = apply;
      pre.src = base + '-800.webp';
      if (focus) { b.focus(); }
    };
    arenaApi = {
      ensureVisible: function (first) {
        var vis = visibleItems();
        if (!vis.length) { return; }
        if (vis.indexOf(items[active]) === -1) { select(items.indexOf(vis[0]), false); }
      }
    };
    var canHover = false;
    try { canHover = window.matchMedia('(hover: hover) and (min-width: 960px)').matches; } catch (e) { canHover = false; }
    items.forEach(function (b, k) {
      b.addEventListener('click', function () { select(k, false); });
      if (canHover) { b.addEventListener('mouseenter', function () { if (active !== k) { select(k, false); } }); }
      b.addEventListener('keydown', function (e) {
        var vis = visibleItems();
        var pos = vis.indexOf(b);
        var nextB = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { nextB = vis[(pos + 1) % vis.length]; }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { nextB = vis[(pos - 1 + vis.length) % vis.length]; }
        if (e.key === 'Home') { nextB = vis[0]; }
        if (e.key === 'End') { nextB = vis[vis.length - 1]; }
        if (nextB) { e.preventDefault(); select(items.indexOf(nextB), true); }
      });
    });
    items.forEach(function (b, k) { b.setAttribute('tabindex', k === 0 ? '0' : '-1'); });
    /* gentle 3D tilt that follows the cursor (desktop only) */
    if (canHover && !reduce && spotImg && photo) {
      spotImg.addEventListener('pointermove', function (e) {
        var r = spotImg.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        photo.style.transform = 'rotateY(' + (x * 7).toFixed(2) + 'deg) rotateX(' + (-y * 7).toFixed(2) + 'deg) scale(1.02)';
      });
      spotImg.addEventListener('pointerleave', function () { photo.style.transform = ''; });
    }
  }

  /* ---------- initial query (?q=) ---------- */
  if (qInput) {
    var initial = '';
    try {
      var parts = location.search.replace('?', '').split('&');
      parts.forEach(function (p) {
        var kv = p.split('=');
        if (kv[0] === 'q' && kv[1]) { initial = decodeURIComponent(kv[1].split('+').join(' ')); }
      });
    } catch (e) { initial = ''; }
    qInput.value = initial;
    applyFilter(initial);
  } else if (grid || arena) {
    applyFilter('');
  }

  if (grid) {
    window.addEventListener('resize', function () { updateTile(); });
    updateTile();
  }
})();
