// QA visual programatico por pixeles + geometria (sin inspeccion humana de imagenes)
// Proyecto: asesora-laura. Evidencia objetiva de renderizado de texto y layout.
// Uso: node docs/qa/qa-nombre-laura-visual.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJ = path.resolve(__dirname, '..', '..');
const SHOT_DIR = path.join(PROJ, 'docs', 'qa', 'screenshots');
const OUT_JSON = path.join(PROJ, 'docs', 'qa', 'nombre-laura-visual-results.json');

const { createRequire } = await import('node:module');
const require = createRequire(import.meta.url);
const PW_MODULE = process.env.PW_MODULE ||
  'C:/Users/Usuario/AppData/Local/Temp/opencode/qa-visual/node_modules/playwright';
const { chromium } = require(PW_MODULE);

const PORT = 8124;
const BASE = `http://127.0.0.1:${PORT}`;
const MIME = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, BASE).pathname);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.join(PROJ, urlPath);
    if (!filePath.startsWith(PROJ)) { res.writeHead(403); res.end(); return; }
    if (urlPath === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    if (!fs.existsSync(filePath)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } catch { res.writeHead(500); res.end(); }
});

// ---------- Decodificador PNG minimo (8-bit RGB/RGBA) ----------
function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('no PNG');
  let width = 0, height = 0, bitDepth = 0, colorType = 0, idat = Buffer.alloc(0);
  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      bitDepth = data.readUInt8(8); colorType = data.readUInt8(9);
    } else if (type === 'IDAT') {
      idat = Buffer.concat([idat, data]);
    } else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) throw new Error(`PNG no soportado: depth=${bitDepth} color=${colorType}`);
  const channels = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(idat);
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  let rp = 0;
  const paeth = (a, b, c) => {
    const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++];
    const rowStart = y * stride, prevStart = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const rawByte = raw[rp++];
      const left = x >= channels ? out[rowStart + x - channels] : 0;
      const up = y > 0 ? out[prevStart + x] : 0;
      const ul = y > 0 && x >= channels ? out[prevStart + x - channels] : 0;
      let v = rawByte;
      if (filter === 1) v += left;
      else if (filter === 2) v += up;
      else if (filter === 3) v += (left + up) >> 1;
      else if (filter === 4) v += paeth(left, up, ul);
      out[rowStart + x] = v & 0xff;
    }
  }
  return { width, height, channels, pixels: out };
}

// ---------- Analisis de pixeles ----------
function analyze(img, regions) {
  const { width, height, channels, pixels } = img;
  const px = (x, y) => {
    const i = (y * width + x) * channels;
    return [pixels[i], pixels[i + 1], pixels[i + 2]];
  };
  let sumLum = 0, sumLum2 = 0, colored = 0, nearWhite = 0, n = width * height;
  for (let i = 0; i < n; i++) {
    const r = pixels[i * channels], g = pixels[i * channels + 1], b = pixels[i * channels + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    sumLum += lum; sumLum2 += lum * lum;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx - mn > 24) colored++;
    if (r > 245 && g > 245 && b > 245) nearWhite++;
  }
  const mean = sumLum / n;
  const stddev = Math.sqrt(sumLum2 / n - mean * mean);
  const regionStats = {};
  for (const [name, rect] of Object.entries(regions)) {
    if (!rect) continue;
    const x0 = Math.max(0, Math.floor(rect.x)), y0 = Math.max(0, Math.floor(rect.y));
    const x1 = Math.min(width - 1, Math.floor(rect.x + rect.width));
    const y1 = Math.min(height - 1, Math.floor(rect.y + rect.height));
    let count = 0, dark = 0, light = 0, nonWhite = 0;
    if (x1 > x0 && y1 > y0) {
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const [r, g, b] = px(x, y);
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          count++;
          if (lum < 100) dark++;
          if (lum > 180) light++;
          if (lum < 200) nonWhite++;
        }
      }
    }
    regionStats[name] = { count, dark, light, nonWhite };
  }
  return {
    width, height,
    meanLuminance: +mean.toFixed(1),
    luminanceStddev: +stddev.toFixed(1),
    coloredFraction: +(colored / n).toFixed(4),
    nearWhiteFraction: +(nearWhite / n).toFixed(4),
    regionStats,
  };
}

// ---------- Main ----------
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
];

fs.mkdirSync(SHOT_DIR, { recursive: true });
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
const browser = await chromium.launch();
const all = [];

for (const vp of VIEWPORTS) {
  const results = { viewport: `${vp.width}x${vp.height}`, checks: {}, geometry: {}, pixels: {} };
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('on')));
  await page.waitForFunction(() => {
    const img = document.querySelector('.hero-photo img');
    return img && img.complete && img.naturalWidth > 0;
  }, { timeout: 15000 });

  const geo = await page.evaluate(() => {
    const $ = (s) => document.querySelector(s);
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    };
    const textInfo = (el) => {
      if (!el) return null;
      return {
        clientWidth: el.clientWidth, scrollWidth: el.scrollWidth,
        clientHeight: el.clientHeight, scrollHeight: el.scrollHeight,
        offsetParent: el.offsetParent !== null,
        visibleDim: el.clientWidth > 0 && el.clientHeight > 0,
        color: getComputedStyle(el).color,
        backgroundColor: getComputedStyle(el).backgroundColor,
        fontWeight: getComputedStyle(el).fontWeight,
        fontSize: getComputedStyle(el).fontSize,
        opacity: getComputedStyle(el).opacity,
      };
    };
    // interseccion par a par dentro del hero-copy
    const kids = Array.from(document.querySelectorAll('.hero-copy > *')).map((el) => ({
      cls: String(el.className), box: box(el),
    }));
    const overlaps = [];
    for (let i = 0; i < kids.length; i++) {
      for (let j = i + 1; j < kids.length; j++) {
        const a = kids[i].box, b = kids[j].box;
        if (!a || !b) continue;
        const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.x, b.x));
        const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y));
        if (ix > 1 && iy > 1) overlaps.push(`${kids[i].cls} <-> ${kids[j].cls} (${ix.toFixed(0)}x${iy.toFixed(0)}px)`);
      }
    }
    const vw = document.documentElement.clientWidth;
    const photoCard = box($('.photo-card'));
    return {
      name: { box: box($('.name')), text: textInfo($('.name')), textContent: $('.name')?.textContent.trim() },
      photoCardB: { box: box($('.photo-card b')), text: textInfo($('.photo-card b')), textContent: $('.photo-card b')?.textContent.trim() },
      legal: { box: box($('.legal')), text: textInfo($('.legal')), textContent: $('.legal')?.textContent.trim() },
      hero: box($('.hero')),
      photoCard,
      photoCardInViewport: photoCard ? photoCard.right <= vw + 1 && photoCard.x >= -1 : false,
      overlaps,
    };
  });

  const t = (c) => (c ? 'PASS' : 'FAIL');
  const nclip = geo.name.text && geo.name.text.scrollWidth <= geo.name.text.clientWidth + 1 && geo.name.text.scrollHeight <= geo.name.text.clientHeight + 1;
  const pcclip = geo.photoCardB.text && geo.photoCardB.text.scrollWidth <= geo.photoCardB.text.clientWidth + 1 && geo.photoCardB.text.scrollHeight <= geo.photoCardB.text.clientHeight + 1;
  const legalclip = geo.legal.text && geo.legal.text.scrollHeight <= geo.legal.text.clientHeight + 1;
  results.checks['.name visible y sin recorte horizontal'] = t(geo.name.text?.visibleDim && nclip);
  results.checks['.photo-card b visible y sin recorte'] = t(geo.photoCardB.text?.visibleDim && pcclip);
  results.checks['.legal sin recorte vertical'] = t(geo.legal.text?.visibleDim && legalclip);
  results.checks['.photo-card dentro del viewport'] = t(geo.photoCardInViewport);
  results.checks['sin solapamiento entre bloques del hero-copy'] = t(geo.overlaps.length === 0);
  results.geometry = geo;

  // Capturas de elementos para analisis de tinta
  const names = [
    { key: 'name', sel: '.name', file: `nombre-elem-name-${vp.name}.png` },
    { key: 'photoCardB', sel: '.photo-card b', file: `nombre-elem-photocard-${vp.name}.png` },
    { key: 'legal', sel: '.legal', file: `nombre-elem-legal-${vp.name}.png` },
  ];
  const regions = {};
  for (const n of names) {
    const p = path.join(SHOT_DIR, n.file);
    await page.locator(n.sel).screenshot({ path: p });
  }
  // analisis sobre las capturas de elementos (region completa del elemento)
  for (const n of names) {
    const p = path.join(SHOT_DIR, n.file);
    const buf = fs.readFileSync(p);
    const img = decodePNG(buf);
    results.pixels[n.key] = analyze(img, { full: { x: 0, y: 0, width: img.width, height: img.height } });
  }

  // tinta minima esperada segun el diseno (texto renderizado)
  const inkChecks = {
    name: (s) => s.regionStats.full.light > 30,           // texto blanco sobre gradiente oscuro
    photoCardB: (s) => s.regionStats.full.dark > 30,      // texto oscuro sobre tarjeta blanca
    legal: (s) => s.regionStats.full.nonWhite > 30,       // texto gris (#767980, lum ~121) sobre blanco
  };
  for (const n of names) {
    const s = results.pixels[n.key];
    const ok = s && inkChecks[n.key](s);
    results.checks[`pixeles: texto renderizado en .${n.key === 'photoCardB' ? 'photo-card b' : n.key} (tinta)`] = t(Boolean(ok));
    if (!ok) console.log(`  ! sin tinta en ${n.key}:`, JSON.stringify(s?.regionStats.full));
  }

  await ctx.close();
  all.push(results);
  const fails = Object.entries(results.checks).filter(([, v]) => v === 'FAIL');
  console.log(`[qa-visual] ${results.viewport}: ${Object.keys(results.checks).length} checks, FAIL=${fails.length}`);
  for (const [k, v] of Object.entries(results.checks)) console.log(`  ${v}  ${k}`);
}

await browser.close();
server.close();
fs.writeFileSync(OUT_JSON, JSON.stringify(all, null, 2), 'utf8');
const totalFail = all.reduce((n, r) => n + Object.values(r.checks).filter((v) => v === 'FAIL').length, 0);
console.log(`[qa-visual] Resultados en ${OUT_JSON} | FAIL totales: ${totalFail}`);
process.exit(totalFail > 0 ? 1 : 0);
