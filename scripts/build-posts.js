#!/usr/bin/env node
// Converts /home/claude/articles.json (scraped from WordPress) into Eleventy
// markdown posts under src/posts/, one file per article, with YAML front
// matter carrying tema/escuela/excerpt metadata used throughout the site.

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "..", "articles.json");
const OUT_DIR = path.join(__dirname, "..", "src", "posts");

function yamlEscape(str) {
  // Wrap in double quotes and escape embedded quotes/backslashes.
  return '"' + String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}

function main() {
  const raw = fs.readFileSync(SRC, "utf8");
  const articles = JSON.parse(raw);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let count = 0;
  for (const a of articles) {
    const frontMatter = [
      "---",
      `title: ${yamlEscape(a.title)}`,
      `date: ${a.date}`,
      `tema: ${yamlEscape(a.tema)}`,
      `escuela: ${yamlEscape(a.escuela)}`,
      `excerpt: ${yamlEscape(a.excerpt)}`,
      `heroImage: "/images/hero/${a.slug}.svg"`,
      `permalink: "/ensayos/${a.slug}/"`,
      "layout: layouts/post.njk",
      "---",
      "",
    ].join("\n");

    const filePath = path.join(OUT_DIR, `${a.slug}.md`);
    fs.writeFileSync(filePath, frontMatter + a.body_markdown + "\n", "utf8");
    count++;
  }

  console.log(`Wrote ${count} posts to ${OUT_DIR}`);
}

main();
