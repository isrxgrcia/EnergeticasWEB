# Reconciliación de E01 «Bebida» — Etapa 3

| Campo | Valor |
|---|---|
| Contrato | WEB-BRIEF v1 — estado **propuesto** |
| Contrato técnico del Arquitecto Backend de Prompts | **No recibido** |
| Resultado de esta etapa | **Integración definitiva bloqueada** por entradas faltantes. Se entrega la tabla de reconciliación con el modelo provisional, la lista de decisiones necesarias y la propuesta de mapeo. |

No se ha inventado ningún endpoint ni se presenta el modelo provisional como aceptado. Como el catálogo es local, «backend» se refiere aquí a quien define el contrato de datos, no a una infraestructura.

## 1. Tabla de reconciliación

Columnas: concepto del brief → nombre y tipo provisional (`src/data/contract.ts`) → cómo lo usa la UI → nombre y tipo contractual → discrepancia o decisión pendiente.

| Concepto E01 | Provisional | Uso / conversión en UI | Contractual | Discrepancia / decisión |
|---|---|---|---|---|
| id | `id: string` (`[a-z0-9-]+`) | Clave de selección, `?bebida=`, id de foco `tarjeta-<id>` | — | D1: confirmar que es estable y apto para URL |
| nombre | `name: string` | Texto en hero, tarjeta, ficha y alt | — | — |
| marca | `brand: string` | Etiqueta; filtro por `brandSlug(brand)` | — | D2: ¿la marca es texto o entidad con id propio? |
| perfil de sabor | `flavors: FlavorKey[]` (1–3, vocabulario cerrado) | Etiquetas, filtro, motivo de ambiente (1.º sabor) | — | D3: cardinalidad (uno o varios) y vocabulario |
| descripción | `description: string` | Hero y ficha | — | D4: longitud máxima; marca de texto provisional por campo |
| imagen | `image: {src,width,height,kind} \| null` | `img` con dimensiones reservadas; `null` → placeholder | — | D5: formato, tamaños y forma de entregar los recursos |
| texto alternativo | `image.alt` | `alt` de la lata principal | — | Hoy va dentro de `image`; podría ser un campo propio |
| color principal | `color: '#RRGGBB'` | `--accent`; texto solo si contraste ≥ 4.5:1 | — | D6: formato de color |
| volumen | `volume: Measure<'ml'>` | «N ml por envase» si se cumple la regla | — | D7 |
| cafeína | `caffeine: Measure<'mg'\|'g'>` | «N mg por 100 ml / por envase» | — | D7 |
| azúcar | `sugar: Measure<'mg'\|'g'>` | «N g por 100 ml / por envase» | — | D7 |
| fuente | `sources: Source[]` + `Measure.sourceId` | Fuente por cifra y lista «Fuentes» | — | D8: procedencia por campo o por bebida |
| estado de verificación | `Measure.verification` por campo | Cifra solo si está `verified` | — | D9: por campo (propuesto) o global |
| (no está en E01) | `demo: boolean` | Insignia «Contenido de demostración» | — | D10: añadir o derivar el estado «contenido provisional» |

`Measure` = `{ value: number | null; unit; basis: 'per_container' | 'per_100ml' | null; verification: 'verified' | 'unverified' | 'pending'; sourceId }`.

## 2. Operaciones

| Operación | Provisional (`src/data/catalog.ts`) | Entrada | Resultado y estados |
|---|---|---|---|
| Listar | `listDrinks()` | — | `Drink[]` (puede estar vacío) |
| Filtrar | `filterDrinks({brand, flavor})` | slug de marca y clave de sabor, ambos opcionales | Coincidencia en **ambos** (Y); `null` = sin restricción; puede estar vacío |
| Opciones de filtro | `brandOptions()`, `flavorOptions()` | — | Derivadas del catálogo |
| Consultar | `getDrinkById(id)` | id | `Drink` o `null` (bebida inexistente) |

Todas son síncronas. No hay estados de carga ni de error de red porque no hay operaciones asíncronas. El acceso es público y de solo lectura, sin credenciales. Con el tamaño previsto no hace falta paginar.

## 3. Regla de presentación de características (implementada)

`src/domain/features.ts`, cubierta por `tests/unit/features.test.ts`:

1. Sin valor y sin verificar → **«Información pendiente»**.
2. Valor presente pero sin verificar, o verificado al que le falta unidad, base (salvo volumen), fuente existente o un número válido ≥ 0 → **«Información no verificada»**, sin cifra.
3. Solo con todo lo anterior → **«N unidad por base»** + «Fuente: …».
4. La ausencia nunca se convierte en 0, pero un 0 verificado sí se muestra.
5. **Nunca se convierte** entre «por envase» y «por 100 ml» ni se calculan totales.

## 4. Decisiones que debe tomar el Arquitecto Backend de Prompts

| ID | Decisión | Propuesta del frontend |
|---|---|---|
| D1 | Formato del id | slug estable `[a-z0-9-]+`, que no se reutilice |
| D2 | Marca: texto o entidad | entidad `{id, nombre}`; el slug actual sirve como id |
| D3 | Cardinalidad y vocabulario de sabor | lista de 1 a 3 claves de un vocabulario cerrado y versionado |
| D4 | Descripción | texto plano ≤ 400 caracteres y un resumen ≤ 200 para el hero |
| D5 | Imágenes | archivos locales con fondo transparente (WebP o PNG), alto ≥ 1200 px, miniatura y registro de autorización por imagen |
| D6 | Color | `#RRGGBB` |
| D7 | Unidades y base | volumen en ml por envase; cafeína en mg y azúcar en g con base explícita por campo; sin conversiones implícitas |
| D8 | Procedencia | fuente por campo, con etiqueta, URL opcional y fecha de consulta |
| D9 | Verificación | por campo; el estado global no valida cifras |
| D10 | Contenido provisional | indicador por bebida (o por campo de texto) |
| D11 | Ausencia | `value: null` + `verification: 'pending'`; nunca 0 |

## 5. Cambios sustanciales

Ninguno aplicado. Si el contrato definitivo elige verificación global (D9) o permite conversiones de base (D7), cambiaría F03 y habría que proponer una nueva versión del brief para que se apruebe. No se ha incorporado como decisión.

## 6. Cómo integrar cuando llegue el contrato

1. Añadir `src/data/catalog.<fuente>.ts` con los datos autorizados (o un adaptador desde el formato acordado hacia `Drink`).
2. Cambiar `SOURCE` en `src/data/catalog.ts` y retirar `catalog.demo.ts` y `src/assets/demo/`.
3. Ajustar `contract.ts` a los nombres acordados; la UI solo depende de él.
4. Ejecutar `npm run check`. Hay que sustituir las pruebas `catálogo de demostración` por pruebas de integridad del catálogo real: cada cifra verificada tiene fuente, unidad y base.

## 7. Comprobado sin depender del contrato

- F01–F04 con datos incompletos, bebida sin imagen, imagen que falla, id inexistente y filtros sin coincidencias (`tests/e2e`).
- Catálogo vacío: solo a nivel de datos (`tests/unit/catalog.test.ts`). La vista de catálogo vacío está implementada pero **no tiene prueba end-to-end** (ver la revisión).
