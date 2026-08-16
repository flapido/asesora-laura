# QA Report - Reemplazo de nombre "María Laura Frin" -> "Laura Frin"

**Proyecto:** asesora-laura (landing estática de Laura Frin - Plan Médico Hospital Alemán)
**Fecha:** 16 de agosto de 2026
**Verifier:** QA independiente (no se modificó código de producción; solo evidencia en `docs/qa/`)
**Alcance:** nombre correcto en página renderizada (desktop 1440x900 y mobile 390x844; tablet 1024x768 adicional), sin "María Laura", sin overflow horizontal, carga correcta.
**Ambiente:** Chromium (Playwright) + servidor HTTP local en `127.0.0.1:8123`. No se hizo commit/push/deploy.

---

## 1. Cómo reproducir

```powershell
cd C:\Dev\Projects\asesora-laura
node docs/qa/qa-nombre-laura.mjs          # checks DOM/funcionales + capturas hero/página (puerto 8123)
node docs/qa/qa-nombre-laura-visual.mjs   # checks visuales por píxeles y geometría (puerto 8124)
node docs/qa/qa-nombre-laura-pixels.mjs   # detección de capturas en blanco
```

Resultados crudos: `docs/qa/nombre-laura-results.json`, `docs/qa/nombre-laura-visual-results.json`, `docs/qa/nombre-laura-pixels-results.json`.

**Nota de entorno:** el directorio temporal previsto (`%TEMP%\opencode\qa-visual`) quedó inaccesible
por permisos del entorno; los scripts de QA se guardaron en `docs/qa/` (evidencia reproducible, no
código de producción). El script usa el módulo playwright del entorno por ruta absoluta
(configurable con la variable `PW_MODULE`).

---

## 2. Valores obtenidos (idénticos en los 3 viewports)

| Elemento | Valor obtenido | Esperado | Resultado |
|---|---|---|---|
| `document.title` | `Laura Frin \| Plan Médico Hospital Alemán` | igual | PASS |
| `meta[name=description]` | `Asesoramiento personalizado de Laura Frin para conocer opciones del Plan Médico Hospital Alemán.` | contiene "Laura Frin", sin "María Laura" | PASS |
| `.name` (hero) | `Laura Frin` | `Laura Frin` | PASS |
| `.photo-card b` | `Laura Frin` | `Laura Frin` | PASS |
| `.legal` (footer) | `Página de presentación de Laura Frin. Para información institucional y condiciones vigentes, consultá los canales oficiales del Hospital Alemán.` | contiene "Laura Frin", sin "María Laura" | PASS |
| `img.hero alt` | `Laura Frin` | `Laura Frin` | PASS (informativo) |
| `body innerText` | sin `María Laura` | sin `María Laura` | PASS |
| HTML fuente completo | sin `María Laura` | sin `María Laura` | PASS |
| Imagen hero | `assets/laura.jpg`, naturalWidth=1122, completa | cargada | PASS |
| Overflow horizontal | `scrollWidth == clientWidth` (1440=1440, 1024=1024, 390=390) | sin overflow | PASS |

---

## 3. Checks automáticos/funcionales por viewport (Playwright, interacción real)

| # | Check | desktop 1440x900 | tablet 1024x768 | mobile 390x844 |
|---|---|---|---|---|
| 1 | Carga de página (HTTP 200 + navegación, networkidle) | PASS | PASS | PASS |
| 2 | `document.title` correcto | PASS | PASS | PASS |
| 3 | `meta description` contiene "Laura Frin" | PASS | PASS | PASS |
| 4 | `meta description` NO contiene "María Laura" | PASS | PASS | PASS |
| 5 | `.name` === "Laura Frin" | PASS | PASS | PASS |
| 6 | `.photo-card b` === "Laura Frin" | PASS | PASS | PASS |
| 7 | `.legal` contiene "Laura Frin" | PASS | PASS | PASS |
| 8 | `.legal` NO contiene "María Laura" | PASS | PASS | PASS |
| 9 | body innerText NO contiene "María Laura" | PASS | PASS | PASS |
| 10 | HTML fuente NO contiene "María Laura" | PASS | PASS | PASS |
| 11 | Sin overflow horizontal (scrollWidth <= clientWidth) | PASS | PASS | PASS |
| 12 | Imagen hero cargada (naturalWidth > 0) | PASS | PASS | PASS |
| 13 | Sin errores de consola | PASS | PASS | PASS |
| 14 | Sin page errors (JS) | PASS | PASS | PASS |
| 15 | Sin requests fallidas | PASS | PASS | PASS |
| 16 | Sin respuestas HTTP >= 400 | PASS | PASS | PASS |

**Total: 16/16 por viewport — 48/48 PASS.**

---

## 4. Checks visuales objetivos (píxeles + geometría, sin inspección humana)

El modelo verifier no puede ver imágenes; la verificación visual se hizo de forma objetiva:
decodificado de PNG (zlib nativo), medición de tinta en las regiones de los elementos, geometría
de cajas y detección de capturas en blanco.

| Check | desktop 1440x900 | tablet 1024x768 | mobile 390x844 |
|---|---|---|---|
| `.name` visible y sin recorte horizontal | PASS | PASS | PASS |
| `.photo-card b` visible y sin recorte | PASS | PASS | PASS |
| `.legal` sin recorte vertical | PASS | PASS | PASS |
| `.photo-card` dentro del viewport | PASS | PASS | PASS |
| Sin solapamiento entre bloques del hero-copy | PASS | PASS | PASS |
| Píxeles: texto renderizado en `.name` (tinta clara sobre fondo oscuro) | PASS | PASS | PASS |
| Píxeles: texto renderizado en `.photo-card b` (tinta oscura sobre tarjeta) | PASS | PASS | PASS |
| Píxeles: texto renderizado en `.legal` (tinta gris sobre blanco) | PASS | PASS | PASS |

**Total: 8/8 por viewport — 24/24 PASS.**

Capturas analizadas: **15/15 con contenido real, ninguna en blanco** (desviación de luminancia
36-86; hero con 19.6-23.5% de píxeles de color = gradiente + foto renderizados).

---

## 5. Capturas generadas

Directorio: `docs/qa/screenshots/`

| Archivo | Contenido |
|---|---|
| `nombre-hero-desktop-1440x900.png` | Hero desktop (1440x900) |
| `nombre-desktop-1440x900.png` | Página completa desktop |
| `nombre-hero-tablet-1024x768.png` | Hero tablet |
| `nombre-tablet-1024x768.png` | Página completa tablet |
| `nombre-hero-mobile-390x844.png` | Hero mobile |
| `nombre-mobile-390x844.png` | Página completa mobile |
| `nombre-elem-name-{desktop,tablet,mobile}.png` | Solo `.name` |
| `nombre-elem-photocard-{desktop,tablet,mobile}.png` | Solo `.photo-card b` |
| `nombre-elem-legal-{desktop,tablet,mobile}.png` | Solo `.legal` |

---

## 6. Veredicto final

| Área | Estado |
|---|---|
| Pruebas automáticas (DOM + funcionales) | **PASS** (48/48) |
| Pruebas visuales objetivas (píxeles/geometría) | **PASS** (24/24 + 15/15 capturas con contenido) |
| Revisión visual subjetiva humana | **PENDING VISUAL QA** — ver `docs/qa/CURSOR-VISUAL-QA-PROMPT.md` (el verifier no puede inspeccionar imágenes; capturas listas para revisión humana) |

**Veredicto por viewport: PASS** en desktop 1440x900, tablet 1024x768 y mobile 390x844
para el alcance del objetivo (nombre correcto en `.name`, `.photo-card b`, `.legal`,
`<title>`, `meta description`; ausencia de "María Laura"; sin overflow horizontal; carga correcta).

**Veredicto general: PASS** para el alcance solicitado. Sin fallas detectadas; no se requirió
corrección. Se recomienda la revisión humana de las capturas (ítem pendiente subjetivo) antes
del cierre estético final.

## 7. Hallazgos / incidencias

- **Ninguna falla** en los checks del alcance.
- Nota: `favicon.ico` no existe en el sitio; el harness de test responde 204 para no generar
  un 404 espurio (no es un defecto de la página).
