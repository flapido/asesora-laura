# QA Report — Reemplazo de foto de Laura (hero)

**Proyecto:** asesora-laura (landing estática — María Laura Frin / Plan Médico Hospital Alemán)
**Fecha:** 16 de agosto de 2026
**Estado:** CORRECCIÓN EJECUTADA — SIN commit, SIN push, SIN deploy (pendiente revisión del propietario)

---

## 1. Triage del incidente

| Campo | Valor |
|---|---|
| Tipo | Defecto visual (reemplazo de activo + ajuste puntual de CSS) |
| Severidad | Media — imagen principal corrupta/baja calidad daña la primera impresión; no bloquea funcionalidad |
| Impacto | Hero de la landing; 100% de los visitantes; visual, no funcional |
| Ambiente | Repo local `main`, sin deploy conocido |
| Esperado vs. real | Esperado: foto nítida, proporcionada, bien encuadrada. Real: `laura-original.jpg` (JPEG 400×400 truncado) pixelado |
| Reproducción | Abrir la landing y observar el hero en desktop/mobile |
| Workaround | No urgente; la landing sigue cargando |
| Recomendación | Trabajo acotado directo (aprobado por el propietario en el pedido) |

---

## 2. Cambios realizados

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `assets/laura.jpg` | **Nuevo.** Copia optimizada de la imagen aportada por el propietario (`WhatsApp Image 2026-08-16 at 00.41.31 (1).jpeg`, 1122×1402). Re-encode JPEG progresivo, calidad 82 → **247 KB**, integridad verificada. Nombre limpio dentro de `assets/`. |
| `index.html` | 3 ediciones mínimas (ver abajo). |
| `laura-original.jpg` | **Eliminado** (corrupto, superado por la imagen nueva; ya no se referencia). |
| `docs/qa/` | **Nuevo.** Evidencia: screenshots + mediciones (`visual-measurements.json`). |

### Ediciones en `index.html` (CSS inline)

1. `.hero-photo img` — `object-position: center center` → `object-position: 50% 26%` (mantiene `object-fit: cover`).
2. `.brand img` — agregado `max-width:100%;width:auto;object-fit:contain` + `.brand{min-width:0}` (evita overflow del logo en mobile).
3. `.footer img` — agregado `max-width:100%;width:auto;object-fit:contain` (evita overflow del logo en mobile).
4. `<img src>` del hero: `laura-original.jpg` → `assets/laura.jpg`.

No se modificó el resto del diseño (textos, secciones, colores, CTA, footer, responsive existente).

---

## 3. Método de encuadre

La imagen nueva es 4:5 (0.8003). El contenedor del hero recorta vertical en desktop y lateral en mobile. Se detectó el rostro con OpenCV (Haar cascade, 3 detectores coincidentes): **cara centrada horizontalmente, en el tercio superior** (caja 228–698 × 215–685 en coordenadas de origen). Con `object-position: 50% 26%`:

- **Desktop:** se recorta la parte baja de la foto (no el rostro); cara completa visible.
- **Mobile:** se recorta el sobrante lateral; cara completa visible y centrada.

---

## 4. Resultados de verificación (Playwright / Chromium)

| Check | desktop 1440×900 | mobile 390×844 | tablet 768×1024 | mobile 320×568 |
|---|---|---|---|---|
| Imagen cargada (naturalWidth>0) | PASS | PASS | PASS | PASS |
| Imagen completa (`complete`) | PASS | PASS | PASS | PASS |
| `object-fit: cover` aplicado | PASS | PASS | PASS | PASS |
| Proporción fuente 4:5 intacta | PASS | PASS | PASS | PASS |
| Rostro 100% visible (recorte seguro) | PASS | PASS | PASS | PASS |
| Sin overflow horizontal | PASS | PASS | PASS | PASS |
| Sin errores de consola / requests fallidas | PASS | PASS | PASS | PASS |

Mediciones clave:
- `assets/laura.jpg`: 1122×1402, transferido 247 KB, carga ~3–4 ms (local).
- Desktop: imagen renderizada 564×755 (recorte vertical inferior, cara en tercio superior).
- Mobile 390: imagen renderizada 353×480 (recorte lateral mínimo, cara centrada).

### Nota sobre overflow (hallazgo preexistente)

El overflow de mobile (598px) NO lo causaba la foto: lo provocaba el **logo del Hospital Alemán** (banner ancho del CDN) en header (403px) y footer (583px). Se corrigió de forma mínima capping el ancho (`max-width:100%` + `object-fit:contain`), sin rediseñar. Verificado en 320/390/768/1440.

---

## 5. Evidencia visual

Capturas guardadas en `docs/qa/screenshots/`:

| Archivo | Contenido |
|---|---|
| `hero-desktop-1440x900.png` | Hero desktop (foto principal) |
| `hero-mobile-390x844.png` | Hero mobile |
| `hero-tablet-768x1024.png` | Hero tablet |
| `hero-mobile-320x568.png` | Hero mobile estrecho |
| `full-desktop-1440x900.png` | Página completa desktop |
| `full-mobile-390x844.png` | Página completa mobile |
| `full-tablet-768x1024.png` | Página completa tablet |
| `full-mobile-320x568.png` | Página completa mobile estrecho |

Mediciones JSON: `docs/qa/visual-measurements.json`.

---

## 6. Alcance

- Solo reemplazo/corrección de la foto principal + ajuste mínimo de encuadre + corrección de overflow del logo (criterio "sin overflow").
- No rediseñado: resto de la página intacto.
- Sin commit, push ni deploy.

**Estado: PENDING OWNER REVIEW** — revisar capturas y confirmar. Para publicar, se requiere autorización explícita del propietario.
