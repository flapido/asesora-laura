# Cursor Visual QA Prompt - Reemplazo de nombre "María Laura Frin" -> "Laura Frin"

> Estado: **PENDING VISUAL QA (revisión subjetiva humana)**. Los checks objetivos
> (DOM, geometría, píxeles) están **PASS**; falta solo la inspección visual de las
> capturas por un humano antes de dar el cierre estético.

## Cómo ejecutar

Abrí un chat nuevo en Cursor y pedí `/verify-project` leyendo este archivo.

1. Servidor local (opcional, para re-inspección interactiva):
   `node docs/qa/qa-nombre-laura.mjs` en la raíz del proyecto, luego abrir `http://127.0.0.1:8123/`.
   Alternativa sin servidor: abrir `file:///C:/Dev/Projects/asesora-laura/index.html`.
2. Abrí las capturas listadas abajo en un visor de imágenes.

## Alcance

Landing estática `index.html` (asesora-laura). Cambio verificado: reemplazo de
"María Laura Frin" por "Laura Frin" en 4 lugares (`.name` del hero, `alt` de la
imagen, `.photo-card b`, footer `.legal`); `<title>` y `meta description` ya usaban
"Laura Frin".

## Capturas para revisar (docs/qa/screenshots/)

| Archivo | Qué revisar |
|---|---|
| `nombre-hero-desktop-1440x900.png` | Hero desktop: `.name` "Laura Frin" legible, `.photo-card b` "Laura Frin", foto bien encuadrada |
| `nombre-hero-mobile-390x844.png` | Hero mobile (apilado): texto e imagen sin recortes/desbordes |
| `nombre-hero-tablet-1024x768.png` | Hero tablet (breakpoint 950px) |
| `nombre-desktop-1440x900.png` | Página completa: footer `.legal` con "Laura Frin", sin overflow |
| `nombre-mobile-390x844.png` | Página completa mobile: footer, CTA, tarjetas |
| `nombre-tablet-1024x768.png` | Página completa tablet |
| `nombre-elem-name-*.png` | Solo el `.name` (texto blanco sobre gradiente oscuro) |
| `nombre-elem-photocard-*.png` | Solo `.photo-card b` (texto oscuro sobre tarjeta blanca) |
| `nombre-elem-legal-*.png` | Solo `.legal` del footer (gris #767980) |

## Qué verificar visualmente

1. **Nombre:** en ninguna captura debe aparecer "María Laura"; debe leerse "Laura Frin" en `.name`, `.photo-card b` y `.legal`.
2. **Texto cortado/superpuesto:** títulos, subtítulos, cards, CTA, footer.
3. **Overflow:** sin scroll horizontal en 1440x900, 1024x768 ni 390x844.
4. **Hero:** foto completa, cara visible, sin distorsión ni recorte del rostro.
5. **Contraste/alineación/marca:** logo (remoto), colores, espaciados.

## Resultados automáticos ya obtenidos (no repetir, solo confirmar)

- **DOM/funcional:** 16/16 checks PASS en desktop 1440x900, tablet 1024x768 y mobile 390x844
  (title, meta description, `.name`, `.photo-card b`, `.legal`, body sin "María Laura",
  sin overflow horizontal, imagen hero naturalWidth 1122, sin errores de consola/red).
- **Píxeles/geometría:** 8/8 checks PASS por viewport (texto renderizado con tinta real,
  sin recorte ni solapamiento, `.photo-card` dentro del viewport).
- **Capturas:** 15/15 con contenido real (ninguna en blanco; hero con 20% de píxeles de color).

Ver resultados completos en:
`docs/qa/nombre-laura-results.json`, `docs/qa/nombre-laura-visual-results.json`, `docs/qa/nombre-laura-pixels-results.json`.

## Veredicto esperado

Confirmar **PASS** visual (subjetivo) o reportar defectos puntuales con captura + descripción.
