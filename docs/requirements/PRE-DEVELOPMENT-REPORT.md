# Informe previo — Asesora Laura (asesora-laura)

**Estado:** AWAITING OWNER APPROVAL
**Fecha:** 16 de agosto de 2026
**Fuente:** repositorio `C:\Dev\Projects\asesora-laura` (clon de https://github.com/flapido/asesora-laura). No existe `docs/inbox/` en este proyecto; las fuentes leídas son los archivos del propio repo: `index.html`, `laura-original.jpg`, `assets/laura-01.txt`.
**Proyecto:** existente — landing page estática de presentación de María Laura Frin (Plan Médico Hospital Alemán)
**Ubicación:** `C:\Dev\Projects\asesora-laura`

---

## 1. Resumen ejecutivo

Asesora Laura es una **landing page estática, autocontenida y ya funcional** que presenta a María Laura Frin como "Ejecutiva de Cuentas" del Plan Médico del Hospital Alemán y convierte visitas en contactos de WhatsApp. Está construida y commiteada en `main`, sin dependencias de build y sin backend.

Por tratarse de un proyecto existente y operativo, la **V1 propuesta no amplía el negocio**: es estabilización y puesta en producción — curar la imagen principal (truncada), eliminar el artefacto huérfano `assets/laura-01.txt`, completar metadatos sociales, consolidar el número de contacto, definir el deploy y ejecutar QA visual.

**Bloqueantes principales antes del desarrollo:** confirmar hosting/deploy objetivo (decisión pendiente A1) y disponibilidad de una foto íntegra de producción (B1). El resto son tareas técnicas de bajo riesgo.

---

## 2. Análisis del estado actual

### 2.1 Estructura y funcionamiento (hechos)

| Ítem | Detalle |
|---|---|
| `index.html` | 11.896 B — HTML5, CSS inline (`<style>`), JS inline mínimo (IntersectionObserver para reveal). Sin librerías externas. |
| `laura-original.jpg` | 7.500 B — JPEG 400×400, archivo truncado (decodificador reporta "premature end of data segment"); se usa como foto principal del hero. |
| `assets/laura-01.txt` | 13.417 B — base64 de una imagen WebP (firma RIFF/WEBP verificada), **incompleta** (13417 chars, `mod 4 = 1`, cortada a mitad de grupo; el commit dice "part 1" y no existe parte 2). No referenciada por el HTML. |
| `docs/inbox/` | No existe. |
| Build / tooling | Ninguno (sin package.json, README, .gitignore, CI, tests). |
| Recursos externos | Logo Hospital Alemán en `ha.cdn.marketica.com/.../logo_plan_medico_h.png` (2 usos) — HTTP 200 verificado. WhatsApp `wa.me/541128052016` — HTTP 200 verificado. |

### 2.2 Estado Git (hechos)

- Rama única `main`, sincronizada con origin (`https://github.com/flapido/asesora-laura.git`), working tree limpio.
- 5 commits del 16/08/2026, autor `flapido <lapidofederico@gmail.com>`:
  - `903a8e4` Add Laura landing page
  - `4dcbc7a` Publish working Laura landing page (adelgazó el HTML: −65/+21 líneas)
  - `7cdd13c` Add Laura original photo
  - `b5d2866` Use Laura original photo (el HTML pasa a usar `laura-original.jpg`)
  - `de596b7` Add Laura image data part 1 (agrega `assets/laura-01.txt`, sin uso)
- Sin tags, sin ramas extra, sin `gh-pages`, sin sitio configurado en GitHub ("No description, website, or topics provided").

### 2.3 Registro en Company Workspace (hecho)

`C:\Dev\Company-Workspace\projects.index.json` **no incluye** `asesora-laura`. El proyecto no está registrado como administrado.

### 2.4 Objetivo del sitio (inferencia fundamentada)

Presentar a Laura, posicionar su rol de asesora del Plan Médico y convertir visitas en chats de WhatsApp. El contenido refuerza cercanía ("Te ayudo...") y omite deliberadamente planes, precios y detalles clínicos (prudencia legal), redirigiendo toda conversión al WhatsApp.

---

## 3. Contenido del sitio (hechos)

| Sección | Contenido |
|---|---|
| Header | Logo HA, menú (Beneficios, Cobertura, Cómo te ayudo, Preguntas), botón "Escribirme por WhatsApp" |
| Hero | eyebrow "Laura Frin · Ejecutiva de Cuentas", h1 "Te ayudo a elegir tu Plan Médico", nombre, rol, CTA WhatsApp + "Ver cobertura", foto de Laura con tarjeta de identificación |
| Beneficios | 4 cards: Atención personalizada, Contacto rápido, Información clara, Acompañamiento |
| Cobertura | 6 centros CABA + 6 centros Zona Norte; CTA "Consultame por Planes y Coberturas" |
| Proceso | 3 pasos: Me escribís → Revisamos opciones → Te acompaño |
| FAQ | 3 preguntas (contacto, cobertura, dónde atiende) |
| CTA final | "Hablemos por WhatsApp" |
| Footer | Logo HA + disclaimer: información institucional/condiciones vigentes en canales oficiales del Hospital Alemán |
| Datos de contacto | WhatsApp +54 11 2805-2016 (hardcodeado 4 veces); sedes: Casa Central Av. Pueyrredón 1640 PB (CABA) y Agencia Caballito Av. Rivadavia 5318 |

---

## 4. Propuesta V1

Naturaleza: **proyecto existente y funcional** → V1 = estabilización y puesta en producción, sin ampliar el negocio.

### Incluido en V1 (propuesto)

1. Curar la imagen principal (usar versión íntegra; convertir a WebP optimizado si corresponde).
2. Resolver `assets/laura-01.txt` (eliminar por incompleto/huérfano, o completar con la parte 2 si existe).
3. Metadatos sociales: Open Graph, Twitter Card, favicon, canonical (title/description ya existen).
4. Consolidar el número de WhatsApp en una única constante/atributo en lugar de 4 hardcodes.
5. Definir e implementar deploy (hosting a confirmar) y verificarlo en HTTPS.
6. Localizar o agregar fallback del logo del CDN para no perder la marca si cae el CDN.
7. QA funcional + visual responsive (según flujo Company Workspace: verifier + capturas).
8. Registrar el proyecto en el índice de Company Workspace (`managed=true`) y operar con el flujo estándar.

### Excluido de V1 (salvo pedido explícito)

- Backend, CMS, formularios, reservas, e-commerce, multi-idioma, cuenta de usuario.
- Cambiar textos de negocio, precios, planes o ampliar la lista de cobertura sin material oficial aprobado.
- Rediseño de marca o cambio estético sin revisión del propietario.
- Analítica de terceros (opcional, decisión D2).

---

## 5. Usuarios y roles

- **Visitantes / clientes potenciales** del Plan Médico → contactan por WhatsApp.
- **María Laura Frin** → propietaria de la presentación; recibe y atiende los contactos.
- **Federico Lapido (flapido)** → mantiene el repo y coordina con Company Workspace.

---

## 6. Flujos

1. Usuario llega al sitio → lee secciones → toca un CTA → se abre WhatsApp con nuevo chat.
2. La conversación continúa en WhatsApp (fuera del sitio).

---

## 7. Pantallas

Una sola página (single-page) con secciones ancladas: `#inicio`, `#beneficios`, `#cobertura`, `#proceso`, `#preguntas`. No hay navegación entre páginas.

---

## 8. Datos

- **Estáticos** en el HTML: nombre, rol, textos, lista de 12 centros, 3 FAQs, 2 sedes, teléfono.
- **Sin backend** ni formularios: el sitio no recolecta datos personales.
- **Contacto externo**: WhatsApp (número visible en el HTML).

---

## 9. Identidad visual (hechos del CSS)

- Paleta: `--dark #30313c`, `--red #d71920`, neutros `#f4f4f5`, texto `#17181d`.
- Tipografía: Arial/Helvetica; h1 peso 300 con acento `strong` 800; letter-spacing negativo.
- Brand: logo oficial del Hospital Alemán (CDN Marketica), acento rojo institucional, foto real de Laura en hero, animación reveal por scroll (IntersectionObserver).
- Responsive: breakpoints 950px y 560px (hero 2→1 col; cards 4→2→1).

---

## 10. Requisitos propuestos V1 (aceptación verificable)

| ID | Requisito |
|---|---|
| RF-01 | Open Graph y Twitter Card presentes con imagen y descripción correctas. |
| RF-02 | favicon y canonical presentes. |
| RF-03 | Foto principal íntegra y optimizada (sin errores de decodificación; peso razonable). |
| RF-04 | Repo limpio: `assets/laura-01.txt` resuelto (eliminado o completado). |
| RF-05 | Número de WhatsApp único y consistente en toda la página. |
| RF-06 | Logo del Hospital con fallback o versión local. |
| RF-07 | Deploy público funcionando en HTTPS en el hosting definido. |
| RF-08 | Sin regresión de contenido: todas las secciones y textos actuales se conservan (salvo cambios autorizados). |
| RNF-01 | Responsive 320–1920px sin desbordes horizontales. |
| RNF-02 | Sin librerías externas; bloques críticos inline (ya es así). |
| RNF-03 | Sin datos privados de clientes ni secretos en el repo. |
| RNF-04 | Accesibilidad básica: navegación por teclado, contraste, `alt` en imágenes. |

---

## 11. Contradicciones

- El commit "Add Laura image data part 1" es un trabajo **inconcluso**: la parte 2 nunca se subió y el archivo no se usa. Es una inconsistencia del repo, no una contradicción de requisitos.
- No existen documentos de requisitos que contradigan la implementación; los únicos requisitos son el propio HTML y el historial git.

---

## 12. Faltantes

- Hosting/deploy definido (no hay GitHub Pages ni otro destino confirmado).
- Foto de producción íntegra y de mejor calidad.
- Metadatos sociales, favicon, sitemap, robots.txt.
- Registro en Company Workspace.
- Analítica de conversión (clics a WhatsApp) — opcional.
- Material oficial de cobertura para validar la lista de centros (riesgo de desactualización).

---

## 13. Riesgos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Imagen principal truncada (JPEG corrupto) → baja calidad visual | Media | Obtener versión íntegra; validar en QA visual |
| Dependencia del CDN de Marketica para el logo | Baja-media | Localizar el logo o usar fallback |
| Lista de cobertura puede desactualizarse sin verificarse contra material oficial | Media | Confirmar fuentes oficiales antes de editar; no ampliar |
| Número de WhatsApp hardcodeado 4 veces → inconsistencia futura | Baja | Consolidar en una constante |
| Sin deploy configurado → el sitio puede no estar accesible públicamente | Media | Definir hosting (decisión A1) |
| Artefacto `laura-01.txt` (13 KB base64 incompleto) en el repo | Baja | Eliminar o completar |

---

## 14. Mejoras sugeridas (opcional, no bloqueante)

- FAQ de cierre con acceso directo a WhatsApp.
- Microdata/schema `Person` y `LocalBusiness` con las dos sedes.
- Fecha de actualización del material de cobertura (transparencia).
- Pre-carga de la imagen del hero (`fetchpriority`) para mejorar LCP.

---

## 15. Etapas propuestas

1. **Preparación y registro** — decisiones del propietario + alta en Company Workspace.
2. **Pulido técnico** — imagen, artefactos, metadatos, constantes, fallback de logo.
3. **Deploy y dominio** — hosting definido, HTTPS verificado.
4. **QA funcional + visual responsive** — verifier con capturas (incluye validación visual de la foto).
5. **Cierre y publicación** — release gate y aprobación final.

---

## 16. Decisiones pendientes / preguntas bloqueantes (agrupadas)

**Grupo A — Deploy (bloqueante duro para "publicar")**
- A1. ¿Dónde se publica el sitio (GitHub Pages, Netlify/Vercel, otro hosting)? ¿Hay dominio propio?

**Grupo B — Imagen (bloquea el pulido visual)**
- B1. ¿Se dispone de la versión íntegra / mejor calidad de la foto de Laura para producción?
- B2. ¿Eliminamos `assets/laura-01.txt` (incompleto) o se aporta la parte 2 / el WebP completo?

**Grupo C — Contenido (alcance)**
- C1. ¿Se autoriza a tocar textos y la lista de cobertura, o se conserva el contenido tal cual?

**Grupo D — Operación**
- D1. ¿Se registra el proyecto en Company Workspace (`managed=true`) y se habilita el flujo con tickets/QA?
- D2. ¿Se desea analítica de clics de WhatsApp?

Nota: los grupos B–D no bloquean el arranque de las tareas técnicas mínimas; **A1 es el único bloqueante duro para publicar**.

---

## 17. Hechos / Inferencias / Recomendaciones

### Hechos (verificados)

1. Repo clonado de GitHub; rama `main`; 5 commits (16/08/2026); working tree limpio; origin = `flapido/asesora-laura`.
2. No existen `docs/inbox/`, README, .gitignore, CI, tags, `gh-pages` ni sitio de GitHub configurado.
3. `index.html` es una landing estática autocontenida; únicos recursos externos: logo del CDN y `wa.me` (ambos HTTP 200).
4. `laura-original.jpg` es JPEG 400×400 truncado ("premature end of data segment").
5. `assets/laura-01.txt` es base64 de WebP incompleto (13.417 chars, `mod 4 = 1`) y no está referenciado por el HTML.
6. El número de WhatsApp está hardcodeado 4 veces; sedes: Pueyrredón 1640 PB (CABA) y Rivadavia 5318 (Caballito).
7. `asesora-laura` no figura en `projects.index.json` de Company Workspace.
8. GitHub: repo público, sin descripción, website ni topics.

### Inferencias

1. El commit "Publish working Laura landing page" sin deploy configurado sugiere publicación en hosting externo no verificado, o publicación aún pendiente.
2. `assets/laura-01.txt` es un intento inconcluso de subir la foto en WebP; no afecta al sitio en producción.
3. El contenido genérico de cobertura indica prudencia legal/operativa; no ampliarlo sin material oficial.
4. `flapido` (Federico Lapido) opera el proyecto para Laura (cliente) → manejar los datos de la cliente con cuidado y no publicar material privado.
5. Toda la arquitectura del sitio apunta a una conversión única: el WhatsApp.

### Recomendaciones

1. Tratar el proyecto como "estabilizar y publicar", no como rediseño.
2. Definir el deploy antes de declarar el sitio "en producción".
3. Curar la imagen principal y limpiar el artefacto base64.
4. Registrar el proyecto en Company Workspace y operar con el flujo estándar.
5. No ampliar contenido comercial sin confirmación del propietario.
6. Conservar los datos de contacto y el disclaimer legal vigente.

---

## 18. Nota de proceso

- Fuentes leídas completas y **sin modificar** (`index.html`, `laura-original.jpg`, `assets/laura-01.txt`).
- **No se desarrolló, no se instalaron dependencias, no se modificó código, no se hizo commit, push ni deploy.**
- Análisis directo sin subagente `product-analyst` por proporcionalidad (proyecto pequeño; equipo mínimo).
- La inspección visual de la foto queda pendiente de QA visual en etapa correspondiente (el modelo actual no interpreta imágenes).
- Archivo de análisis técnico de respaldo: dimensión/formato de imágenes y firma de `laura-01.txt` verificados por inspección de bytes.

---

## Estado: AWAITING OWNER APPROVAL

Se requiere una autorización explícita del propietario equivalente a:

> `Informe aprobado. Autorizo el desarrollo.`
