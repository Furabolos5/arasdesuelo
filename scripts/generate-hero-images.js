#!/usr/bin/env node
// Generates a unique abstract editorial hero image (SVG) for every article,
// colored by its tema and shaped by a motif picked deterministically from
// the article's slug, so re-running this script always reproduces the same
// set of images. No external assets, no API keys, no licensing questions —
// fits the project's "zero overhead" / free-stack constraint.

const fs = require("fs");
const path = require("path");

const ARTICLES = path.join(__dirname, "..", "..", "articles.json");
const TEMAS_META = require("../src/_data/temasMeta.js");
const OUT_DIR = path.join(__dirname, "..", "src", "images", "hero");

const W = 1200;
const H = 630;

// Deterministic PRNG seeded from a string (mulberry32).
function seedFromString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex({ r, g, b }) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({ r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t });
}
function lighten(hex, t) {
  return mix(hex, "#fdfcfa", t);
}
function darken(hex, t) {
  return mix(hex, "#1a1a1a", t);
}

const MOTIFS = ["arcos", "circulos", "lineas", "ondas", "triangulos"];

function svgHeader(bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n<rect width="${W}" height="${H}" fill="${bg}"/>\n`;
}

function motifArcos(rand, color) {
  let out = "";
  const cx = W * (0.55 + rand() * 0.3);
  const cy = H * (0.5 + rand() * 0.3);
  const count = 5 + Math.floor(rand() * 4);
  for (let i = 0; i < count; i++) {
    const r = 60 + i * (70 + rand() * 20);
    const opacity = (0.5 - i * 0.04).toFixed(2);
    const stroke = i % 2 === 0 ? color : lighten(color, 0.3);
    out += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="none" stroke="${stroke}" stroke-width="2" opacity="${opacity}"/>\n`;
  }
  return out;
}

function motifCirculos(rand, color) {
  let out = "";
  const count = 14 + Math.floor(rand() * 10);
  for (let i = 0; i < count; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = 6 + rand() * 46;
    const tone = rand() > 0.5 ? lighten(color, 0.25 + rand() * 0.3) : darken(color, rand() * 0.15);
    const opacity = (0.15 + rand() * 0.35).toFixed(2);
    out += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="${tone}" opacity="${opacity}"/>\n`;
  }
  return out;
}

function motifLineas(rand, color) {
  let out = "";
  const count = 10 + Math.floor(rand() * 8);
  const angle = -25 + rand() * 50;
  for (let i = 0; i < count; i++) {
    const x = -200 + (i * (W + 400)) / count + rand() * 40;
    const tone = i % 3 === 0 ? darken(color, 0.1) : lighten(color, 0.2 + (i % 4) * 0.1);
    const widthPx = 2 + rand() * 10;
    const opacity = (0.25 + rand() * 0.4).toFixed(2);
    out += `<line x1="${x.toFixed(0)}" y1="-50" x2="${(x + Math.tan((angle * Math.PI) / 180) * (H + 100)).toFixed(0)}" y2="${H + 50}" stroke="${tone}" stroke-width="${widthPx.toFixed(1)}" opacity="${opacity}"/>\n`;
  }
  return out;
}

function motifOndas(rand, color) {
  let out = "";
  const bands = 4 + Math.floor(rand() * 3);
  for (let b = 0; b < bands; b++) {
    const baseY = (H / (bands + 1)) * (b + 1) + (rand() - 0.5) * 60;
    const amp = 20 + rand() * 50;
    const freq = 1.2 + rand() * 1.5;
    let d = `M -50 ${baseY.toFixed(0)} `;
    const steps = 24;
    for (let s = 0; s <= steps; s++) {
      const x = -50 + ((W + 100) / steps) * s;
      const y = baseY + Math.sin((s / steps) * Math.PI * 2 * freq) * amp;
      d += `L ${x.toFixed(0)} ${y.toFixed(0)} `;
    }
    const tone = b % 2 === 0 ? color : lighten(color, 0.3);
    const opacity = (0.3 + rand() * 0.3).toFixed(2);
    out += `<path d="${d}" fill="none" stroke="${tone}" stroke-width="${(2 + rand() * 4).toFixed(1)}" opacity="${opacity}"/>\n`;
  }
  return out;
}

function motifTriangulos(rand, color) {
  let out = "";
  const count = 8 + Math.floor(rand() * 8);
  for (let i = 0; i < count; i++) {
    const cx = rand() * W;
    const cy = rand() * H;
    const size = 40 + rand() * 140;
    const rot = rand() * 360;
    const tone = rand() > 0.5 ? lighten(color, 0.25 + rand() * 0.25) : darken(color, rand() * 0.1);
    const opacity = (0.12 + rand() * 0.3).toFixed(2);
    const p1 = [0, -size / 2];
    const p2 = [size / 2, size / 2];
    const p3 = [-size / 2, size / 2];
    out += `<g transform="translate(${cx.toFixed(0)} ${cy.toFixed(0)}) rotate(${rot.toFixed(0)})"><polygon points="${p1.join(",")} ${p2.join(",")} ${p3.join(",")}" fill="${tone}" opacity="${opacity}"/></g>\n`;
  }
  return out;
}

const MOTIF_FNS = {
  arcos: motifArcos,
  circulos: motifCirculos,
  lineas: motifLineas,
  ondas: motifOndas,
  triangulos: motifTriangulos,
};

function generateSvg(slug, color) {
  const rand = seedFromString(slug);
  const motif = MOTIFS[Math.floor(rand() * MOTIFS.length)];
  const bg = lighten(color, 0.9);
  let svg = svgHeader(bg);
  svg += MOTIF_FNS[motif](rand, color);
  // Subtle paper-grain vignette for cohesion with the editorial palette.
  svg += `<rect width="${W}" height="${H}" fill="url(#vg)" opacity="0.5"/>\n`;
  svg += `<defs><radialGradient id="vg" cx="50%" cy="40%" r="75%"><stop offset="0%" stop-color="#fdfcfa" stop-opacity="0"/><stop offset="100%" stop-color="#fdfcfa" stop-opacity="0.35"/></radialGradient></defs>\n`;
  svg += `</svg>\n`;
  return svg;
}

function main() {
  const articles = JSON.parse(fs.readFileSync(ARTICLES, "utf8"));
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let count = 0;
  for (const a of articles) {
    const meta = TEMAS_META[a.tema];
    const color = meta ? meta.color : "#8a3b2e";
    const svg = generateSvg(a.slug, color);
    fs.writeFileSync(path.join(OUT_DIR, `${a.slug}.svg`), svg, "utf8");
    count++;
  }
  console.log(`Generated ${count} hero images in ${OUT_DIR}`);
}

main();
