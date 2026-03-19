/**
 * ═══════════════════════════════════════════════════════
 * FILOMENA100 — Configuración
 * ═══════════════════════════════════════════════════════
 *
 * PASO 1: Crea los formularios en Microsoft Forms
 *   → https://forms.microsoft.com
 *
 * PASO 2: Para cada formulario:
 *   a) Clic en "Compartir" → "Copiar vínculo"
 *   b) Pega el link en el campo correspondiente abajo
 *
 * PASO 3: Vincula con Excel (100% GRATIS):
 *   a) Ve a tu formulario en Forms
 *   b) Clic en pestaña "Respuestas"
 *   c) Clic en ícono de Excel "Abrir en Excel"
 *   d) Se crea automáticamente un Excel en OneDrive
 *      que se actualiza CADA VEZ que alguien envía el form
 *
 * ¡No necesitas Azure ni Power Automate!
 * ═══════════════════════════════════════════════════════
 */

var CONFIG = {

  // ── NOMBRE DE LA EMPRESA ─────────────────────────────
  empresa: 'Filomena100',

  // ── URLs DE MICROSOFT FORMS ───────────────────────────
  // Reemplaza cada "" con la URL real de tu formulario.
  // Ejemplo: "https://forms.office.com/r/aBcDeFgHiJ"
  FORMS: {

    // Formulario 1: Control de Garita
    // Campos recomendados:
    //   - Placa / ID Unidad (Texto corto, obligatorio)
    //   - Tipo de Evento (Opciones: Entrada / Salida)
    //   - Kilometraje Actual (Número)
    //   - Observaciones (Texto largo, opcional)
    // NOTA: Fecha y hora las registra Forms automáticamente
    garita: '',

    // Formulario 2: Control Maquinaria — Retroexcavadora
    // Campos recomendados:
    //   - ID Equipo (Texto, con valor sugerido "RETRO-01")
    //   - Operario (Texto corto)
    //   - Horómetro Actual (Número decimal)
    //   - Actividad (Opciones: Excavación / Ralentí-Espera / Traslado)
    //   - Galones Cargados en esta jornada (Número, opcional)
    //   - Observaciones (Texto largo, opcional)
    retro: '',

    // Formulario 3: Control Maquinaria — Generador
    // Campos recomendados:
    //   - ID Equipo (Texto, con valor sugerido "GEN-01")
    //   - Operario (Texto corto)
    //   - Horómetro Actual (Número decimal)
    //   - Actividad (Opciones: Generación Continua / Ralentí / Parada)
    //   - Galones Cargados en esta jornada (Número, opcional)
    //   - Lectura de voltaje o carga (Número, opcional)
    //   - Observaciones (Texto largo, opcional)
    generador: '',
  },

  // ── CONTADORES LOCALES ────────────────────────────────
  // Guarda cuántos registros se hicieron hoy en este dispositivo.
  // Se resetean a medianoche automáticamente.
  COUNTER_KEY: 'filomena_counters',

};
