/**
 * FILOMENA100 — App v4
 * Fix popup blocker: usa <a href> en lugar de window.open()
 * Chrome Android bloquea window.open() dentro de touchend+preventDefault
 */

var MODULOS = {
  garita: {
    eyebrow: 'MÓDULO 01',
    title:   'Control Garita',
    icon:    '🔒',
    urlKey:  'garita',
    statKey: 'garita',
    chips: [
      { label: 'ID_UNIDAD',    cls: 'chip-req'  },
      { label: 'FECHA/HORA ↻', cls: 'chip-auto' },
      { label: 'TIPO MOV.',    cls: 'chip-req'  },
      { label: 'KILOMETRAJE',  cls: 'chip-req'  },
      { label: 'CHOFER',       cls: 'chip-req'  },
      { label: 'DESTINO',      cls: 'chip-req'  },
      { label: 'OBSERVACIÓN',  cls: 'chip-opt'  },
    ],
  },
  retro: {
    eyebrow: 'MÓDULO 02',
    title:   'Control Retro',
    icon:    '🚜',
    urlKey:  'retro',
    statKey: 'retro',
    chips: [
      { label: 'ID_UNIDAD',     cls: 'chip-req'  },
      { label: 'FECHA/HORA ↻',  cls: 'chip-auto' },
      { label: 'HORÓMETRO',     cls: 'chip-req'  },
      { label: 'OPERARIO',      cls: 'chip-req'  },
      { label: 'COMBUSTIBLE',   cls: 'chip-req'  },
      { label: 'CANTIDAD COM.', cls: 'chip-req'  },
      { label: 'ACTIVIDAD',     cls: 'chip-req'  },
    ],
  },
  otros: {
    eyebrow: 'MÓDULO 03',
    title:   'Control Otros Equipos',
    icon:    '⚡',
    urlKey:  'generador',
    statKey: 'otros',
    chips: [
      { label: 'ID_UNIDAD',    cls: 'chip-req'  },
      { label: 'FECHA/HORA ↻', cls: 'chip-auto' },
      { label: 'CANTIDAD GL',  cls: 'chip-req'  },
      { label: '% CI',         cls: 'chip-req'  },
      { label: '% CF',         cls: 'chip-req'  },
      { label: 'REGISTRADOR',  cls: 'chip-req'  },
    ],
  },
};

var State = {
  modulo:   null,
  isOnline: navigator.onLine,
  _toast:   null,
};

/* ── Helpers ── */
function id(el)            { return document.getElementById(el); }
function show(elId)        { var e=id(elId); if(e) e.classList.remove('hidden'); }
function hide(elId)        { var e=id(elId); if(e) e.classList.add('hidden'); }
function setText(elId,val) { var e=id(elId); if(e) e.textContent=val; }
function pad(n)            { return String(n).padStart(2,'0'); }

function toast(msg, type) {
  var t = id('toast'); if (!t) return;
  t.textContent = msg;
  t.className = 'toast ' + (type||'info');
  t.classList.remove('hidden');
  clearTimeout(State._toast);
  State._toast = setTimeout(function(){ t.classList.add('hidden'); }, 3000);
}

/* ── INIT ── */
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    id('splash').style.display = 'none';
    show('main-header');
    show('main-app');
    init();
  }, 2000);
  window.addEventListener('online',  function(){ setOnline(true);  });
  window.addEventListener('offline', function(){ setOnline(false); });
});

function init() {
  startClock('dt-menu');
  updateHeaderDate();
  setInterval(updateHeaderDate, 30000);
  updateCounters();
  setOnline(navigator.onLine);
  bindMenu();
}

/* ── RELOJ ── */
function fmtNow() {
  var now   = new Date();
  var dias  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return dias[now.getDay()] + ' ' + now.getDate() + ' ' + meses[now.getMonth()] +
         ' ' + now.getFullYear() + '  ·  ' +
         pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
}
function startClock(elId) {
  function tick(){ setText(elId, fmtNow()); }
  tick(); setInterval(tick, 1000);
}
function updateHeaderDate() {
  var now   = new Date();
  var dias  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  setText('hdr-date', dias[now.getDay()] + ' ' + now.getDate() + ' ' + meses[now.getMonth()] + ' ' + now.getFullYear());
}

/* ── RED ── */
function setOnline(online) {
  State.isOnline = online;
  var dot = id('net-dot');
  if (dot) dot.className = 'net-dot' + (online ? '' : ' offline');
  setText('net-label', online ? 'Online' : 'Sin red');
  online ? hide('offline-bar') : show('offline-bar');
}

/* ── VISTAS ── */
function showView(viewId) {
  document.querySelectorAll('.view').forEach(function(v){
    v.classList.remove('active');
    v.classList.add('hidden'); // ocultar todas
  });

  var v = document.getElementById('view-' + viewId);
  if (v) {
    v.classList.add('active');
    v.classList.remove('hidden'); // 
  }

  window.scrollTo(0,0);
}

/* ══════════════════════════════════════════════════════
   CLAVE DEL FIX:
   En lugar de window.open() dentro de un event handler
   (que Chrome Android bloquea como popup), convertimos
   el botón "ABRIR FORMULARIO" en un <a> real con target="_blank".
   Los <a> NUNCA son bloqueados por el navegador.
   El href se actualiza dinámicamente al entrar a cada módulo.
══════════════════════════════════════════════════════ */

/* ── ABRIR MÓDULO ── */
var frame = document.getElementById('form-frame');
var container = document.getElementById('form-container');

if (url && frame) {
  frame.src = url;
  container.classList.remove('hidden');
}


/* ── CHIPS DE REFERENCIA ── */
function renderChips(chips) {
  var ref = id('fields-ref');
  if (!ref) return;
  var html = '<span class="ref-title">Campos del formulario:</span><div class="ref-chips">';
  chips.forEach(function(c){
    html += '<span class="chip ' + c.cls + '">' + c.label + '</span>';
  });
  html += '</div>';
  html += '<span class="ref-legend">'
        + '<span class="chip chip-auto">↻ automático</span>'
        + '&nbsp;<span class="chip chip-opt">gris = opcional</span>'
        + '</span>';
  ref.innerHTML = html;
}

/* ── DESPUÉS DE ABRIR EL FORM ── */
/* El <a> lo abre directamente; mostramos la confirmación
   cuando el usuario vuelve a la app */
function afterLaunch() {
  /* Pequeño delay para que el navegador abra la pestaña primero */
  setTimeout(function(){ show('confirm-card'); }, 300);
}

/* ── CONFIRMACIÓN ── */
function confirmSent() {
  var mod  = MODULOS[State.modulo];
  bumpCounter(mod.statKey);

  var now   = new Date();
  var meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  var ts    = now.getDate() + ' ' + meses[now.getMonth()] + ' ' + now.getFullYear()
            + '  ·  ' + pad(now.getHours()) + ':' + pad(now.getMinutes());

  setText('success-sub',  'Guardado en Excel · OneDrive — ' + mod.title);
  setText('success-meta', ts + '  ·  ' + mod.title);
  showView('success');
}

/* ── CONTADORES ── */
var CKEY = 'filomena_v4_counters';
function getCounters() {
  try { return JSON.parse(localStorage.getItem(CKEY)) || {date:'',garita:0,retro:0,otros:0}; }
  catch(e) { return {date:'',garita:0,retro:0,otros:0}; }
}
function saveCounters(c) {
  try { localStorage.setItem(CKEY, JSON.stringify(c)); } catch(e){}
}
function updateCounters() {
  var today = new Date().toISOString().slice(0,10);
  var c = getCounters();
  if (c.date !== today) { c = {date:today,garita:0,retro:0,otros:0}; saveCounters(c); }
  setText('stat-garita', c.garita);
  setText('stat-retro',  c.retro);
  setText('stat-otros',  c.otros);
}
function bumpCounter(key) {
  var today = new Date().toISOString().slice(0,10);
  var c = getCounters();
  if (c.date !== today) c = {date:today,garita:0,retro:0,otros:0};
  c[key] = (c[key]||0) + 1;
  saveCounters(c);
  updateCounters();
}

/* ── BIND MENÚ ── */
function bindMenu() {
  /* Botones del menú principal — solo navegación, sin window.open */
  bindTap('btn-garita', function(){ openModulo('garita'); });
  bindTap('btn-retro',  function(){ openModulo('retro');  });
  bindTap('btn-otros',  function(){ openModulo('otros');  });

  /* Back */
  bindTap('btn-back', function(){ showView('menu'); });

  /* El botón de abrir formulario ES un <a> en el HTML,
     no necesita JS para abrirse — solo registramos el afterLaunch */
  var link = id('link-launch');
  link.addEventListener('click', function(e){
    if (!State.isOnline) {
      e.preventDefault();
      toast('Sin conexión a internet', 'error');
      return;
    }
  });

  // Detectar cuando el usuario vuelve
  window.addEventListener('focus', function(){
    if (State.modulo) {
      show('confirm-card');
    }
  });

  /* Confirmación */
  bindTap('btn-confirm-yes', confirmSent);
  bindTap('btn-confirm-no',  function(){
    hide('confirm-card');
    toast('Vuelve a abrir el formulario cuando termines', 'info');
  });

  /* Success */
  bindTap('btn-success-menu', function(){ showView('menu'); });
  bindTap('btn-success-new',  function(){
    hide('confirm-card');
    openModulo(State.modulo);
  });

  /* Nuevo registro desde footer */
  bindTap('btn-new-reg', function(){
    hide('confirm-card');
    /* Simular clic en el <a> */
    var link = id('link-launch');
    if (link && link.href && link.href !== '#') {
      link.click();
    }
  });

  /* Reset medianoche */
  scheduleMidnightReset();
}

/* bindTap: versión simple sin preventDefault para no bloquear clicks nativos */
function bindTap(elId, fn) {
  var el = id(elId);
  if (!el) return;
  var touched = false;
  el.addEventListener('touchend', function(e){
    touched = true; fn();
    setTimeout(function(){ touched=false; }, 400);
  }, {passive:true});   /* passive:true → NO llama preventDefault → no bloquea */
  el.addEventListener('click', function(){
    if (!touched) fn();
  });
}

function scheduleMidnightReset() {
  var now = new Date();
  var midnight = new Date(now);
  midnight.setHours(24,0,5,0);
  setTimeout(function(){
    updateCounters();
    scheduleMidnightReset();
  }, midnight - now);
}
