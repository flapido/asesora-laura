// QA reproducible - Reemplazo de nombre "María Laura Frin" -> "Laura Frin"
// Proyecto: asesora-laura (landing estatica). NO modifica codigo de produccion.
// Uso: node docs/qa/qa-nombre-laura.mjs   (desde la raiz del proyecto)
// Requiere: playwright instalado (path absoluto configurable via env PW_MODULE)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJ = path.resolve(__dirname, '..', '..'); // C:\Dev\Projects\asesora-laura (backslashes en win32)
const SHOT_DIR = path.join(PROJ, 'docs', 'qa', 'screenshots');
const OUT_JSON = path.join(PROJ, 'docs', 'qa', 'nombre-laura-results.json');

const PW_MODULE = process.env.PW_MODULE ||
  'C:/Users/Usuario/AppData/Local/Temp/opencode/qa-visual/node_modules/playwright';
const { createRequire } = await import('node:module');
const require = createRequire(import.meta.url);
const { chromium } = require(PW_MODULE);

const PORT = 8123;
const BASE = `http://127.0.0.1:${PORT}`;

// ---------- Servidor HTTP local ----------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, BASE).pathname);
    if (urlPath === '/') urlPath = '/index.html';
    // path.join en win32 produce backslashes; PROJ usa backslashes -> startsWith valido
    let filePath = path.join(PROJ, urlPath);
    if (!filePath.startsWith(PROJ)) { res.writeHead(403); res.end('forbidden'); return; }
    if (urlPath === '/favicon.ico') { res.writeHead(204); res.end(); return; } // evitar falso positivo 404
    if (!fs.existsSync(filePath)) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500); res.end('server error');
  }
});

// ---------- Checks ----------
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
];

const TITLE_EXPECTED = 'Laura Frin | Plan Médico Hospital Alemán';

async function runViewport(browser, vp) {
  const results = { viewport: `${vp.width}x${vp.height}`, checks: {}, extra: {}, issues: [] };
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('requestfailed', (r) => failedRequests.push(`${r.url()} :: ${r.failure()?.errorText}`));
  page.on('response', (r) => { if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url()}`); });

  const navResult = { ok: true, error: null };
  try {
    await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    navResult.ok = false;
    navResult.error = String(e);
  }

  // Forzar secciones reveal visibles (para capturas de pagina completa)
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('on')));

  // Esperar imagen del hero (o registrar falla)
  let imgLoaded = false;
  try {
    imgLoaded = await page.waitForFunction(
      () => {
        const img = document.querySelector('.hero-photo img');
        return img && img.complete && img.naturalWidth > 0;
      },
      { timeout: 15000 }
    ).then(() => true);
  } catch { imgLoaded = false; }

  const data = await page.evaluate(() => {
    const $ = (s) => document.querySelector(s);
    const heroImg = $('.hero-photo img');
    const metaDesc = document.querySelector('meta[name="description"]');
    const text = (el) => (el ? el.textContent.trim() : null);
    // diagnostico de overflow: elementos cuyo borde derecho excede el viewport
    const overflowers = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > document.documentElement.clientWidth + 1) {
        overflowers.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && String(el.className)) || '',
          right: Math.round(r.right),
          vw: document.documentElement.clientWidth,
        });
      }
    });
    return {
      title: document.title,
      metaDescription: metaDesc ? metaDesc.content : null,
      nameText: text($('.name')),
      photoCardText: text($('.photo-card b')),
      legalText: text($('.legal')),
      heroImgSrc: heroImg ? heroImg.getAttribute('src') : null,
      heroImgAlt: heroImg ? heroImg.getAttribute('alt') : null,
      heroImgNaturalWidth: heroImg ? heroImg.naturalWidth : 0,
      heroImgComplete: heroImg ? heroImg.complete : false,
      bodyText: document.body ? document.body.innerText : '',
      outerHtml: document.documentElement.outerHTML,
      docScrollWidth: document.documentElement.scrollWidth,
      docClientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body ? document.body.scrollWidth : 0,
      overflowers,
    };
  });

  const t = (c) => (c ? 'PASS' : 'FAIL');

  results.checks['carga de pagina (HTTP 200 + navegacion)'] = t(navResult.ok);
  results.checks['document.title correcto'] = t(data.title === TITLE_EXPECTED);
  results.checks['meta description contiene "Laura Frin"'] = t(data.metaDescription?.includes('Laura Frin') === true);
  results.checks['meta description NO contiene "María Laura"'] = t(data.metaDescription?.includes('María Laura') === false);
  results.checks['.name === "Laura Frin"'] = t(data.nameText === 'Laura Frin');
  results.checks['.photo-card b === "Laura Frin"'] = t(data.photoCardText === 'Laura Frin');
  results.checks['.legal contiene "Laura Frin"'] = t(data.legalText?.includes('Laura Frin') === true);
  results.checks['.legal NO contiene "María Laura"'] = t(data.legalText?.includes('María Laura') === false);
  results.checks['body innerText NO contiene "María Laura"'] = t(data.bodyText.includes('María Laura') === false);
  results.checks['HTML fuente NO contiene "María Laura"'] = t(data.outerHtml.includes('María Laura') === false);
  results.checks['sin overflow horizontal (scrollWidth <= clientWidth)'] = t(data.docScrollWidth <= data.docClientWidth);
  results.checks['imagen hero cargada (naturalWidth > 0)'] = t(imgLoaded && data.heroImgNaturalWidth > 0);
  results.checks['sin errores de consola'] = t(consoleErrors.length === 0);
  results.checks['sin page errors (JS)'] = t(pageErrors.length === 0);
  results.checks['sin requests fallidas'] = t(failedRequests.length === 0);
  results.checks['sin respuestas HTTP >= 400'] = t(badResponses.length === 0);

  results.extra = {
    navError: navResult.error,
    nameText: data.nameText,
    photoCardText: data.photoCardText,
    legalText: data.legalText,
    title: data.title,
    metaDescription: data.metaDescription,
    heroImgSrc: data.heroImgSrc,
    heroImgAlt: data.heroImgAlt,
    heroImgNaturalWidth: data.heroImgNaturalWidth,
    docScrollWidth: data.docScrollWidth,
    docClientWidth: data.docClientWidth,
    overflowers: data.overflowers.slice(0, 10),
    consoleErrors,
    pageErrors,
    failedRequests,
    badResponses,
  };
  if (consoleErrors.length) results.issues.push(...consoleErrors.map((m) => `console.error: ${m}`));
  if (pageErrors.length) results.issues.push(...pageErrors.map((m) => `pageerror: ${m}`));
  if (failedRequests.length) results.issues.push(...failedRequests.map((m) => `requestfailed: ${m}`));
  if (badResponses.length) results.issues.push(...badResponses.map((m) => `http>=400: ${m}`));

  // ---------- Capturas ----------
  const tag = `${vp.name}-${vp.width}x${vp.height}`;
  const heroShot = path.join(SHOT_DIR, `nombre-hero-${tag}.png`);
  const fullShot = path.join(SHOT_DIR, `nombre-${tag}.png`);
  await page.locator('.hero').screenshot({ path: heroShot });
  await page.screenshot({ path: fullShot, fullPage: true });
  results.extra.screenshots = {
    hero: path.relative(PROJ, heroShot),
    full: path.relative(PROJ, fullShot),
  };

  await context.close();
  return results;
}

// ---------- Main ----------
fs.mkdirSync(SHOT_DIR, { recursive: true });
await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
console.log(`[qa] servidor local en ${BASE} (root: ${PROJ})`);

const browser = await chromium.launch();
const all = [];
for (const vp of VIEWPORTS) {
  const r = await runViewport(browser, vp);
  all.push(r);
  const fails = Object.entries(r.checks).filter(([, v]) => v === 'FAIL');
  console.log(`\n[qa] === ${r.viewport} ===  checks: ${Object.keys(r.checks).length}, FAIL: ${fails.length}`);
  for (const [k, v] of Object.entries(r.checks)) console.log(`  ${v}  ${k}`);
  if (fails.length) {
    console.log('  -- detalles --');
    for (const [k] of fails) console.log(`  * ${k}`);
    for (const i of r.issues) console.log(`  ! ${i}`);
    console.log('  ! extra:', JSON.stringify({ nameText: r.extra.nameText, photoCardText: r.extra.photoCardText, title: r.extra.title, metaDescription: r.extra.metaDescription, heroImgNaturalWidth: r.extra.heroImgNaturalWidth, overflow: r.extra.docScrollWidth + ' > ' + r.extra.docClientWidth, overflowers: r.extra.overflowers }));
  } else {
    console.log(`  extra: name="${r.extra.nameText}" photoCard="${r.extra.photoCardText}" img=${r.extra.heroImgNaturalWidth}px overflow=${r.extra.docScrollWidth}<=${r.extra.docClientWidth}`);
  }
}

await browser.close();
server.close();

fs.writeFileSync(OUT_JSON, JSON.stringify(all, null, 2), 'utf8');
const totalFail = all.reduce((n, r) => n + Object.values(r.checks).filter((v) => v === 'FAIL').length, 0);
console.log(`\n[qa] Resultados en ${OUT_JSON}  |  FAIL totales: ${totalFail}`);
process.exit(totalFail > 0 ? 1 : 0);
