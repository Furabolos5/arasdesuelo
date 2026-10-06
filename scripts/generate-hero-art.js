// Genera las ilustraciones de cabecera (src/images/hero/<slug>.svg).
// Cada escuela filosófica tiene su propia escena (columnas estoicas, montañas
// taoístas, círculo zen, la puerta de Sartre...), pintada con degradados, capas
// de profundidad y grano. El color sale del tema del ensayo y los detalles
// (hora del día, posición del sol, niebla...) de forma determinista a partir
// del slug, así que cada ensayo tiene siempre la misma imagen.
//
// Uso: node scripts/generate-hero-art.js
// Después: node scripts/generate-og-images.js (PNG para redes sociales)
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const postsDir = path.join(root, "src", "posts");
const outDir = path.join(root, "src", "images", "hero");
const temasMeta = require(path.join(root, "src", "_data", "temasMeta.js"));

const W = 1200;
const H = 630;

// ---------- utilidades ----------
function hash(str) {
  let h = 2166136261;
  for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rngFrom(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbToHex = (r) => "#" + r.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
};
const f = (n) => Math.round(n * 10) / 10;

function frontMatter(file) {
  const m = fs.readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const get = (k) => {
    const line = m[1].split(String.fromCharCode(10)).find((l) => l.trim().startsWith(k + ":"));
    if (!line) return "";
    let v = line.slice(k.length + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    return v;
  };
  return { tema: get("tema"), escuela: get("escuela") };
}

// Contorno ondulado de colinas/montañas: devuelve un <path> relleno hasta abajo.
function ridge(rand, base, amp, color, { rough = 1, opacity = 1, peaks = false } = {}) {
  const phases = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
  const fr = [0.0045 + rand() * 0.003, 0.011 + rand() * 0.004, 0.027 + rand() * 0.01];
  let d = `M-20 ${H + 20}`;
  for (let x = -20; x <= W + 20; x += 15) {
    let y = Math.sin(x * fr[0] + phases[0]) * amp + Math.sin(x * fr[1] + phases[1]) * amp * 0.45 * rough + Math.sin(x * fr[2] + phases[2]) * amp * 0.16 * rough;
    if (peaks) y = -Math.abs(y) * 1.5;
    d += ` L${x} ${f(base + y)}`;
  }
  d += ` L${W + 20} ${H + 20} Z`;
  return `<path d="${d}" fill="${color}" opacity="${opacity}"/>`;
}

function mist(y, h, color, opacity) {
  return `<rect x="0" y="${y}" width="${W}" height="${h}" fill="url(#mist-${color.slice(1)})" opacity="${opacity}"/>` +
    `<linearGradient id="mist-${color.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".5" stop-color="${color}" stop-opacity="1"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`;
}

function star(rand, n, color) {
  let s = "";
  for (let i = 0; i < n; i++) {
    s += `<circle cx="${f(rand() * W)}" cy="${f(rand() * H * 0.55)}" r="${f(0.6 + rand() * 1.5)}" fill="${color}" opacity="${f(0.3 + rand() * 0.6)}"/>`;
  }
  return s;
}

function figure(x, y, s, color) {
  // Silueta humana mínima: cabeza + cuerpo, de pie sobre (x, y).
  return `<g fill="${color}"><circle cx="${x}" cy="${f(y - 46 * s)}" r="${f(6 * s)}"/>` +
    `<path d="M${f(x - 8 * s)} ${y} L${f(x - 6 * s)} ${f(y - 38 * s)} Q${x} ${f(y - 42 * s)} ${f(x + 6 * s)} ${f(y - 38 * s)} L${f(x + 8 * s)} ${y} Z"/></g>`;
}

// ---------- escenas por escuela ----------
const scenes = {
  "estoicismo"(c) {
    const { rand, pal } = c;
    let s = ridge(rand, 470, 18, pal.far, { opacity: 0.8 });
    const cols = 5, cw = 46, gap = 62, total = cols * cw + (cols - 1) * gap;
    const x0 = W * (0.5 + (rand() - 0.5) * 0.25) - total / 2;
    const top = 190, bottom = 470;
    s += `<rect x="${f(x0 - 40)}" y="${top - 38}" width="${total + 80}" height="30" fill="${pal.mid}"/>`;
    s += `<polygon points="${f(x0 - 40)},${top - 38} ${f(x0 + total / 2)},${top - 96} ${f(x0 + total + 40)},${top - 38}" fill="${pal.mid}"/>`;
    s += `<rect x="${f(x0 - 40)}" y="${top - 8}" width="${total + 80}" height="12" fill="${pal.near}"/>`;
    for (let i = 0; i < cols; i++) {
      const x = x0 + i * (cw + gap);
      s += `<rect x="${f(x - 6)}" y="${top + 4}" width="${cw + 12}" height="12" fill="${pal.near}"/>`;
      s += `<rect x="${f(x)}" y="${top + 16}" width="${cw}" height="${bottom - top - 28}" fill="url(#col)"/>`;
      for (let k = 1; k < 4; k++) s += `<line x1="${f(x + k * cw / 4)}" y1="${top + 18}" x2="${f(x + k * cw / 4)}" y2="${bottom - 14}" stroke="${pal.far}" stroke-opacity=".35" stroke-width="2"/>`;
      s += `<rect x="${f(x - 6)}" y="${bottom - 12}" width="${cw + 12}" height="12" fill="${pal.near}"/>`;
    }
    for (let k = 0; k < 3; k++) s += `<rect x="${f(x0 - 60 - k * 22)}" y="${bottom + k * 14}" width="${f(total + 120 + k * 44)}" height="16" fill="${mix(pal.near, pal.ground, k * 0.25)}"/>`;
    s += `<rect x="0" y="${bottom + 42}" width="${W}" height="${H}" fill="${pal.ground}"/>`;
    const defs = `<linearGradient id="col" x1="0" x2="1"><stop offset="0" stop-color="${pal.mid}"/><stop offset=".55" stop-color="${mix(pal.mid, "#ffffff", 0.25)}"/><stop offset="1" stop-color="${pal.near}"/></linearGradient>`;
    return { defs, body: s };
  },

  "cinismo griego"(c) {
    const { rand, pal } = c;
    const lx = 760 + rand() * 160, ly = 410;
    let s = ridge(rand, 430, 14, pal.far, { opacity: 0.7 });
    s += `<rect x="0" y="${ly + 18}" width="${W}" height="${H}" fill="${pal.ground}"/>`;
    // tonel
    const bx = 330 + rand() * 120, by = ly + 18;
    s += `<ellipse cx="${bx}" cy="${by + 2}" rx="124" ry="14" fill="#000" opacity=".25"/>`;
    s += `<path d="M${bx - 98} ${by} Q${bx - 122} ${by - 100} ${bx - 96} ${by - 190} L${bx + 96} ${by - 190} Q${bx + 122} ${by - 100} ${bx + 98} ${by} Z" fill="${pal.near}"/>`;
    s += `<ellipse cx="${bx}" cy="${by - 190}" rx="96" ry="22" fill="${mix(pal.near, '#ffffff', 0.15)}"/>`;
    s += `<ellipse cx="${bx}" cy="${by - 190}" rx="76" ry="15" fill="${pal.dark}"/>`;
    for (const y of [by - 150, by - 96, by - 42]) s += `<path d="M${bx - 112} ${y} Q${bx} ${y + 22} ${bx + 112} ${y}" stroke="${pal.dark}" stroke-width="7" fill="none" opacity=".8"/>`;
    // linterna
    s += `<circle cx="${lx}" cy="${ly - 36}" r="190" fill="url(#lamp)"/>`;
    s += `<line x1="${lx}" y1="${ly - 90}" x2="${lx}" y2="${ly - 58}" stroke="${pal.dark}" stroke-width="3"/>`;
    s += `<path d="M${lx - 20} ${ly - 58} L${lx + 20} ${ly - 58} L${lx + 15} ${ly - 8} L${lx - 15} ${ly - 8} Z" fill="${pal.light}" stroke="${pal.dark}" stroke-width="4"/>`;
    s += `<rect x="${lx - 24}" y="${ly - 66}" width="48" height="8" fill="${pal.dark}"/><rect x="${lx - 18}" y="${ly - 8}" width="36" height="8" fill="${pal.dark}"/>`;
    s += figure(lx + 130, ly + 18, 1.5, pal.dark);
    const defs = `<radialGradient id="lamp"><stop offset="0" stop-color="${pal.light}" stop-opacity=".9"/><stop offset=".35" stop-color="${pal.light}" stop-opacity=".25"/><stop offset="1" stop-color="${pal.light}" stop-opacity="0"/></radialGradient>`;
    return { defs, body: s };
  },

  "taoísmo"(c) {
    const { rand, pal } = c;
    let s = "";
    const layers = 5;
    for (let i = 0; i < layers; i++) {
      const t = i / (layers - 1);
      s += ridge(rand, 250 + i * 62, 34 - i * 3, mix(pal.far, pal.near, t * 0.9), { peaks: true, rough: 1.4 - t * 0.6, opacity: 0.55 + t * 0.45 });
      s += mist(250 + i * 62 - 20, 90, pal.mistc, 0.55 - t * 0.2);
    }
    // pinos
    for (let i = 0; i < 4; i++) {
      const x = 80 + rand() * (W - 160), y = 470 + rand() * 40, h = 70 + rand() * 60;
      s += `<path d="M${x} ${y - h} L${x - 22} ${y - h * 0.45} L${x - 10} ${y - h * 0.45} L${x - 30} ${y} L${x + 30} ${y} L${x + 10} ${y - h * 0.45} L${x + 22} ${y - h * 0.45} Z" fill="${pal.dark}" opacity=".85"/>`;
    }
    // barca en el agua
    s += `<rect x="0" y="545" width="${W}" height="${H}" fill="${pal.ground}"/>`;
    const bx = 300 + rand() * 600;
    s += `<path d="M${bx - 40} 548 L${bx + 40} 548 L${bx + 28} 560 L${bx - 28} 560 Z" fill="${pal.dark}"/><line x1="${bx}" y1="548" x2="${bx}" y2="520" stroke="${pal.dark}" stroke-width="2"/>`;
    s += mist(520, 60, pal.mistc, 0.5);
    return { defs: "", body: s };
  },

  "budismo zen"(c) {
    const { rand, pal } = c;
    let s = `<rect x="0" y="400" width="${W}" height="${H}" fill="${pal.ground}"/>`;
    // arena rastrillada
    for (let i = 0; i < 9; i++) {
      const y = 420 + i * 24;
      s += `<path d="M0 ${y} Q300 ${y - 14 - i} 600 ${y} T1200 ${y}" stroke="${mix(pal.ground, pal.dark, 0.3)}" stroke-width="2" fill="none" opacity="${f(0.7 - i * 0.05)}"/>`;
    }
    // ensō
    const cx = 600 + (rand() - 0.5) * 160, cy = 270, r = 150;
    const gap = 0.3 + rand() * 0.3, a0 = -1.2 + rand() * 0.6;
    const arc = (rad, w, op) => {
      const a1 = a0 + gap, a2 = a0 + 6.283;
      const p = (a) => `${f(cx + Math.cos(a) * rad)} ${f(cy + Math.sin(a) * rad)}`;
      return `<path d="M${p(a1)} A${rad} ${rad} 0 1 1 ${p(a2)}" stroke="${pal.dark}" stroke-width="${w}" stroke-linecap="round" fill="none" opacity="${op}"/>`;
    };
    s += arc(r, 34, 0.92) + arc(r + 5, 18, 0.5) + arc(r - 6, 10, 0.4);
    // piedras
    for (let i = 0; i < 3; i++) {
      const x = 200 + rand() * 800, y = 520 + rand() * 60, rx = 30 + rand() * 40;
      s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(rx * 0.5)}" fill="${pal.dark}"/><ellipse cx="${f(x - rx * 0.2)}" cy="${f(y - rx * 0.15)}" rx="${f(rx * 0.55)}" ry="${f(rx * 0.2)}" fill="#fff" opacity=".12"/>`;
    }
    return { defs: "", body: s };
  },

  "existencialismo de Sartre"(c) {
    const { rand, pal } = c;
    const cx = 600 + (rand() - 0.5) * 300, top = 120, w = 190, bottom = 480;
    let s = `<rect x="0" y="${bottom}" width="${W}" height="${H}" fill="${pal.ground}"/>`;
    // haz de luz en el suelo
    s += `<polygon points="${cx - w / 2},${bottom} ${cx + w / 2},${bottom} ${cx + w * 1.5},${H} ${cx - w * 1.5},${H}" fill="url(#beam)"/>`;
    // marco y puerta
    s += `<rect x="${cx - w / 2 - 22}" y="${top - 22}" width="${w + 44}" height="${bottom - top + 22}" fill="${pal.dark}"/>`;
    s += `<rect x="${cx - w / 2}" y="${top}" width="${w}" height="${bottom - top}" fill="url(#doorlight)"/>`;
    s += `<circle cx="${cx}" cy="${bottom - 120}" r="260" fill="url(#glow)"/>`;
    s += figure(cx + (rand() - 0.5) * 30, bottom + 150, 3.2, pal.dark);
    s += `<ellipse cx="${cx}" cy="${bottom + 150}" rx="60" ry="9" fill="#000" opacity=".2"/>`;
    const defs = `<linearGradient id="doorlight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.light}"/><stop offset="1" stop-color="${mix(pal.light, '#ffffff', 0.6)}"/></linearGradient>` +
      `<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.light}" stop-opacity=".75"/><stop offset="1" stop-color="${pal.light}" stop-opacity=".05"/></linearGradient>` +
      `<radialGradient id="glow"><stop offset="0" stop-color="${pal.light}" stop-opacity=".5"/><stop offset="1" stop-color="${pal.light}" stop-opacity="0"/></radialGradient>`;
    return { defs, body: s };
  },

  "absurdismo"(c) {
    const { rand, pal } = c;
    let s = ridge(rand, 420, 20, pal.far, { opacity: 0.6 });
    // la ladera: de abajo-izquierda a arriba-derecha
    const top = 150 + rand() * 40;
    s += `<path d="M-20 ${H + 20} L-20 520 Q500 470 760 330 Q880 ${top + 20} 1000 ${top} Q1100 ${top + 6} 1220 ${top + 40} L1220 ${H + 20} Z" fill="${pal.mid}"/>`;
    s += `<path d="M-20 ${H + 20} L-20 580 Q500 540 780 400 Q900 330 1000 ${top + 90} Q1100 ${top + 80} 1220 ${top + 110} L1220 ${H + 20} Z" fill="${pal.near}"/>`;
    // roca + figura sobre la pendiente (~ x=640)
    const bx = 700, by = 362, br = 58;
    s += `<ellipse cx="${bx + 8}" cy="${by + br - 4}" rx="${br}" ry="9" fill="#000" opacity=".25"/>`;
    s += `<circle cx="${bx}" cy="${by}" r="${br}" fill="url(#rock)"/>`;
    s += `<circle cx="${bx - 18}" cy="${by - 16}" r="14" fill="#fff" opacity=".1"/>`;
    s += figure(bx - 96, by + 66, 1.9, pal.dark);
    const defs = `<radialGradient id="rock" cx=".35" cy=".3"><stop offset="0" stop-color="${mix(pal.dark, '#ffffff', 0.25)}"/><stop offset="1" stop-color="${pal.dark}"/></radialGradient>`;
    return { defs, body: s };
  },

  "nihilismo"(c) {
    const { rand, pal } = c;
    let s = "";
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      s += ridge(rand, 300 + i * 70, 70 - i * 8, mix(pal.far, pal.dark, t), { peaks: true, rough: 1.8, opacity: 0.6 + t * 0.4 });
      s += mist(300 + i * 70 - 10, 120, pal.mistc, 0.4);
    }
    // caminante en la cima más cercana
    const px = 300 + rand() * 600;
    s += figure(px, 470, 1.8, pal.dark);
    // rayos de tormenta
    for (let i = 0; i < 7; i++) {
      const x = rand() * W, y = rand() * 160;
      s += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x - 90)}" y2="${f(y + 20)}" stroke="${pal.light}" stroke-opacity=".12" stroke-width="2"/>`;
    }
    s += `<rect x="0" y="560" width="${W}" height="${H}" fill="${pal.ground}"/>`;
    return { defs: "", body: s };
  },

  "escepticismo"(c) {
    const { rand, pal } = c;
    let s = ridge(rand, 470, 22, pal.far, { opacity: 0.8 }) + ridge(rand, 520, 26, pal.mid, { opacity: 0.95 });
    s += `<rect x="0" y="560" width="${W}" height="${H}" fill="${pal.ground}"/>`;
    const cx = 600 + (rand() - 0.5) * 240, py = 540, tilt = (rand() - 0.5) * 0.14;
    s += `<polygon points="${cx - 36},${py} ${cx + 36},${py} ${cx + 6},${py - 330} ${cx - 6},${py - 330}" fill="${pal.dark}"/>`;
    s += `<circle cx="${cx}" cy="${py - 336}" r="14" fill="${pal.light}" stroke="${pal.dark}" stroke-width="5"/>`;
    const bl = 250, by0 = py - 336;
    const dx = Math.cos(tilt) * bl, dy = Math.sin(tilt) * bl;
    s += `<line x1="${f(cx - dx)}" y1="${f(by0 - dy)}" x2="${f(cx + dx)}" y2="${f(by0 + dy)}" stroke="${pal.dark}" stroke-width="9" stroke-linecap="round"/>`;
    for (const sign of [-1, 1]) {
      const ex = cx + sign * dx, ey = by0 + sign * dy, ph = 120;
      s += `<line x1="${f(ex)}" y1="${f(ey)}" x2="${f(ex - 70)}" y2="${f(ey + ph)}" stroke="${pal.dark}" stroke-width="2.5"/><line x1="${f(ex)}" y1="${f(ey)}" x2="${f(ex + 70)}" y2="${f(ey + ph)}" stroke="${pal.dark}" stroke-width="2.5"/>`;
      s += `<path d="M${f(ex - 84)} ${f(ey + ph)} Q${f(ex)} ${f(ey + ph + 50)} ${f(ex + 84)} ${f(ey + ph)} Z" fill="${pal.dark}"/>`;
      s += `<circle cx="${f(ex + (rand() - 0.5) * 30)}" cy="${f(ey + ph - 14)}" r="${f(12 + rand() * 12)}" fill="${pal.light}" opacity=".9"/>`;
    }
    return { defs: "", body: s };
  },

  "epicureísmo"(c) {
    const { rand, pal } = c;
    let s = ridge(rand, 400, 26, pal.far, { opacity: 0.8 }) + ridge(rand, 470, 22, pal.mid);
    s += ridge(rand, 540, 18, pal.near);
    // árbol
    const tx = 820 + (rand() - 0.5) * 240, ty = 520;
    s += `<path d="M${tx - 14} ${ty} Q${tx - 8} ${ty - 120} ${tx - 30} ${ty - 190} L${tx + 30} ${ty - 190} Q${tx + 8} ${ty - 120} ${tx + 14} ${ty} Z" fill="${pal.dark}"/>`;
    const canopy = [[0, -250, 96], [-80, -210, 76], [80, -214, 78], [-36, -300, 70], [42, -296, 66]];
    for (const [dx, dy, r] of canopy) s += `<circle cx="${tx + dx}" cy="${ty + dy}" r="${r}" fill="${mix(pal.mid, pal.dark, 0.45)}"/>`;
    for (const [dx, dy, r] of canopy) s += `<circle cx="${tx + dx - 14}" cy="${ty + dy - 16}" r="${r * 0.55}" fill="${mix(pal.mid, pal.light, 0.15)}" opacity=".5"/>`;
    for (let i = 0; i < 9; i++) s += `<circle cx="${f(tx + (rand() - 0.5) * 220)}" cy="${f(ty - 200 - rand() * 130)}" r="${f(5 + rand() * 3)}" fill="${pal.light}"/>`;
    // hierba y flores
    for (let i = 0; i < 40; i++) {
      const x = rand() * W, y = 545 + rand() * 80;
      s += `<path d="M${f(x)} ${f(y)} q${f(-4 + rand() * 8)} -16 ${f(-6 + rand() * 12)} -${f(20 + rand() * 20)}" stroke="${pal.dark}" stroke-width="2.5" fill="none" opacity=".6"/>`;
    }
    for (let i = 0; i < 9; i++) s += `<circle cx="${f(rand() * W)}" cy="${f(565 + rand() * 50)}" r="${f(3 + rand() * 3)}" fill="${pal.light}" opacity=".85"/>`;
    return { defs: "", body: s };
  },

  "ética de la virtud"(c) {
    const { rand, pal } = c;
    let s = ridge(rand, 470, 16, pal.far, { opacity: 0.7 });
    const cx = 600 + (rand() - 0.5) * 120, base = 480;
    // escalinata
    for (let k = 0; k < 4; k++) s += `<rect x="${cx - 420 + k * 30}" y="${base + k * 28 - 4}" width="${840 - k * 60}" height="30" fill="${mix(pal.mid, pal.near, k / 4)}"/>`;
    // arcada de tres arcos
    const aw = 220, ah = 260;
    s += `<rect x="${cx - aw * 1.5 - 30}" y="${base - ah - 80}" width="${aw * 3 + 60}" height="${ah + 80}" fill="${pal.mid}"/>`;
    s += `<rect x="${cx - aw * 1.5 - 50}" y="${base - ah - 110}" width="${aw * 3 + 100}" height="36" fill="${pal.near}"/>`;
    for (let i = 0; i < 3; i++) {
      const x = cx - aw * 1.5 + i * aw + 26, w = aw - 52;
      s += `<path d="M${x} ${base} L${x} ${base - ah + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${base - ah + w / 2} L${x + w} ${base} Z" fill="url(#arch)"/>`;
    }
    s += `<rect x="0" y="${base + 112}" width="${W}" height="${H}" fill="${pal.ground}"/>`;
    s += figure(cx + (rand() - 0.5) * 200, base + 150, 2.4, pal.dark);
    const defs = `<linearGradient id="arch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.dark}"/><stop offset="1" stop-color="${mix(pal.dark, pal.light, 0.35)}"/></linearGradient>`;
    return { defs, body: s };
  },

  "pragmatismo de William James"(c) {
    const { rand, pal } = c;
    let s = ridge(rand, 330, 30, pal.far, { opacity: 0.7, peaks: true });
    s += mist(430, 150, pal.mistc, 0.7);
    // acantilados
    s += `<path d="M-20 ${H + 20} L-20 340 L300 340 Q340 360 350 420 L380 ${H + 20} Z" fill="${pal.near}"/>`;
    s += `<path d="M${W + 20} ${H + 20} L${W + 20} 340 L900 340 Q860 360 850 420 L820 ${H + 20} Z" fill="${pal.near}"/>`;
    // puente de tablones con cuerdas
    const y1 = 340, y2 = 340, sag = 46 + rand() * 20;
    const pt = (t) => [300 + (900 - 300) * t, y1 + sag * 4 * t * (1 - t)];
    let deck = "";
    for (let i = 0; i <= 30; i++) { const [x, y] = pt(i / 30); deck += `<rect x="${f(x - 7)}" y="${f(y)}" width="12" height="7" fill="${pal.dark}"/>`; }
    s += deck;
    let rope = "M300 280";
    for (let i = 1; i <= 30; i++) { const [x, y] = pt(i / 30); rope += ` L${f(x)} ${f(y - 56)}`; }
    s += `<path d="${rope}" stroke="${pal.dark}" stroke-width="3" fill="none"/>`;
    for (let i = 0; i <= 10; i++) { const [x, y] = pt(i / 10); s += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(y - 56)}" stroke="${pal.dark}" stroke-width="2"/>`; }
    const [fx, fy] = pt(0.3 + rand() * 0.4);
    s += figure(f(fx), f(fy), 1.3, pal.dark);
    return { defs: "", body: s };
  },

  "fenomenología"(c) {
    const { rand, pal } = c;
    const cx = 600 + (rand() - 0.5) * 160, cy = 330;
    let s = ridge(rand, 520, 14, pal.far, { opacity: 0.6 });
    // rayos
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2 + rand() * 0.05, r1 = 120, r2 = 520 + rand() * 200;
      s += `<line x1="${f(cx + Math.cos(a) * r1)}" y1="${f(cy + Math.sin(a) * r1)}" x2="${f(cx + Math.cos(a) * r2)}" y2="${f(cy + Math.sin(a) * r2)}" stroke="${pal.light}" stroke-opacity="${f(0.08 + rand() * 0.18)}" stroke-width="${f(1 + rand() * 3)}"/>`;
    }
    // ojo / lente
    s += `<path d="M${cx - 300} ${cy} Q${cx} ${cy - 210} ${cx + 300} ${cy} Q${cx} ${cy + 210} ${cx - 300} ${cy} Z" fill="${pal.light}" opacity=".9"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="124" fill="url(#iris)"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="124" fill="none" stroke="${pal.dark}" stroke-width="5"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="52" fill="${pal.dark}"/>`;
    s += `<circle cx="${cx - 22}" cy="${cy - 24}" r="14" fill="#fff" opacity=".85"/>`;
    for (let k = 1; k <= 3; k++) s += `<circle cx="${cx}" cy="${cy}" r="${124 + k * 52}" fill="none" stroke="${pal.light}" stroke-opacity="${f(0.3 - k * 0.07)}" stroke-width="2"/>`;
    const defs = `<radialGradient id="iris"><stop offset="0" stop-color="${mix(pal.mid, '#ffffff', 0.3)}"/><stop offset="1" stop-color="${pal.mid}"/></radialGradient>`;
    return { defs, body: s };
  },
};

function paletteFor(temaColor, rand) {
  const night = rand() < 0.4;
  const warm = "#f6c28b", cream = "#fbf3e6", ink = "#0c111d";
  const top = night ? mix(temaColor, ink, 0.78) : mix(temaColor, cream, 0.72);
  const bot = night ? mix(temaColor, warm, 0.28) : mix(temaColor, warm, 0.45);
  const dark = night ? mix(temaColor, ink, 0.8) : mix(temaColor, ink, 0.62);
  return {
    night, top, bot, dark,
    far: mix(bot, dark, night ? 0.35 : 0.22),
    mid: mix(bot, dark, night ? 0.6 : 0.45),
    near: mix(bot, dark, night ? 0.8 : 0.68),
    ground: mix(bot, dark, night ? 0.72 : 0.55),
    light: night ? "#ffe6b0" : "#fff6dc",
    mistc: night ? mix(top, "#ffffff", 0.25) : "#ffffff",
    sun: night ? "#f3efe2" : "#fff1c9",
  };
}

function generate(slug, tema, escuela) {
  const rand = rngFrom(hash(slug));
  const color = (temasMeta[tema] && temasMeta[tema].color) || "#6b6b6b";
  const pal = paletteFor(color, rand);
  const scene = (scenes[escuela] || scenes["estoicismo"])({ rand, pal });

  const sunX = 140 + rand() * (W - 280), sunY = 90 + rand() * 120, sunR = 38 + rand() * 30;
  const sky = `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
    (pal.night ? star(rand, 70, "#ffffff") : "") +
    `<circle cx="${f(sunX)}" cy="${f(sunY)}" r="${f(sunR * 4.2)}" fill="url(#sunglow)"/>` +
    `<circle cx="${f(sunX)}" cy="${f(sunY)}" r="${f(sunR)}" fill="${pal.sun}"/>`;

  const defs = `<defs>` +
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.top}"/><stop offset="1" stop-color="${pal.bot}"/></linearGradient>` +
    `<radialGradient id="sunglow"><stop offset="0" stop-color="${pal.sun}" stop-opacity=".65"/><stop offset="1" stop-color="${pal.sun}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>` +
    `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .55 0"/></filter>` +
    scene.defs + `</defs>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs}${sky}${scene.body}` +
    `<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".35"/><rect width="${W}" height="${H}" fill="url(#vig)"/></svg>\n`;
}

if (require.main === module) {
  fs.mkdirSync(outDir, { recursive: true });
  let n = 0;
  for (const file of fs.readdirSync(postsDir).filter((x) => x.endsWith(".md"))) {
    const slug = file.replace(/\.md$/, "");
    const { tema, escuela } = frontMatter(path.join(postsDir, file));
    if (!scenes[escuela]) console.warn("Escuela sin escena propia:", escuela, "->", slug);
    fs.writeFileSync(path.join(outDir, slug + ".svg"), generate(slug, tema, escuela));
    n++;
  }
  console.log("Ilustraciones generadas:", n);
}

module.exports = { generate };
