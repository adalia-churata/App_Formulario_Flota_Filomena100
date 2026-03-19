/**
 * FILOMENA100 — Lógica de la App
 * PWA · Microsoft Forms via iframes · Sin Azure · $0
 */

/* ── Estado ───────────────────────────────────────────── */
var State = {
  currentView:   'menu',
  currentEquipo: 'retro',
  isOnline:      navigator.onLine,
  dtIntervals:   [],
  _toast:        null,
};

/* ── Helpers básicos ──────────────────────────────────── */
function qs(sel)     { return document.querySelector(sel); }
function id(el)      { return document.getElementById(el); }
function show(elId)  { var e = id(elId); if (e) e.classList.remove('hidden'); }
function hide(elId)  { var e = id(elId); if (e) e.classList.add('hidden'); }

function addTap(el, fn) {
  if (!el) return;
  var touched = false;
  el.addEventListener('touchend', function(e) {
    e.preventDefault(); touched = true; fn();
    setTimeout(function() { touched = false; }, 400);
  }, { passive: false });
  el.addEventListener('click', function() { if (!touched) fn(); });
}

function toast(msg, type) {
  type = type || 'info';
  var t = id('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.remove('hidden');
  clearTimeout(State._toast);
  State._toast = setTimeout(function() { t.classList.add('hidden'); }, 3000);
}

/* ── INIT ─────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    id('splash').style.display = 'none';
    show('main-header');
    show('main-app');
    init();
  }, 2400);

  window.addEventListener('online',  function() { setOnline(true);  });
  window.addEventListener('offline', function() { setOnline(false); });
});

function init() {
  updateHeaderDate();
  setInterval(updateHeaderDate, 60000);

  startDatetime('dt-garita');
  startDatetime('dt-maquinaria');

  updateCounters();
  bindAll();
  loadForms();
  setOnline(navigator.onLine);
}

/* ── FECHA / HORA ─────────────────────────────────────── */
function updateHeaderDate() {
  var el = id('hdr-date');
  if (!el) return;
  var now = new Date();
  var dias  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  el.textContent = dias[now.getDay()] + ' ' + now.getDate() + ' ' + meses[now.getMonth()] + ' ' + now.getFullYear();
}

function startDatetime(stripId) {
  function update() {
    var el = id(stripId);
    if (!el) return;
    var now = new Date();
    var pad = function(n) { return String(n).padStart(2, '0'); };
    var dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    var meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    el.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
      dias[now.getDay()] + ' ' + now.getDate() + ' ' + meses[now.getMonth()] + ' ' + now.getFullYear() +
      ' &nbsp;|&nbsp; ' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
      pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()) +
      ' &nbsp;<span style="font-size:10px;color:#888;letter-spacing:0.08em;">AUTO</span>';
  }
  update();
  var iv = setInterval(update, 1000);
  State.dtIntervals.push(iv);
}

/* ── RED ──────────────────────────────────────────────── */
function setOnline(online) {
  State.isOnline = online;
  var dot   = id('net-dot');
  var label = id('net-label');
  var bar   = id('offline-bar');
  if (dot)   dot.className   = 'net-dot' + (online ? '' : ' offline');
  if (label) label.textContent = online ? 'Online' : 'Sin red';
  if (bar)   online ? bar.classList.add('hidden') : bar.classList.remove('hidden');
}

/* ── NAVEGACIÓN ───────────────────────────────────────── */
function showView(viewId) {
  document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
  var v = id('view-' + viewId);
  if (v) v.classList.add('active');
  State.currentView = viewId;
  window.scrollTo(0, 0);
}

/* ── FORMULARIOS (iframes) ────────────────────────────── */
function loadForms() {
  loadForm('garita',    'iframe-garita',    'placeholder-garita',    CONFIG.FORMS.garita);
  loadForm('retro',     'iframe-retro',     'placeholder-retro',     CONFIG.FORMS.retro);
  loadForm('generador', 'iframe-generador', 'placeholder-generador', CONFIG.FORMS.generador);
}

function loadForm(name, iframeId, placeholderId, url) {
  var iframe      = id(iframeId);
  var placeholder = id(placeholderId);
  if (!iframe) return;

  if (!url || url.trim() === '') {
    // Sin URL → mostrar instrucciones de setup
    if (placeholder) placeholder.classList.remove('hidden');
    iframe.classList.add('hidden');
    return;
  }

  // URL configurada → cargar iframe
  if (placeholder) placeholder.classList.add('hidden');
  iframe.src = url;
  iframe.classList.remove('hidden');
}

function reloadIframe(iframeId, url) {
  var iframe = id(iframeId);
  if (!iframe) return;
  if (!url || url.trim() === '') {
    toast('Configura la URL del formulario en js/config.js', 'error');
    return;
  }
  iframe.src = 'about:blank';
  setTimeout(function() { iframe.src = url; }, 100);
  toast('Formulario recargado', 'info');
}

function resetIframe(iframeId, url) {
  // Recarga el iframe para mostrar el form en blanco (nuevo registro)
  reloadIframe(iframeId, url);
}

/* ── CONTADORES LOCALES ───────────────────────────────── */
function getCounters() {
  try {
    var raw = localStorage.getItem(CONFIG.COUNTER_KEY);
    if (!raw) return { date: '', garita: 0, maq: 0 };
    return JSON.parse(raw);
  } catch(e) { return { date: '', garita: 0, maq: 0 }; }
}

function saveCounters(c) {
  try { localStorage.setItem(CONFIG.COUNTER_KEY, JSON.stringify(c)); } catch(e) {}
}

function updateCounters() {
  var today = new Date().toISOString().slice(0, 10);
  var c = getCounters();
  if (c.date !== today) { c = { date: today, garita: 0, maq: 0 }; saveCounters(c); }
  setText('stat-garita', c.garita);
  setText('stat-maq',    c.maq);
  setText('stat-total',  c.garita + c.maq);
}

function bumpCounter(type) {
  var today = new Date().toISOString().slice(0, 10);
  var c = getCounters();
  if (c.date !== today) { c = { date: today, garita: 0, maq: 0 }; }
  if (type === 'garita') c.garita++;
  if (type === 'maq')    c.maq++;
  saveCounters(c);
  updateCounters();
}

function setText(elId, val) {
  var el = id(elId);
  if (el) el.textContent = val;
}

/* ── EQUIPO TABS (Maquinaria) ─────────────────────────── */
function switchEquipo(equipo) {
  State.currentEquipo = equipo;

  // Tabs
  document.querySelectorAll('.eq-tab').forEach(function(t) {
    t.classList.toggle('active', t.dataset.eq === equipo);
  });

  // Panels
  if (equipo === 'retro') {
    id('panel-retro').classList.remove('hidden');
    id('panel-generador').classList.add('hidden');
  } else {
    id('panel-generador').classList.remove('hidden');
    id('panel-retro').classList.add('hidden');
  }
}

/* ── BIND ALL EVENTS ──────────────────────────────────── */
function bindAll() {

  // Menú → Garita
  addTap(id('btn-garita'), function() { showView('garita'); });

  // Menú → Maquinaria
  addTap(id('btn-maquinaria'), function() { showView('maquinaria'); });

  // Back: Garita → Menú
  addTap(id('back-garita'), function() { showView('menu'); });

  // Back: Maquinaria → Menú
  addTap(id('back-maquinaria'), function() { showView('menu'); });

  // Tabs de equipo
  addTap(id('tab-retro'),     function() { switchEquipo('retro'); });
  addTap(id('tab-generador'), function() { switchEquipo('generador'); });

  // Recargar formulario Garita
  addTap(id('btn-reload-garita'), function() {
    reloadIframe('iframe-garita', CONFIG.FORMS.garita);
  });

  // Nuevo registro Garita (resetea el iframe = form en blanco)
  addTap(id('btn-new-garita'), function() {
    bumpCounter('garita');
    resetIframe('iframe-garita', CONFIG.FORMS.garita);
    toast('Formulario listo para nuevo registro', 'success');
  });

  // Recargar formulario Maquinaria
  addTap(id('btn-reload-maq'), function() {
    var ifrId = State.currentEquipo === 'retro' ? 'iframe-retro' : 'iframe-generador';
    var url   = State.currentEquipo === 'retro' ? CONFIG.FORMS.retro : CONFIG.FORMS.generador;
    reloadIframe(ifrId, url);
  });

  // Nuevo registro Maquinaria
  addTap(id('btn-new-maq'), function() {
    bumpCounter('maq');
    var ifrId = State.currentEquipo === 'retro' ? 'iframe-retro' : 'iframe-generador';
    var url   = State.currentEquipo === 'retro' ? CONFIG.FORMS.retro : CONFIG.FORMS.generador;
    resetIframe(ifrId, url);
    toast('Formulario listo para nuevo registro', 'success');
  });

  // Reseteo de contadores a medianoche
  scheduleMidnightReset();
}

/* ── RESET A MEDIANOCHE ───────────────────────────────── */
function scheduleMidnightReset() {
  var now     = new Date();
  var midnight = new Date(now);
  midnight.setHours(24, 0, 5, 0); // 5 seg después de medianoche
  var msToMidnight = midnight - now;
  setTimeout(function() {
    updateCounters();
    scheduleMidnightReset(); // reprogramar para el día siguiente
  }, msToMidnight);
}
