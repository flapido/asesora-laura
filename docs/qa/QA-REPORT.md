# QA Report — asesora-laura (cierre de entrega)

**Proyecto:** asesora-laura — landing estática de Laura Frin (Plan Médico Hospital Alemán)
**Fecha:** 16 de agosto de 2026
**Alcance de esta entrega:** foto principal de Laura (nueva `assets/laura.jpg`, encuadre correcto) + nombre mostrado "Laura Frin" (sin "María Laura").
**Estado general de QA: PASS**

---

## Veredicto

| Área | Estado |
|---|---|
| QA funcional/automático (DOM + interacción real) | **PASS** — 48/48 (desktop 1440×900, tablet 1024×768, mobile 390×844) |
| QA visual objetivo (píxeles y geometría) | **PASS** — 24/24 + 15/15 capturas con contenido, ninguna en blanco |
| Revisión visual subjetiva | Delegada al propietario (release gate); el propietario autorizó la publicación con conocimiento del estado |
| Overflow horizontal | Sin overflow en 320 / 390 / 768 / 1440 |
| Secretos / datos privados | Sin hallazgos (scan de patrones de claves/secretos) |

## Evidencia

- `docs/qa/NOMBRE-LAURA-QA-REPORT.md` — 16 checks por viewport (16×3) y 8 visuales objetivos por viewport (8×3), todos PASS.
- `docs/qa/FOTO-LAURA-REEMPLAZO-QA-REPORT.md` — reemplazo de foto: carga, proporción 4:5, rostro 100% visible, sin overflow.
- Capturas: `docs/qa/screenshots/` (`hero-desktop-1440x900.png`, `hero-mobile-390x844.png`, `nombre-hero-desktop-1440x900.png`, `nombre-hero-mobile-390x844.png`, etc.).
- Mediciones: `docs/qa/visual-measurements.json`, `nombre-laura-results.json`, `nombre-laura-visual-results.json`, `nombre-laura-pixels-results.json`.
- Scripts reproducibles: `docs/qa/qa-nombre-laura.mjs`, `qa-nombre-laura-visual.mjs`, `qa-nombre-laura-pixels.mjs`.

## Diff (intencional y revisado)

- `index.html` — foto del hero → `assets/laura.jpg`; `object-position: 50% 26%`; nombre "Laura Frin" en `.name`, `img.alt`, `.photo-card b` y `.legal`; cap de ancho del logo HA (header/footer) para evitar overflow.
- `laura-original.jpg` — eliminado (corrupto, superado).
- `assets/laura.jpg` — nuevo (1122×1402, JPEG optimizado 247 KB).
- `docs/` — informes previo/QA, capturas y scripts de evidencia.

## Rollback y monitoreo

- Sitio estático sin deploy ni runtime: **rollback** = `git revert` del commit (historial previo disponible). **Monitoreo** = no aplica (no hay servicio en ejecución).

## Puerta de publicación

- Autorización del propietario: `Informe aprobado. Autorizo el desarrollo.` + `Autorizo commit y push.`
- No se realiza deploy (sin autorización de `Autorizo el deploy.`).
