/**
 * FILOMENA100 — App v3 (launcher, sin iframes)
 * Microsoft Forms bloquea iframes → abrimos en nueva pestaña
 */

var State = {
  currentView:   'menu',
  currentEquipo: 'retro',
  isOnline:      navigator.onLine,
  _toast:        null,
};

/* ── Helpers ── */
function id(el)     { return document.getElementById(el); }
function show(elId) { var e = id(elId); if (e) e.classList.remove('hidden'); }
function hide(elId) { var e = id(elId); if (e) e.classList.add('hidden'); }
function setText(elId, val) { var e = id(elId); if (e) e.textContent = val; }

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
  State._toast = setTimeout(function() { t.classList.add('hidden'); }, 3200);
}

/* ── INIT ── */
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    id('splash').style.display = 'none';
    show('main-header');
    show('main-app');
    init();
  }, 2200);
  window.addEventListener('online',  function() { setOnline(true);  });
  window.addEventListener('offline', function() { setOnline(false); });
});

function init() {
  updateHeaderDate();
  setInterval(updateHeaderDate, 60000);
  startDatetime('dt-garita');
  startDatetime('dt-maquinaria');
  updateCounters();
  checkForms();
  bindAll();
  setOnline(navigator.onLine);
}

/* ── FECHA / HORA ── */
function updateHeaderDate() {
  var el = id('hdr-date');
  if (!el) return;
  var now   = new Date();
  var dias  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  el.textContent = dias[now.getDay()] + ' ' + now.getDate() + ' ' + meses[now.getMonth()] + ' ' + now.getFullYear();
}

function startDatetime(stripId) {
  function update() {
    var el = id(stripId);
    if (!el) return;
    var now = new Date();
    var pad = function(n) { return String(n).padStart(2,'0'); };
    var dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    var meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    el.innerHTML =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ' +
      dias[now.getDay()] + ' ' + now.getDate() + ' ' + meses[now.getMonth()] + ' ' + now.getFullYear() +
      ' &nbsp;|&nbsp; ' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ' +
      pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()) +
      ' &nbsp;<span style="font-size:10px;color:#666;letter-spacing:0.06em;">AUTO</span>';
  }
  update();
  setInterval(update, 1000);
}

/* ── RED ── */
function setOnline(online) {
  State.isOnline = online;
  var dot   = id('net-dot');
  var label = id('net-label');
  var bar   = id('offline-bar');
  if (dot)   dot.className    = 'net-dot' + (online ? '' : ' offline');
  if (label) label.textContent = online ? 'Online' : 'Sin red';
  if (bar)   online ? bar.classList.add('hidden') : bar.classList.remove('hidden');
}

/* ── VERIFICAR URLS CONFIGURADAS ── */
function checkForms() {
  toggleFormReady('garita',    CONFIG.FORMS.garita);
  toggleFormReady('retro',     CONFIG.FORMS.retro);
  toggleFormReady('generador', CONFIG.FORMS.generador);
}

function toggleFormReady(name, url) {
  var ready = id('ready-' + name);
  var setup = id('setup-' + name);
  var configured = url && url.trim() !== '';
  if (ready) configured ? ready.classList.remove('hidden') : ready.classList.add('hidden');
  if (setup) configured ? setup.classList.add('hidden')    : setup.classList.remove('hidden');
}

/* ── ABRIR FORMULARIO ── */
function openForm(url, label) {
  if (!url || url.trim() === '') {
    toast('Configura la URL en js/config.js', 'error');
    return;
  }
  if (!State.isOnline) {
    toast('Sin conexión — necesitas internet para abrir el formulario', 'error');
    return;
  }
  window.open(url, '_blank', 'noopener');
  toast('Formulario abierto — vuelve aquí al terminar', 'info');
}

/* ── CONTADORES ── */
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
  var today = new Date().toISOString().slice(0,10);
  var c = getCounters();
  if (c.date !== today) { c = { date: today, garita: 0, maq: 0 }; saveCounters(c); }
  setText('stat-garita', c.garita);
  setText('stat-maq',    c.maq);
  setText('stat-total',  c.garita + c.maq);
}
function bumpCounter(type) {
  var today = new Date().toISOString().slice(0,10);
  var c = getCounters();
  if (c.date !== today) c = { date: today, garita: 0, maq: 0 };
  if (type === 'garita') c.garita++;
  if (type === 'maq')    c.maq++;
  saveCounters(c);
  updateCounters();
}

/* ── NAVEGACIÓN ── */
function showView(viewId) {
  document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
  var v = id('view-' + viewId);
  if (v) v.classList.add('active');
  State.currentView = viewId;
  window.scrollTo(0, 0);
}

function switchEquipo(equipo) {
  State.currentEquipo = equipo;
  document.querySelectorAll('.eq-tab').forEach(function(t) {
    t.classList.toggle('active', t.dataset.eq === equipo);
  });
  id('panel-retro').classList.toggle('hidden',     equipo !== 'retro');
  id('panel-generador').classList.toggle('hidden', equipo !== 'generador');
}

/* ── BIND ALL ── */
function bindAll() {
  // Menú
  addTap(id('btn-garita'),    function() { showView('garita'); });
  addTap(id('btn-maquinaria'),function() { showView('maquinaria'); });

  // Back
  addTap(id('back-garita'),     function() { showView('menu'); });
  addTap(id('back-maquinaria'), function() { showView('menu'); });

  // Tabs maquinaria
  addTap(id('tab-retro'),     function() { switchEquipo('retro'); });
  addTap(id('tab-generador'), function() { switchEquipo('generador'); });

  // Abrir formularios
  addTap(id('open-garita'),    function() { openForm(CONFIG.FORMS.garita,    'Garita'); });
  addTap(id('open-retro'),     function() { openForm(CONFIG.FORMS.retro,     'Retro'); });
  addTap(id('open-generador'), function() { openForm(CONFIG.FORMS.generador, 'Otros'); });

  // Confirmar registro (bump contador + toast)
  addTap(id('confirm-garita'), function() {
    bumpCounter('garita');
    toast('✓ Registro contabilizado', 'success');
    openForm(CONFIG.FORMS.garita, 'Garita');
  });
  addTap(id('confirm-retro'), function() {
    bumpCounter('maq');
    toast('✓ Registro contabilizado', 'success');
    openForm(CONFIG.FORMS.retro, 'Retro');
  });
  addTap(id('confirm-generador'), function() {
    bumpCounter('maq');
    toast('✓ Registro contabilizado', 'success');
    openForm(CONFIG.FORMS.generador, 'Otros');
  });
}
