/**
 * ═══════════════════════════════════════════════════════════
 * FILOMENA100 — Configuración de Formularios
 * ═══════════════════════════════════════════════════════════
 *
 * ÚNICO ARCHIVO QUE NECESITAS EDITAR.
 *
 * CÓMO OBTENER LA URL DE CADA FORMULARIO:
 *   1. Abre tu formulario en https://forms.microsoft.com
 *   2. Clic en "Compartir" (ícono de compartir arriba a la derecha)
 *   3. En "Enviar y recopilar respuestas" → copia el link
 *   4. Pégalo abajo en el campo correspondiente
 *
 * CÓMO VINCULAR CON EXCEL (hacer 1 sola vez por formulario):
 *   1. Abre el formulario en Microsoft Forms
 *   2. Clic en la pestaña "Respuestas"
 *   3. Clic en el ícono de Excel "Abrir en Excel"
 *   4. Se descarga / crea un archivo .xlsx en tu OneDrive
 *   5. Cada nuevo envío del formulario agrega una fila nueva
 *      al Excel AUTOMÁTICAMENTE. Sin código. Sin Azure. $0.
 *
 * ═══════════════════════════════════════════════════════════
 */

var CONFIG = {

  empresa: 'Filomena100',

  FORMS: {

    /**
     * ── FORMULARIO 1: CONTROL GARITA ──────────────────────
     * Pestaña en Excel: "Control Garita"
     *
     * Crea estos campos en Microsoft Forms (en este orden):
     *
     *  Campo 1 — ID_UNIDAD
     *    Tipo:        Texto (respuesta corta)
     *    Obligatorio: Sí
     *    Descripción: Placa o código del vehículo (Ej: A3H-703)
     *
     *  Campo 2 — FECHA / HORA
     *    ⚠ NO crear este campo.
     *    Forms registra la fecha/hora automáticamente
     *    en la columna "Hora de inicio" del Excel.
     *
     *  Campo 3 — TIPO DE MOV
     *    Tipo:        Opción (selección única)
     *    Obligatorio: Sí
     *    Opciones:    Entrada / Salida
     *
     *  Campo 4 — KILOMETRAJE
     *    Tipo:        Número
     *    Obligatorio: Sí
     *    Restricción: Número entero, mínimo 0
     *
     *  Campo 5 — CHOFER
     *    Tipo:        Texto (respuesta corta)
     *    Obligatorio: Sí
     *    Descripción: Nombre completo del conductor
     *
     *  Campo 6 — DESTINO
     *    Tipo:        Texto (respuesta corta)
     *    Obligatorio: Sí
     *    Descripción: Lugar de destino o ruta
     *
     *  Campo 7 — OBSERVACION
     *    Tipo:        Texto (respuesta larga)
     *    Obligatorio: No
     *    Descripción: Incidencias, novedades
     */
    garita: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=w7WvbWQMzUKZktnsKnUAq-hqqmvj9xBLpwkByhDC6o1UMjZTVUQzQkRRWU9IUFA0MU1QWTZQU0Q2Ui4u',   // ← PEGA AQUÍ la URL de tu formulario de Garita


    /**
     * ── FORMULARIO 2: CONTROL RETRO ───────────────────────
     * Pestaña en Excel: "Control Retro"
     *
     *  Campo 1 — ID_UNIDAD
     *    Tipo:        Texto (respuesta corta)
     *    Obligatorio: Sí
     *    Sugerencia:  Pon "RETRO-01" como texto de marcador
     *
     *  Campo 2 — FECHA / HORA
     *    ⚠ NO crear — Forms lo registra automáticamente.
     *
     *  Campo 3 — HORÓMETRO
     *    Tipo:        Número
     *    Obligatorio: Sí
     *    Restricción: Decimal (1 decimal). Ej: 2847.5
     *    Descripción: Lectura actual del horómetro
     *
     *  Campo 4 — OPERARIO
     *    Tipo:        Texto (respuesta corta)
     *    Obligatorio: Sí
     *    Descripción: Nombre del operador
     *
     *  Campo 5 — COMBUSTIBLE
     *    Tipo:        Opción (selección única)
     *    Obligatorio: Sí
     *    Opciones:    Diesel / GLP / No cargó
     *    Descripción: Tipo de combustible cargado en esta jornada
     *
     *  Campo 6 — CANTIDAD COM.
     *    Tipo:        Número
     *    Obligatorio: Sí
     *    Restricción: Decimal. Ej: 45.5
     *    Descripción: Galones o cantidad cargada (poner 0 si no cargó)
     *
     *  Campo 7 — ACTIVIDAD
     *    Tipo:        Opción (selección única)
     *    Obligatorio: Sí
     *    Opciones:    Excavación / Ralentí-Espera / Traslado / Mantenimiento
     */
    retro: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=w7WvbWQMzUKZktnsKnUAq-hqqmvj9xBLpwkByhDC6o1UQzNVWTZNT05RSVVCWEJDT01UODFWRkQzRS4u',    // ← PEGA AQUÍ la URL de tu formulario de Retro


    /**
     * ── FORMULARIO 3: CONTROL OTROS ───────────────────────
     * Pestaña en Excel: "Control Otros"
     * (Para el Generador u otras máquinas con medición de combustible %)
     *
     *  Campo 1 — ID_UNIDAD
     *    Tipo:        Texto (respuesta corta)
     *    Obligatorio: Sí
     *    Sugerencia:  Pon "GEN-01" como texto de marcador
     *
     *  Campo 2 — FECHA / HORA
     *    ⚠ NO crear — Forms lo registra automáticamente.
     *
     *  Campo 3 — CANTIDAD GL
     *    Tipo:        Número
     *    Obligatorio: Sí
     *    Restricción: Decimal. Ej: 120.5
     *    Descripción: Galones cargados en este período
     *
     *  Campo 4 — % CI  (Porcentaje Combustible Inicial)
     *    Tipo:        Número
     *    Obligatorio: Sí
     *    Restricción: Entre 0 y 100
     *    Descripción: % del tanque al INICIO del turno/período
     *
     *  Campo 5 — % CF  (Porcentaje Combustible Final)
     *    Tipo:        Número
     *    Obligatorio: Sí
     *    Restricción: Entre 0 y 100
     *    Descripción: % del tanque al FINAL del turno/período
     *
     *  Campo 6 — REGISTRADOR
     *    Tipo:        Texto (respuesta corta)
     *    Obligatorio: Sí
     *    Descripción: Nombre de quien hace el registro
     */
    generador: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=w7WvbWQMzUKZktnsKnUAq-hqqmvj9xBLpwkByhDC6o1UNFM5SlIzWEdDQlNYNTZCNVNSTlQ1U1lPWC4u', // ← PEGA AQUÍ la URL de tu formulario de Otros

  },

  COUNTER_KEY: 'filomena_counters',

};
