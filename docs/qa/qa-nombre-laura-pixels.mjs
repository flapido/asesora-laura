// Deteccion objetiva de render (no-blanco) en capturas de pagina completa / hero
// Uso: node docs/qa/qa-nombre-laura-pixels.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOT_DIR = path.join(__dirname, 'screenshots');

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
    } else if (type === 'IDAT') idat = Buffer.concat([idat, data]);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) throw new Error(`PNG no soportado depth=${bitDepth} color=${colorType}`);
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
    const rs = y * stride, ps = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const rb = raw[rp++];
      const left = x >= channels ? out[rs + x - channels] : 0;
      const up = y > 0 ? out[ps + x] : 0;
      const ul = y > 0 && x >= channels ? out[ps + x - channels] : 0;
      let v = rb;
      if (filter === 1) v += left;
      else if (filter === 2) v += up;
      else if (filter === 3) v += (left + up) >> 1;
      else if (filter === 4) v += paeth(left, up, ul);
      out[rs + x] = v & 0xff;
    }
  }
  return { width, height, channels, pixels: out };
}

function stats(file) {
  const img = decodePNG(fs.readFileSync(file));
  const { width, height, channels, pixels } = img;
  const n = width * height;
  let sum = 0, sum2 = 0, colored = 0, nearWhite = 0;
  for (let i = 0; i < n; i++) {
    const r = pixels[i * channels], g = pixels[i * channels + 1], b = pixels[i * channels + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    sum += lum; sum2 += lum * lum;
    if (Math.max(r, g, b) - Math.min(r, g, b) > 24) colored++;
    if (r > 245 && g > 245 && b > 245) nearWhite++;
  }
  const mean = sum / n;
  const stddev = Math.sqrt(sum2 / n - mean * mean);
  return {
    file: path.basename(file),
    w: width, h: height,
    meanLum: +mean.toFixed(1),
    stddevLum: +stddev.toFixed(1),
    coloredFraction: +(colored / n).toFixed(4),
    nearWhiteFraction: +(nearWhite / n).toFixed(4),
    blank: stddev < 3, // practicamente sin variacion = captura vacia
  };
}

const files = fs.readdirSync(SHOT_DIR).filter((f) => f.startsWith('nombre-') && f.endsWith('.png'));
const out = files.map((f) => stats(path.join(SHOT_DIR, f)));
console.table(out.map((o) => ({ ...o, blank: o.blank ? 'SI' : 'no' })));
const anyBlank = out.some((o) => o.blank);
fs.writeFileSync(path.join(__dirname, 'nombre-laura-pixels-results.json'), JSON.stringify(out, null, 2), 'utf8');
console.log(`\n[pixels] capturas analizadas: ${out.length} | en blanco: ${anyBlank ? 'SI (FALLA)' : 'ninguna (OK)'}`);
process.exit(anyBlank ? 1 : 0);
