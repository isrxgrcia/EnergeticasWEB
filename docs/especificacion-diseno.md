# Energy Showcase — Especificación de estructura y diseño

| Campo | Valor |
|---|---|
| Proyecto | `energy-showcase` (nombre provisional: **Energy Showcase**) |
| Contrato | WEB-BRIEF v1 |
| Etapa | Prompt 1 — Estructura y diseño (especificación; sin implementación) |
| Estado | **Propuesto.** Ningún punto de este documento está aprobado por el usuario. |
| Fecha | 2026-10-06 |

Este documento convierte el brief en una especificación revisable. No implementa nada, no fija el contrato técnico de E01 (corresponde al Arquitecto Backend de Prompts) y no da por resuelta ninguna decisión pendiente.

---

## 0. Hechos, propuestas y pendientes

### 0.1 Hechos del entorno (comprobados)

- Repositorio `isrxgrcia/EnergeticasWEB`, rama `master`, **sin commits ni archivos** antes de esta especificación.
- No existen instrucciones de proyecto (`CLAUDE.md`, README), stack, dependencias, recursos gráficos ni catálogo.
- No hay imágenes, marcas, fuentes de datos ni permisos de uso proporcionados.
- Consecuencia: la especificación es **portable**; no depende de framework, router ni herramienta de diseño.

### 0.2 Requisitos del brief (MVP, no negociables en esta etapa)

P01–P03, F01–F04, E01; catálogo local; visitante sin cuenta; solo lectura; español; sin servidor, API remota, carrito, pagos, cuentas, administración, datos personales ni recomendaciones de consumo.

### 0.3 Propuestas de esta especificación (pendientes de aprobación)

Recogidas en el **registro de propuestas** (§11). Cada una tiene ID `PR-xx` para poder aprobarla o rechazarla individualmente.

### 0.4 Pendientes (no bloquean la especificación)

Recogidos en §10 con ID `PD-xx`. Donde falta información se usan **placeholders explícitos** y se indica que toda simulación es provisional.

---

## 1. Mapa de pantallas y funciones

| | F01 Selección coordinada | F02 Filtros / ficha / restablecer | F03 Características verificadas | F04 Adaptable, teclado, movimiento reducido |
|---|---|---|---|---|
| **P01 Inicio** | **Principal**: selector actualiza protagonista | Acceso “Explorar bebidas” lleva a P02 | Resumen de sabor (sin cifras) | Sí |
| **P02 Explorador** | — | **Principal**: filtrar, contador, restablecer, abrir ficha | Tarjeta sin cifras nutricionales | Sí |
| **P03 Detalle** | Ambiente coherente con la bebida consultada | Volver conservando filtros, posición y foco | **Principal**: volumen, cafeína, azúcar con unidad, base y fuente | Sí |

Operaciones de datos necesarias (conceptuales; forma técnica pendiente, PD-05):

| Operación | Usada en | Resultado |
|---|---|---|
| Listar | P01 (selector), P02 (catálogo, opciones de filtro) | Colección E01, posiblemente vacía |
| Filtrar por marca / sabor | P02 | Colección coincidente, posiblemente vacía |
| Consultar por id | P03, P01 (“Ver ficha”) | E01 o “no encontrada” |

### 1.1 Recorrido principal

```
P01 Inicio ──(seleccionar en selector)──▶ P01 actualizada (F01)
    │                                         │
    │ “Explorar bebidas”                      │ “Ver ficha”
    ▼                                         ▼
P02 Explorador ──(filtrar / restablecer)──▶ P02 ──(abrir ficha)──▶ P03 Detalle
    ▲                                                                │
    └──────────── “Volver al catálogo” (filtros + posición + foco) ──┘
```

Desde P03 abierta desde P01 (“Ver ficha”), “Volver” regresa a P01 con la misma bebida seleccionada.

### 1.2 Navegación (PR-03, PR-04)

- **P01 y P02 en la misma página.** P02 es una sección anclada (`#explorar`). “Explorar bebidas” desplaza hasta ella y mueve el foco al encabezado de la sección (con `tabindex="-1"`) para que lectores de pantalla y teclado continúen allí.
- **P03 como vista dedicada.** Requisitos independientes del mecanismo:
  1. Cada ficha es direccionable por id (p. ej. `#/bebida/<id>` o ruta equivalente), de modo que recargar o compartir la URL abre la misma ficha. *Si el entorno de la etapa 2 no permite URL por ficha, se documenta como limitación.*
  2. El botón Atrás del navegador y el botón “Volver” tienen el mismo efecto.
  3. Al entrar en P03 el foco pasa al `h1` de la ficha y el título del documento cambia a `«Nombre» — Energy Showcase`.
  4. Al volver se restauran: valores de filtros, resultados, posición de desplazamiento y foco en la tarjeta de origen (si sigue existiendo; si no, en el encabezado de resultados).
- **Estado de filtros**: se recomienda reflejarlo en la URL (`?marca=…&sabor=…`) para que sobreviva a Atrás/recarga sin almacenamiento local. Alternativa aceptable: estado en memoria de la aplicación. No se usan cookies ni almacenamiento de datos personales.
- **Modal descartado** para P03 por defecto (lectura móvil larga, gestión de foco y Atrás más compleja). Solo se reconsideraría con justificación explícita.

---

## 2. Jerarquía por pantalla

### 2.1 P01 Inicio

Orden de lectura (DOM = orden visual en todos los anchos):

1. **Cabecera** (`header`): nombre provisional “Energy Showcase”, enlace “Explorar” (→ `#explorar`), nota discreta “Escaparate independiente. No es un sitio oficial de ninguna marca.”
2. **Presentación protagonista** (`main > section[aria-labelledby]`):
   - Línea de propósito (`h1`, visible en primera pantalla): **“Descubre bebidas, explora sabores y consulta sus características.”**
   - Bloque de la bebida activa (región `aria-live="polite"` limitada al nombre, ver §7.4):
     - Marca (texto pequeño, mayúsculas espaciadas).
     - **Nombre** (tipografía display; visualmente el texto más grande de la pantalla, ver nota).
     - Perfil de sabor (etiquetas textuales).
     - Descripción breve (máx. ~200 caracteres; si es provisional, etiqueta “Contenido de demostración”).
   - Acciones: **“Ver ficha”** (primaria, abre P03 de la bebida activa) y **“Explorar bebidas”** (secundaria, → P02).
   - **Imagen de la lata** (zona visual) sobre el **ambiente** (halo + motivo gráfico del color de la bebida).
3. **Selector de bebida**: fila de opciones con miniatura + nombre; estado activo visible (ver §3.3).

> Nota de jerarquía: el `h1` es la frase de propósito (semántica estable); el nombre de la bebida es visualmente el texto más grande (display) pero se marca como `h2`. Así el documento tiene un título único que no cambia con cada selección.

**Composición escritorio (≥ 1024 px)** — rejilla asimétrica de 12 columnas:

```
┌──────────────────────────────────────────────────────────────┐
│ Energy Showcase                     Explorar   · independiente│
├───────────────────────┬──────────────────────────────────────┤
│ h1 propósito          │                                      │
│ MARCA                 │        (halo color bebida)           │
│ NOMBRE DISPLAY        │             ┌──────┐                 │
│ [cítrico] [ácido]     │             │ LATA │  ~50 % ancho    │
│ Descripción breve…    │             │      │                 │
│ [Ver ficha] [Explorar]│             └──────┘                 │
│  col 1–5              │  col 6–12                            │
├───────────────────────┴──────────────────────────────────────┤
│ Selector: [▣ Nombre A] [▣ Nombre B]* [▣ Nombre C] …          │
└──────────────────────────────────────────────────────────────┘
```

- La lata ocupa ~50 % del ancho de la composición y nunca se superpone a texto ni controles (la decoración sí puede extenderse detrás de la zona de texto con opacidad ≤ 0.25 y sin tocar controles).
- Altura: `min-height` orientativa `min(100svh − cabecera, 52rem)`; **nunca `height` fija**. Si el contenido no cabe, la sección crece.

**Composición móvil (< 640 px)** — una columna:

```
┌───────────────────────┐
│ Energy Showcase  ☰/Expl│
│ h1 propósito (2–3 lín.)│
│      ┌────┐           │
│      │LATA│  ~55–60 vw │
│      └────┘           │
│ MARCA                  │
│ NOMBRE                 │
│ [sabor] [sabor]        │
│ Descripción…           │
│ [Ver ficha]            │
│ [Explorar bebidas]     │
│ Selector ◂ ▣ ▣ ▣ ▣ ▸   │
└───────────────────────┘
```

- La imagen se limita a `max-height: 45svh` para que nombre y “Ver ficha” aparezcan dentro o muy cerca de la primera pantalla (objetivo: visibles en 360 × 640).
- El selector puede ir inmediatamente bajo la lata (variante PR-07) si en pruebas de la etapa 2 queda fuera de la primera pantalla; decisión a validar con el prototipo.

### 2.2 P02 Explorador (sección `#explorar`)

1. Encabezado `h2` “Explorar bebidas” + frase breve.
2. **Filtros** (`form` con `role="search"` o `fieldset`):
   - Marca: `select` nativo con “Todas las marcas” + opciones derivadas del catálogo.
   - Perfil de sabor: `select` nativo con “Todos los sabores” + vocabulario (PD-06).
   - Botón “Restablecer filtros” (visible solo si hay algún filtro activo; deshabilitarlo no basta porque se pierde en lectores).
   - Semántica provisional: **Y** entre marca y sabor; una sola selección por criterio (PR-09).
3. **Resumen de resultados**: “6 bebidas” / “2 bebidas · Marca X · Cítrico” (región `role="status"`).
4. **Catálogo**: lista (`ul`) de tarjetas.

Columnas del catálogo por ancho disponible del contenedor (no del viewport), con ancho mínimo de tarjeta ~15 rem:

| Ancho contenedor | Columnas orientativas |
|---|---|
| < 30 rem (≈ 480 px) | 1 |
| 30–48 rem | 2 |
| 48–72 rem | 3 |
| ≥ 72 rem | 4 (máximo) |

Implementación sugerida: `grid-template-columns: repeat(auto-fill, minmax(min(15rem, 100%), 1fr))`. En 320–360 px se usa **1 columna** salvo que la prueba real demuestre legibilidad en 2 (no forzar).

### 2.3 P03 Detalle (vista dedicada)

1. Enlace/botón **“← Volver al catálogo”** (o “← Volver al inicio” si se llegó desde P01). Primer elemento enfocable tras la cabecera.
2. `h1` nombre; marca; perfil de sabor.
3. Imagen ampliada con ambiente.
4. Descripción de sabor (marcada como provisional si lo es).
5. **Características** (`h2` “Características”): lista de descripción (`dl`) con una fila por característica:
   - Volumen, Cafeína, Azúcar.
   - Cada fila muestra **valor + unidad + base de medida** (“32 mg por 100 ml”) y estado.
   - Cifra visible **solo si** el campo está verificado según la regla del contrato (PD-07). En otro caso: “Información pendiente” (sin dato) o “Información no verificada” (dato existe sin verificación), **nunca “0”**.
6. **Fuentes** (`h2` “Fuentes”): lista de procedencias enlazadas o citadas, asociadas a cada característica (p. ej. superíndice o texto “Fuente: …” en la fila).
7. Aviso fijo breve: “Información con fines informativos. Escaparate independiente.” (sin recomendaciones de consumo ni afirmaciones de salud o rendimiento).

Escritorio: imagen (col 1–6) e información (col 7–12) lado a lado; ancho de lectura de la información ≤ 65 ch. Móvil: una columna, imagen con `max-height: 50svh`, luego información.

---

## 3. Componentes

Cada componente lista: propósito, contenido, estados y accesibilidad.

### 3.1 Cabecera (`SiteHeader`)
- Contenido: marca del sitio (texto, sin logotipos de terceros), enlace “Explorar”, nota “Escaparate independiente”.
- Enlace “Saltar al contenido” como primer elemento enfocable (visible al recibir foco).
- No fija (`position: static`) para no ocultar foco ni contenido en pantallas bajas; si se propusiera fija, debe garantizar WCAG 2.4.11 (foco no oculto) con `scroll-padding-top`.

### 3.2 Presentación protagonista (`HeroShowcase`)
- Entradas: una bebida E01 (la seleccionada).
- Deriva **de un único valor `selectedId`**: imagen, alt, marca, nombre, sabor, descripción, color, ambiente y destino de “Ver ficha”. Nunca de estados separados que puedan desincronizarse.
- Estados: normal · imagen fallida (placeholder §3.9) · contenido provisional (insignia) · catálogo vacío (sustituye por mensaje §6).

### 3.3 Selector de bebida (`DrinkSelector`)
- Patrón recomendado: **grupo de botones** con `aria-pressed` (o `radiogroup` con flechas; PR-08 elige botones por simplicidad: Tab recorre, Enter/Espacio selecciona).
- Contenedor `nav`/`div` con `aria-label="Elegir bebida"`; cada opción: miniatura (`alt=""`, decorativa porque el nombre está en texto) + nombre visible.
- Activo: `aria-pressed="true"` + **tres señales no cromáticas**: borde grueso (2 px → 3 px), fondo de superficie elevada y marca “●” o subrayado de 3 px bajo el nombre. El color de la bebida es un refuerzo, no la señal.
- Móvil: fila con `overflow-x: auto` nativo, `scroll-snap-type: x proximity`, degradado lateral + texto “Desliza para ver más” solo si hay desbordamiento. Sin flechas obligatorias; el teclado las recorre con Tab y la opción enfocada se desplaza a la vista (`scrollIntoView({block:'nearest', inline:'nearest'})`).
- Seleccionar **no mueve el foco**.

### 3.4 Filtros (`CatalogFilters`)
- Dos `select` nativos con `label` visible (“Marca”, “Sabor”); botón “Restablecer filtros”.
- Aplicación inmediata al cambiar (sin botón “Aplicar”), lo que exige no mover el foco al filtrar.
- Opciones derivadas del catálogo; si el contrato define un vocabulario cerrado de sabores, se usa ese orden.

### 3.5 Resumen de resultados (`ResultsSummary`)
- `role="status"` (cortés). Texto único y breve, actualizado con *debounce* de ~300 ms tras el último cambio para no repetir anuncios.

### 3.6 Tarjeta de catálogo (`DrinkCard`)
- Lata dominante (≥ 55 % de la altura de la tarjeta) sobre halo del color de la bebida; nombre (`h3`), marca, perfil de sabor.
- **Enlace único** “Ver ficha de «Nombre»” (texto visible “Ver ficha”, nombre accesible completo con `aria-label` o texto oculto). Para que toda la tarjeta sea clicable se usa el patrón de pseudo-elemento sobre el enlace, sin anidar interactivos.
- Insignia “Demostración” si es contenido provisional.
- `id` del DOM derivado del id de bebida para restaurar foco al volver.

### 3.7 Detalle (`DrinkDetail`) y fila de característica (`FeatureRow`)
- `FeatureRow` recibe: etiqueta, valor, unidad, base, estado de verificación, fuente. Reglas:

| Situación | Se muestra |
|---|---|
| Valor + unidad + base + verificado + fuente | “**160 mg** por envase de 500 ml” + “Fuente: …” |
| Valor existe pero no verificado | “Información no verificada” (cifra **oculta**) |
| Sin valor | “Información pendiente” |
| Verificado pero falta unidad o base | Tratado como **no verificado** (no se muestra cifra) |

- Nunca se calcula ni convierte (p. ej. por 100 ml → por envase) salvo regla explícita del contrato (PD-07).

### 3.8 Ambiente (`Ambience`)
- Capa decorativa (`aria-hidden="true"`), detrás de la imagen: halo radial del color principal + motivo gráfico abstracto (ondas, burbujas, facetas) elegido por perfil de sabor.
- Los motivos **no representan ingredientes concretos** (ni frutas reconocibles) salvo que el contenido verificado lo justifique (PD-08), para no sugerir composición no verificada.

### 3.9 Imagen de producto (`DrinkImage`) y placeholder
- Siempre con `width`/`height` o `aspect-ratio` reservados (lata ≈ 1:2.2, a confirmar con recursos reales) para evitar saltos de maquetación.
- Imagen de la primera pantalla: carga prioritaria. Catálogo: `loading="lazy"` + `decoding="async"`; `srcset`/`sizes` cuando haya varios tamaños.
- **Placeholder** (sin recurso o fallo de carga): silueta de lata en trazo con el color de la bebida, mismo `aspect-ratio`, texto “Imagen no disponible” y el nombre de la bebida. Se distingue visualmente de una imagen real (trazo discontinuo + texto) para no parecer definitivo.

### 3.10 Mensajes de estado (`StateMessage`)
- Bloque con título, explicación de una línea y **una acción de recuperación**. Ver §6.

### 3.11 Insignia de contenido provisional (`DemoBadge`)
- Texto “Contenido de demostración” (o “Demostración” en tarjetas). Siempre en texto, no solo color/icono.

---

## 4. Tokens de diseño (valores propuestos, a ajustar en la etapa 2)

### 4.1 Color — roles funcionales

| Token | Valor propuesto | Uso |
|---|---|---|
| `--color-bg` | `#121214` | Fondo carbón |
| `--color-surface` | `#1C1C20` | Superficies (filtros, tarjetas) |
| `--color-surface-raised` | `#26262B` | Opción activa, hover |
| `--color-text` | `#F3EEE3` | Texto principal marfil |
| `--color-text-muted` | `#B4AEA3` | Texto secundario |
| `--color-border-control` | `#77777F` | Borde de controles (inputs, selector) |
| `--color-border-subtle` | `#2E2E34` | Separadores decorativos (no identifican controles) |
| `--color-focus` | `#F3EEE3` | Anillo de foco |
| `--accent` | por bebida | Halo, motivos, detalles decorativos |
| `--accent-text` | por bebida o `--color-text` | Texto en color de acento (solo si pasa contraste) |
| `--accent-on` | `#121214` o `#F3EEE3` | Texto sobre relleno de acento |

Relaciones de contraste **calculadas** con la fórmula de luminancia relativa de WCAG para estos valores (no es una auditoría del sitio, que aún no existe):

| Par | bg | surface | surface-raised | Requisito |
|---|---|---|---|---|
| text | 16.17 | 14.68 | 13.01 | ≥ 4.5 |
| text-muted | 8.49 | 7.70 | 6.83 | ≥ 4.5 |
| border-control | 4.21 | 3.83 | 3.39 | ≥ 3 (1.4.11) |
| focus | 16.17 | 14.68 | 13.01 | ≥ 3 (2.4.13 / 1.4.11) |

**Regla del color por bebida** (porque el color del producto no garantiza contraste). Ejemplos calculados contra `--color-bg`:

| Acento ejemplo | vs bg | Texto oscuro sobre acento | Texto marfil sobre acento |
|---|---|---|---|
| `#E8442E` rojo | 4.72 | 4.72 | 3.43 |
| `#2FB36B` verde | 6.93 | 6.93 | 2.33 |
| `#3D7BFF` azul | 4.88 | 4.88 | 3.31 |
| `#F2B705` ámbar | 10.29 | 10.29 | 1.57 |
| `#B04DE0` violeta | **4.44** | 4.44 | 3.64 |

Conclusión: el violeta de ejemplo **no** sirve como `--accent-text` (4.44 < 4.5). Por tanto:
1. `--accent-text` = acento solo si contraste ≥ 4.5 con el fondo donde se use; si no, `--color-text`.
2. `--accent-on` = el de mayor contraste (en estos ejemplos siempre `#121214`); botón primario con relleno de acento solo si ese contraste ≥ 4.5.
3. Comprobación automatizable en la etapa 2 (función de contraste aplicada al catálogo) para no depender de revisión manual por bebida.
4. Estados nunca se comunican solo con el acento.

### 4.2 Tipografía

| Token | Propuesta |
|---|---|
| `--font-display` | Display condensada y contundente (candidatas con licencia libre: *Anton*, *Bebas Neue*, *Oswald*). Pendiente PD-09. Fallback: `Impact, "Arial Narrow Bold", sans-serif` |
| `--font-body` | Sans legible (*Inter*, *Source Sans 3* o pila del sistema `system-ui, …`) |
| Escala (rem, fluida con `clamp`) | `--fs-xs .8125` · `--fs-sm .875` · `--fs-base 1` · `--fs-lg 1.25` · `--fs-xl clamp(1.5, 1.2+1.2vw, 2)` · `--fs-display clamp(2.75, 1.5+6vw, 6.5)` |
| Interlineado | cuerpo 1.55; display 0.95 |
| Ancho de lectura | `--measure: 65ch` (máx.), descripciones de hero ≤ 40ch |

La tipografía display solo se usa en nombres y titulares cortos; nunca en descripciones, filtros ni características. Todo en `rem` para respetar el tamaño de texto del usuario.

### 4.3 Espaciado, superficies y controles

| Token | Valor |
|---|---|
| Escala de espaciado | `--space-1 .25rem` · `-2 .5` · `-3 .75` · `-4 1` · `-6 1.5` · `-8 2` · `-12 3` · `-16 4` |
| Márgenes laterales de página | `clamp(1rem, 4vw, 3rem)` |
| Ancho máximo de contenido | `--content-max: 80rem` |
| Radio | `--radius-sm .375rem` · `--radius-md .75rem` · `--radius-pill 999px` |
| Sombras | una sola sombra suave para la lata (`drop-shadow`), ninguna en tarjetas salvo hover |
| Tamaño mínimo de objetivo | `--target-min: 2.75rem` (44 px) en controles principales; nunca < 24 × 24 px (2.5.8) |
| Foco | `outline: 3px solid var(--color-focus); outline-offset: 3px;` con `:focus-visible` |

### 4.4 Movimiento

| Token | Valor |
|---|---|
| `--dur-fast` | 180 ms (cambios de texto, estados de controles) |
| `--dur-base` | 260 ms (imagen) |
| `--dur-slow` | 320 ms (ambiente / color) |
| `--ease-out` | `cubic-bezier(.2,.7,.2,1)` |
| `--shift` | 12 px (desplazamiento discreto de entrada de imagen) |
| Reducido | `@media (prefers-reduced-motion: reduce)` → todas las duraciones 0 ms y `--shift: 0` |

---

## 5. Comportamiento adaptable

### 5.1 Puntos de corte orientativos (por contenido, no por dispositivo)

| Rango | Comportamiento |
|---|---|
| < 40 rem (≈ 640 px) | Una columna; hero vertical; selector desplazable; catálogo 1–2 col según ancho; filtros apilados |
| 40–64 rem | Hero aún vertical o 2 zonas si la lata cabe ≥ 18 rem; filtros en una fila |
| ≥ 64 rem (≈ 1024 px) | Hero en dos zonas asimétricas (5/7); detalle lado a lado; catálogo 3–4 col |

### 5.2 Pantalla baja (p. ej. 1280 × 600, móvil horizontal)

- Hero sin `min-height` basada en `vh` cuando `max-height: 34rem` → la composición se acorta y la lata reduce a `max-height: 60svh`.
- Nada se recorta: sin `overflow: hidden` en contenedores de texto.

### 5.3 Ampliación de texto y zoom 200 %

- Todas las medidas tipográficas y de espaciado en `rem`; contenedores sin alturas fijas.
- A 200 % en 1280 px el diseño se comporta como el de ~640 px (una columna) sin desplazamiento horizontal del documento (1.4.10 Reflow a 320 CSS px).
- Selector: su fila es la única zona con desplazamiento horizontal, permitida por ser un componente de lista.
- Espaciado de texto (1.4.12): ningún contenedor con altura fija que corte texto al aumentar interlineado.

### 5.4 Teclado

Orden de tabulación en P01/P02: Saltar al contenido → Cabecera (Explorar) → Ver ficha → Explorar bebidas → opciones del selector → Marca → Sabor → Restablecer (si visible) → tarjetas (un enlace por tarjeta).

| Acción | Tecla | Resultado |
|---|---|---|
| Seleccionar bebida | Enter / Espacio en opción | F01 sin mover foco |
| Abrir ficha | Enter en “Ver ficha” o enlace de tarjeta | P03, foco en `h1` |
| Volver | Enter en “Volver” o Alt+← | P02/P01 con filtros, posición y foco restaurados |
| Cambiar filtro | Flechas/Enter en `select` | Resultados actualizados, foco permanece |

No hay trampas de foco (no hay modales).

---

## 6. Estados

| Estado | Dónde | Mensaje propuesto | Recuperación |
|---|---|---|---|
| **Selección activa** | P01 selector | (visual + `aria-pressed`) | — |
| **Catálogo vacío** (no hay bebidas) | P01 y P02 | “Todavía no hay bebidas en el escaparate.” | Sin filtros ni selector; enlace a la nota sobre el proyecto. Distinto de “sin resultados”. |
| **Filtros sin resultados** | P02 | “Ninguna bebida coincide con Marca X y Sabor Y.” | Botón “Restablecer filtros” (y, si procede, “Quitar filtro de sabor”). |
| **Id inexistente** | P03 | “No encontramos esta bebida.” | “Ver todas las bebidas” → P02 sin filtros; título de documento “Bebida no encontrada — Energy Showcase”. |
| **Imagen no disponible / fallida** | P01, P02, P03 | Placeholder §3.9 “Imagen no disponible” | Conserva nombre, geometría y acciones. |
| **Contenido provisional** | Todas | Insignia “Contenido de demostración” | Informativo; banda global en cabecera mientras exista cualquier dato de demostración. |
| **Dato no verificado / pendiente** | P03 | “Información no verificada” / “Información pendiente” | Informativo; nunca cifra ni 0. |
| **Carga** | — | **No se especifica**: el catálogo local es síncrono. Solo se añadirá si el contrato introduce una operación asíncrona real. | — |

---

## 7. Movimiento e interacción de F01

### 7.1 Secuencia al seleccionar (movimiento normal)

1. `selectedId` cambia **inmediatamente** (fuente única de verdad).
2. Texto (marca, nombre, sabor, descripción): fundido de salida/entrada de 180 ms.
3. Imagen: fundido + desplazamiento de 12 px, 260 ms.
4. Ambiente (`--accent`): transición de color y opacidad de 320 ms.
5. Controles **nunca** se deshabilitan durante la transición.

### 7.2 Interrupción

- Una nueva selección cancela las animaciones en curso (p. ej. `Animation.cancel()` o reinicio de clase) y renderiza directamente el estado de la última bebida. No se encolan transiciones.
- Garantía: en cualquier fotograma visible, imagen, alt, textos y color corresponden a la misma bebida o están en transición hacia la última elegida; nunca se muestra el nombre de una con la imagen de otra como estado final.
- Respuestas de carga de imagen fuera de orden: se ignoran si su id ya no es `selectedId`.

### 7.3 Movimiento reducido

- Cambios instantáneos de texto, imagen y color. Toda la información y funciones disponibles. Scroll al explorador con `behavior: 'auto'`.

### 7.4 Anuncios

- Al seleccionar: una región `aria-live="polite"` anuncia solo “«Nombre» seleccionada” (no la descripción entera). El botón ya comunica `aria-pressed`.
- Al filtrar: `role="status"` con el contador (§3.5).

### 7.5 Prohibido

Introducción obligatoria, autoplay/carrusel automático, scroll secuestrado, parallax ligado al scroll, partículas continuas, efectos que tapen contenido.

---

## 8. Especificación de accesibilidad (objetivo WCAG 2.2 AA)

> Objetivo de diseño, **no** declaración de conformidad. La conformidad solo podrá afirmarse tras evaluación en la etapa 4.

| Área | Requisito de diseño | Criterios relacionados |
|---|---|---|
| Estructura | `header`, `main`, `footer`; un `h1` por vista; jerarquía h2/h3 coherente; `lang="es"` | 1.3.1, 2.4.6, 3.1.1 |
| Títulos de página | Distintos por vista (inicio, ficha, no encontrada) | 2.4.2 |
| Imágenes | Lata: `alt` descriptivo de E01 (“Lata de «Nombre» de «Marca»”); miniaturas del selector y decoración: `alt=""` / `aria-hidden` | 1.1.1 |
| Contraste | Texto ≥ 4.5:1; texto grande ≥ 3:1; bordes de controles y foco ≥ 3:1; regla de acento §4.1 | 1.4.3, 1.4.11 |
| Uso del color | Activo, filtros, estados y verificación con texto o forma, no solo color | 1.4.1 |
| Reflow / texto | §5.3 | 1.4.4, 1.4.10, 1.4.12 |
| Teclado | §5.4; todo operable; sin trampas | 2.1.1, 2.1.2 |
| Foco | Visible, ≥ 3 px, no oculto por elementos fijos; orden lógico | 2.4.7, 2.4.11, 2.4.3 |
| Objetivos | ≥ 44 px recomendados, ≥ 24 px mínimo | 2.5.8 |
| Nombres | Enlaces de tarjeta con nombre único; selects con `label` | 2.4.4, 4.1.2, 3.3.2 |
| Cambios de contexto | Cambiar filtro o selección no cambia de vista ni mueve foco | 3.2.2 |
| Mensajes de estado | `role="status"` para resultados; live region para selección | 4.1.3 |
| Movimiento | Sin animación > 5 s; variante reducida completa | 2.2.2, 2.3.3 (AAA, aplicado como buena práctica) |

---

## 9. Modelo de datos provisional (solo para diseño)

E01 conceptual usado por la interfaz. **No es el contrato técnico**; los nombres y la forma los concreta el Arquitecto Backend de Prompts (PD-05).

| Concepto E01 | Uso en interfaz | Notas de diseño |
|---|---|---|
| id | URL de P03, clave de selección, id de foco | Estable, URL-safe |
| nombre | Hero, tarjeta, ficha, alt | — |
| marca | Hero, tarjeta, filtro | — |
| perfil de sabor | Etiquetas, filtro, motivo de ambiente | Cardinalidad pendiente (PD-06): el diseño admite 1–3 etiquetas |
| descripción | Hero (recortada a ~200 car.), ficha completa | Marca de provisional |
| imagen + texto alternativo | Lata | Placeholder si falta |
| color principal | `--accent` | Aplicar regla de contraste |
| volumen, cafeína, azúcar | Ficha | Valor + unidad + base por campo |
| fuente | Ficha | Preferiblemente por campo |
| estado de verificación | Ficha / insignias | **Por campo** recomendado (PD-07); un estado global no valida cifras individuales |

Contenido de demostración (para la etapa 2): bebidas **ficticias** (“Demo Cítrica”, marca “Marca Demo A”…), sin marcas reales, sin cifras nutricionales (campos en “pendiente” o “no verificado”), imágenes placeholder.

---

## 10. Inventario de recursos y contenido pendiente

| ID | Pendiente | Responsable | Placeholder mientras tanto |
|---|---|---|---|
| PD-01 | Selección de marcas y bebidas | Usuario / responsable de contenido | Bebidas ficticias “Contenido de demostración” |
| PD-02 | Imágenes de latas (recortadas, fondo transparente, ≥ 1200 px de alto para hero, versión miniatura) y **autorización de uso** documentada por imagen | Usuario / responsable de contenido | Silueta de lata en trazo (§3.9) |
| PD-03 | Fuentes y valores verificados de volumen, cafeína y azúcar | Responsable de contenido | “Información pendiente” |
| PD-04 | Stack técnico (no existe en el repositorio) | Etapa 2, con propuesta mínima explícita | — |
| PD-05 | Forma técnica del contrato E01 y operaciones | Arquitecto Backend de Prompts | Capa de datos provisional aislada |
| PD-06 | Vocabulario y cardinalidad de perfiles de sabor | Arquitecto Backend + contenido | Vocabulario provisional: cítrico, frutos rojos, tropical, original, sin azúcar(*) |
| PD-07 | Base de medida (por envase / por 100 ml), unidades, representación de ausencia, verificación y procedencia por campo | Arquitecto Backend | Ninguna cifra mostrada |
| PD-08 | Motivos gráficos por sabor (si representan ingredientes, necesitan respaldo) | Diseño + contenido | Motivos abstractos |
| PD-09 | Tipografías definitivas y licencia | Diseño / usuario | Pila del sistema + candidata libre |
| PD-10 | Nombre definitivo del sitio | Usuario | “Energy Showcase” |
| PD-11 | Texto de la nota de independencia / aviso legal | Usuario | Texto propuesto en §3.1 |

(*) “sin azúcar” es una característica, no un sabor; se señala para que PD-06 decida si se admite en el vocabulario de sabor o se excluye.

Recursos que **no** se deben usar sin autorización: logotipos de marcas, fotografías oficiales de producto, tipografías corporativas, textos de marketing de los fabricantes.

---

## 11. Registro de propuestas (para aprobación)

| ID | Propuesta | Alternativa | Impacto si se rechaza |
|---|---|---|---|
| PR-01 | Concepto “Cada lata, un universo de sabor”, fondo carbón, texto marfil | Tema claro | Revisar tokens §4.1 y contraste |
| PR-02 | Composición asimétrica 5/7 en escritorio, lata ~50 % | Centrada | Solo maquetación de P01 |
| PR-03 | P02 como sección de la misma página | Vista separada | Navegación y restauración de posición más simples/complejas |
| PR-04 | P03 como vista dedicada direccionable por id; sin modal | Modal | Requeriría gestión de foco, cierre y Atrás |
| PR-05 | Filtros reflejados en la URL | Estado en memoria | Se pierde al recargar; Atrás depende de la app |
| PR-06 | Imagen recortada + capas ligeras; sin 3D en el MVP | 3D real (mejora posterior) | Ver nota de 3D abajo |
| PR-07 | Selector bajo el hero (móvil: posible bajo la lata) | Selector lateral vertical en escritorio | Maquetación P01 |
| PR-08 | Selector como botones `aria-pressed` | `radiogroup` con flechas | Modelo de teclado |
| PR-09 | Filtros: un valor por criterio, Y entre criterios, “Todas/Todos” | Multi-selección | Contrato de filtrado (PD-05) |
| PR-10 | Transiciones 180/260/320 ms, interrumpibles | Sin animación | Ninguno funcional |
| PR-11 | Verificación por campo; cifras solo con unidad + base + fuente | Estado global | Riesgo de mostrar cifras no respaldadas |
| PR-12 | `h1` fijo de propósito; nombre de bebida como `h2` display | Nombre como `h1` | Anuncio y estructura cambiantes |

**Nota sobre 3D (opcional, fuera del MVP):** un modelo 3D (p. ej. WebGL) implicaría un recurso 3D autorizado por bebida, una dependencia de varios cientos de KB, coste de GPU en móviles modestos y una alternativa estática obligatoria para movimiento reducido y fallos de WebGL. La imagen recortada con halo y sombra ofrece la misma lectura de producto con coste mínimo. No se añade al MVP.

---

## 12. Trazabilidad con criterios de aceptación

| Criterio (Prompt 1) | Dónde se cubre |
|---|---|
| La lata domina sin ocultar información | §2.1 (≈ 50 %, sin superposición con controles), §3.8 |
| Propósito y acciones claros en la primera pantalla | §2.1 `h1` + “Ver ficha” / “Explorar bebidas”; objetivo 360 × 640 |
| Catálogo y detalle fáciles de localizar | Enlace “Explorar” en cabecera, acción en hero, “Ver ficha” en cada tarjeta |
| Móvil conserva calidad visual | §2.1 móvil, §5 |
| Ningún flujo exige animaciones | §7.3, §7.5 |
| Cada estado tiene recuperación comprensible | §6 |
| Requisitos, opcionales y pendientes separados | §0, §10, §11 |
| Sin declaración de aprobación ni conformidad WCAG | Encabezado de estado, nota §8 |

Cambios relevantes respecto al brief: ninguno de alcance. Se **concretan** (sin alterar IDs, versión ni permisos): `h1` fijo (PR-12), filtros en URL (PR-05) y verificación por campo (PR-11), esta última alineada con lo que el brief ya exige para la etapa 3.

---

## 13. Entrada para la etapa 2 (Frontend)

- No hay stack: la etapa 2 debe proponer una elección mínima explícita antes de implementar (p. ej. HTML + CSS + JavaScript sin framework, o con Vite si se necesita empaquetado). Decisión pendiente PD-04.
- Implementar con datos ficticios aislados en una capa de acceso sustituible marcada como **contrato provisional**.
- Validar en prototipo: posición del selector en móvil (PR-07), columnas reales del catálogo en 320–360 px y contraste de los acentos de demostración con la regla §4.1.
