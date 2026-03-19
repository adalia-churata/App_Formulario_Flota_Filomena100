# FILOMENA100 — Control de Flota
## Guía Completa: Setup + Fórmulas Excel

---

## PARTE 1 — ACTIVAR LA APP EN GITHUB PAGES

1. Sube todos estos archivos a tu repositorio de GitHub
2. Ve a **Settings → Pages → Source: main branch → / (root)**
3. URL resultante: `https://TU-USUARIO.github.io/filomena100`
4. En Chrome Android: menú ⋮ → **"Instalar aplicación"**

---

## PARTE 2 — CREAR LOS 3 FORMULARIOS EN MICROSOFT FORMS

Ve a **https://forms.microsoft.com** y crea un formulario por cada módulo:

---

### FORMULARIO 1 — CONTROL GARITA

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| Placa / ID Unidad | Texto corto | ✅ | Ej: A3H-703, CAM-01 |
| Tipo de Evento | Opción múltiple | ✅ | Opciones: Entrada / Salida |
| Kilometraje Actual | Número | ✅ | Sin decimales |
| Observaciones | Texto largo | ❌ | Incidencias, novedades |

> **Fecha y hora:** Microsoft Forms las registra automáticamente. NO necesitas un campo para eso.

---

### FORMULARIO 2 — MAQUINARIA: RETROEXCAVADORA

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| ID Equipo | Texto corto | ✅ | Valor predeterminado: RETRO-01 |
| Operario | Texto corto | ✅ | Nombre completo |
| Horómetro Actual | Número | ✅ | Con 1 decimal (ej: 2847.5) |
| Actividad | Opción múltiple | ✅ | Excavación / Ralentí-Espera / Traslado |
| Galones Cargados (esta jornada) | Número | ❌ | Solo si hubo carga de combustible |
| Observaciones | Texto largo | ❌ | Fallas, novedades |

---

### FORMULARIO 3 — MAQUINARIA: GENERADOR

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| ID Equipo | Texto corto | ✅ | Valor predeterminado: GEN-01 |
| Operario | Texto corto | ✅ | Nombre completo |
| Horómetro Actual | Número | ✅ | Con 1 decimal |
| Actividad | Opción múltiple | ✅ | Generación Continua / Ralentí / Parada Programada |
| Galones Cargados (esta jornada) | Número | ❌ | Solo si hubo carga |
| Observaciones | Texto largo | ❌ | |

---

## PARTE 3 — VINCULAR FORMS CON EXCEL (GRATIS, NATIVO)

Para **cada formulario**, haz esto una sola vez:

1. Abre el formulario en Microsoft Forms
2. Clic en pestaña **"Respuestas"**
3. Clic en el ícono de Excel **"Abrir en Excel"**
4. Se crea automáticamente un archivo `.xlsx` en tu OneDrive
5. **Cada vez que alguien envíe el formulario, una nueva fila aparece en ese Excel**

> ✅ No necesitas Azure. No necesitas Power Automate. Es 100% nativo de Microsoft 365.

---

## PARTE 4 — CONFIGURAR LA APP (1 solo archivo)

Abre `js/config.js` y reemplaza los campos vacíos con las URLs de tus formularios:

```javascript
FORMS: {
  garita:    'https://forms.office.com/r/TU_CODIGO_GARITA',
  retro:     'https://forms.office.com/r/TU_CODIGO_RETRO',
  generador: 'https://forms.office.com/r/TU_CODIGO_GENERADOR',
}
```

Haz commit y push. La app cargará los formularios automáticamente.

---

## PARTE 5 — HOJA DE REPORTE EN EXCEL: FÓRMULAS

En tu Excel de OneDrive (el que creó Forms), agrega una **nueva pestaña** llamada `REPORTE` y coloca estas fórmulas. Asume que los datos de maquinaria están en la pestaña `Respuestas` con estas columnas:

- **Col A** = Hora de inicio (timestamp automático de Forms)
- **Col B** = ID Equipo
- **Col C** = Horómetro Actual
- **Col D** = Actividad
- **Col E** = Galones Cargados

---

### 5.1 — TABLA RESUMEN POR EQUIPO

En la pestaña `REPORTE`, construye esta tabla a partir de la fila 2:

```
Celda A1: EQUIPO
Celda B1: PRIMER HORÓMETRO (período)
Celda C1: ÚLTIMO HORÓMETRO (período)
Celda D1: HORAS TRABAJADAS (horómetro)
Celda E1: TOTAL GALONES CARGADOS
Celda F1: CONSUMO HORARIO (Gln/Hr)
Celda G1: HORAS RELOJ (período)
Celda H1: UTILIZACIÓN OPERATIVA %
Celda I1: ALERTA
```

---

### 5.2 — FÓRMULAS FILA 2 (para RETRO-01)

**A2 — ID del equipo:**
```
=RETRO-01
```
*(escribe el texto directamente)*

**B2 — Primer horómetro registrado en el período:**
```excel
=MINIFS(Respuestas!C:C, Respuestas!B:B, A2)
```

**C2 — Último horómetro registrado:**
```excel
=MAXIFS(Respuestas!C:C, Respuestas!B:B, A2)
```

**D2 — Horas trabajadas según horómetro:**
```excel
=C2-B2
```

**E2 — Total galones cargados en el período:**
```excel
=SUMIF(Respuestas!B:B, A2, Respuestas!E:E)
```

**F2 — Consumo horario real (Gln/Hr):**
```excel
=SI(D2=0, "Sin datos", E2/D2)
```

**G2 — Horas reloj entre primer y último registro:**
```excel
=SI(CONTAR.SI(Respuestas!B:B, A2)<2, "Sin datos",
  (MAXIFS(Respuestas!A:A, Respuestas!B:B, A2) -
   MINIFS(Respuestas!A:A, Respuestas!B:B, A2)) * 24)
```

**H2 — Utilización operativa (horómetro vs. reloj):**
```excel
=SI(O(D2=0, G2="Sin datos"), "Sin datos",
  TEXTO(D2/G2, "0.0%"))
```
> Para el **generador 24/7**, este % debería estar siempre cerca del 100%.
> Si baja del 90%, hay paradas no reportadas.

**I2 — ALERTA de consumo:**
```excel
=SI(F2="Sin datos", "—",
  SI(F2>2.5, "🔴 ALTO — Posible robo o fuga",
    SI(F2<1.2, "🟡 BAJO — Ralentí excesivo o error de lectura",
      "🟢 NORMAL")))
```

---

### 5.3 — FORMATO CONDICIONAL EN COLUMNA F (Consumo Gln/Hr)

1. Selecciona el rango **F2:F100**
2. Ve a **Inicio → Formato condicional → Nueva regla**

**Regla 1 — ROJO (consumo alto, posible robo):**
- Tipo: *"Usar una fórmula..."*
- Fórmula: `=Y(ESNUMERO(F2), F2>2.5)`
- Formato: Relleno **ROJO** (#FF0000), texto blanco, negrita

**Regla 2 — AMARILLO (consumo bajo, ralentí excesivo):**
- Fórmula: `=Y(ESNUMERO(F2), F2<1.2)`
- Formato: Relleno **AMARILLO** (#FFD700), texto negro, negrita

**Regla 3 — VERDE (rango normal):**
- Fórmula: `=Y(ESNUMERO(F2), F2>=1.2, F2<=2.5)`
- Formato: Relleno **VERDE** (#00AA44), texto blanco

> **Rangos de alerta sugeridos:**
> - `< 1.2 Gln/Hr` → Ralentí excesivo o lectura incorrecta (revisar)
> - `1.2 – 2.5 Gln/Hr` → Rango normal de operación
> - `> 2.5 Gln/Hr` → Consumo anormal (posible robo, fuga, o mal reporte)

---

### 5.4 — FÓRMULA EXTRA: UTILIZACIÓN GENERADOR (24/7)

Para monitorear que el generador no tenga paradas no reportadas:

```excel
=SI(CONTAR.SI(Respuestas!B:B,"GEN-01")=0, "Sin registros",
  SI((MAXIFS(Respuestas!C:C,Respuestas!B:B,"GEN-01")-
      MINIFS(Respuestas!C:C,Respuestas!B:B,"GEN-01")) /
     ((MAXIFS(Respuestas!A:A,Respuestas!B:B,"GEN-01")-
       MINIFS(Respuestas!A:A,Respuestas!B:B,"GEN-01"))*24) < 0.9,
    "⚠️ POSIBLE PARADA NO REPORTADA",
    "✅ Operando normalmente"))
```

---

### 5.5 — FILTRO POR FECHAS (para reportes semanales/mensuales)

Agrega dos celdas de fecha en tu hoja `REPORTE`:

```
K1: FECHA INICIO   → L1: (escribe la fecha, ej: 01/03/2026)
K2: FECHA FIN      → L2: (ej: 31/03/2026)
```

Luego modifica las fórmulas de SUMIF para incluir el rango de fechas:

```excel
=SUMAR.SI.CONJUNTO(
  Respuestas!E:E,        ← columna a sumar (galones)
  Respuestas!B:B, A2,    ← filtro por equipo
  Respuestas!A:A, ">="&L1,  ← desde fecha
  Respuestas!A:A, "<="&L2)  ← hasta fecha
```

---

## PARTE 6 — CAMPOS DE MICROSOFT FORMS SUGERIDOS

### Para garita — guía de campos automáticos que registra Forms:
- **Hora de inicio** → aparece automáticamente en columna A del Excel
- **ID de respuesta** → identificador único por registro
- **Nombre del encuestado** → si activas la opción "Registrar nombre"

### Activar registro de nombre (recomendado para garita):
1. En tu Form → ⚙️ Configuración
2. Activa **"Registrar nombre"**
3. Esto agrega la columna "Nombre" automáticamente al Excel

---

## RESUMEN DE ARCHIVOS

```
filomena100/
├── index.html          ← App principal (menú + iframes)
├── manifest.json       ← PWA (instalación en Android)
├── sw.js               ← Service Worker (offline del shell)
├── css/
│   └── style.css       ← Diseño industrial / mobile-first
└── js/
    ├── config.js       ← ⚙️ AQUÍ van las URLs de tus Forms
    └── app.js          ← Lógica de navegación y contadores
```

**Solo necesitas editar: `js/config.js`**

---

## FLUJO DE DATOS COMPLETO

```
Celular en campo
      │
      ▼
FlotaApp (PWA instalada en Android)
      │
      ▼
Microsoft Forms (iframe embebido)
      │ [Envío del formulario]
      ▼
Microsoft Forms → Respuestas → Excel en OneDrive
      │
      ▼
Hoja REPORTE: fórmulas calculan KPIs, alertas y gráficos
```

**Costo total: $0** — Solo requiere Microsoft 365 (que ya tienen).
