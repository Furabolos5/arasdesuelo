// Genera src/images/og/<slug>.jpg (1200x630) para las vistas previas al compartir
// en redes: la ilustración de cabecera del ensayo + su título + el nombre del sitio.
// Uso: node scripts/generate-og-images.js   (usa Microsoft Edge/Chrome instalado)
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.join(__dirname, "..");
const postsDir = path.join(root, "src", "posts");
const outDir = path.join(root, "src", "images", "og");
fs.mkdirSync(outDir, { recursive: true });

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function frontMatter(file) {
  const m = fs.readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const get = (k) => {
    const line = m[1].split(String.fromCharCode(10)).find((l) => l.trim().startsWith(k + ":"));
    if (!line) return "";
    let v = line.slice(k.length + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1).replace(/\\"/g, '"');
    return v;
  };
  return { title: get("title") };
}

(async () => {
  let browser;
  for (const channel of ["msedge", "chrome", undefined]) {
    try { browser = await chromium.launch(channel ? { channel } : {}); break; } catch (e) {}
  }
  if (!browser) throw new Error("No hay navegador disponible para Playwright");
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    const svgPath = path.join(root, "src", "images", "hero", slug + ".svg");
    if (!fs.existsSync(svgPath)) continue;
    const { title } = frontMatter(path.join(postsDir, f));
    const svgUri = "data:image/svg+xml;base64," + fs.readFileSync(svgPath).toString("base64");
    const size = title.length > 90 ? 42 : title.length > 60 ? 50 : 58;
    await page.setContent(`<html><body style="margin:0;width:1200px;height:630px;position:relative;overflow:hidden;font-family:Georgia,'Times New Roman',serif">
      <img src="${svgUri}" style="position:absolute;inset:0;width:1200px;height:630px">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,0) 20%,rgba(20,24,28,.78) 100%)"></div>
      <div style="position:absolute;left:64px;right:64px;bottom:96px;color:#fff;font-size:${size}px;line-height:1.18;font-weight:600">${esc(title)}</div>
      <div style="position:absolute;left:64px;bottom:44px;color:#e6ecef;font-size:26px;letter-spacing:.06em;font-family:Arial,sans-serif">A RAS DE SUELO</div>
    </body></html>`);
    await page.screenshot({ path: path.join(outDir, slug + ".jpg"), type: "jpeg", quality: 82 });
  }
  await browser.close();
  console.log("JPEG generados:", fs.readdirSync(outDir).length);
})();
