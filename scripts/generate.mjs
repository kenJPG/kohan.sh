/**
 * generate.mjs — Builds index.html from content.json + logos/* + an optional portrait.
 *
 * Usage: node scripts/generate.mjs
 *
 * Content pipeline:
 *   content.json  →  all text content (bio, experience, skills, links, resume)
 *   portrait      →  optional photo, resized to WebP at build time
 *   logos/*       →  company logo images
 *
 * To add/update content:  edit content.json
 * To add your photo:      drop a jpg/png at the repo root named to match
 *                         content.portrait.src, then rebuild
 * To add a company logo:  drop an image in logos/ named to match the "logo"
 *                         field in content.json (e.g. "resumify.png")
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, statSync } from "fs";
import { resolve, join, basename, extname } from "path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT_PATH = join(ROOT, "content.json");
const LOGOS_DIR = join(ROOT, "logos");
const PUBLIC_DIR = join(ROOT, "public");
// Generated images live under public/img so they can be gitignored wholesale,
// while the committed resume PDFs elsewhere in public/ stay tracked.
const IMG_DIR = join(PUBLIC_DIR, "img");
const OUT_PATH = join(ROOT, "index.html");

const content = JSON.parse(readFileSync(CONTENT_PATH, "utf-8"));

// ── Helpers ───────────────────────────────────────────────────────────

function esc(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Convert markdown-style [text](url) links in a string to <a> tags */
function linkify(str) {
  if (str == null) return "";
  return esc(str).replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" rel="noreferrer">$1</a>'
  );
}

/** "2023 - 2026" → "2023—2026". En/em dashes read as a range, hyphens read as a typo. */
function range(str) {
  return esc(str).replace(/\s*-\s*/g, "–");
}

/** Split a comma list into individual items. */
function items(str) {
  return String(str ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Portrait ──────────────────────────────────────────────────────────
// Resized at build time so the page ships one right-sized WebP instead of a
// multi-megabyte camera original, and so width/height are known up front —
// without them the image reflows the hero as it loads.

const PORTRAIT_WIDTH = 320; // CSS px at 1x; emitted at 2x for retina

async function buildPortrait(portrait) {
  if (!portrait?.src) return null;

  const source = join(ROOT, portrait.src);
  if (!existsSync(source)) {
    console.warn(
      `  · Portrait "${portrait.src}" not found — hero renders type-only.\n` +
        `    Drop the file at ${source} and rebuild to include it.`
    );
    return null;
  }

  mkdirSync(IMG_DIR, { recursive: true });

  const name = basename(portrait.src, extname(portrait.src));
  const outName = `${name}-${PORTRAIT_WIDTH * 2}.webp`;

  const info = await sharp(source)
    .resize(PORTRAIT_WIDTH * 2, PORTRAIT_WIDTH * 2, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toFile(join(IMG_DIR, outName));

  console.log(`  ✓ Portrait: ${portrait.src} → img/${outName} (${(info.size / 1024).toFixed(1)} KB)`);

  return {
    src: `/img/${outName}`,
    alt: portrait.alt ?? content.name,
    width: PORTRAIT_WIDTH,
    height: PORTRAIT_WIDTH,
  };
}

// ── Logos ─────────────────────────────────────────────────────────────
// These render at 18px. Shipping the originals meant sending 429 KB of
// raid.png to draw an 18-pixel square, so each is resized to 2x and encoded
// as WebP at build time.

const LOGO_PX = 18;

async function buildLogos() {
  const map = new Map();
  if (!existsSync(LOGOS_DIR)) return map;

  mkdirSync(join(IMG_DIR, "logos"), { recursive: true });

  const files = readdirSync(LOGOS_DIR).filter((f) => /\.(png|jpe?g|gif|webp)$/i.test(f));

  for (const file of files) {
    const name = basename(file, extname(file));
    const outName = `${name}.webp`;
    const before = statSync(join(LOGOS_DIR, file)).size;

    const info = await sharp(join(LOGOS_DIR, file))
      .resize(LOGO_PX * 2, LOGO_PX * 2, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 88 })
      .toFile(join(IMG_DIR, "logos", outName));

    map.set(file, `/img/logos/${outName}`);
    console.log(
      `  ✓ Logo: ${file} ${(before / 1024).toFixed(1)} KB → ${(info.size / 1024).toFixed(1)} KB`
    );
  }

  return map;
}

const logos = await buildLogos();

// ── Render ────────────────────────────────────────────────────────────

/**
 * Every entry is the same shape: a date rail, a title, a source line and a
 * body. Keeping one renderer means the three sections cannot drift apart
 * visually, which is the whole point of the date-rail grid.
 */
function entry({ date, title, source, sourceLogo, body, meta }) {
  const logo = sourceLogo && logos.has(sourceLogo)
    ? `<img class="entry__logo" src="${esc(logos.get(sourceLogo))}" alt="" width="18" height="18" loading="lazy">`
    : "";

  return `<article class="entry">
  <div class="entry__date">${range(date)}</div>
  <div class="entry__main">
    <h3 class="entry__title">${esc(title)}</h3>
    ${source ? `<p class="entry__source">${logo}<span>${esc(source)}</span></p>` : ""}
    ${body ? `<p class="entry__body">${linkify(body)}</p>` : ""}
    ${meta ? `<ul class="tags">${items(meta).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
  </div>
</article>`;
}

const renderExperience = (e) =>
  entry({ date: e.date, title: e.role, source: e.company, sourceLogo: e.logo, body: e.description, meta: e.tech });

const renderResearch = (r) =>
  entry({ date: r.org, title: r.title, body: r.detail });

const renderEducation = (e) =>
  entry({ date: e.date, title: e.school, source: e.degree, body: e.awards });

function renderSkills(skills) {
  return Object.entries(skills)
    .map(
      ([label, value]) => `<div class="skill">
    <dt>${esc(label)}</dt>
    <dd><ul class="tags">${items(value).map((t) => `<li>${esc(t)}</li>`).join("")}</ul></dd>
  </div>`
    )
    .join("\n  ");
}

function renderLinks(links = {}) {
  return Object.entries(links)
    .map(([name, url]) => `<a class="link" href="${esc(url)}" rel="noreferrer">${esc(name)}</a>`)
    .join("\n      ");
}

function section(id, title, body) {
  return `<section class="section" aria-labelledby="${id}">
  <h2 class="section__title" id="${id}">${esc(title)}</h2>
  <div class="section__body">
    ${body}
  </div>
</section>`;
}

// ── Assemble ──────────────────────────────────────────────────────────

const portrait = await buildPortrait(content.portrait);
const resume = content.resume;
const role = content.role ?? "";
const description = `${content.name}${role ? ` — ${role}` : ""}, ${content.location}.`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${esc(description)}">
  <title>${esc(content.name)}${role ? ` — ${esc(role)}` : ""}</title>
  <link rel="canonical" href="https://kohan.sh/">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <div class="page">
    <header class="hero">
      <div class="hero__text">
        <p class="hero__eyebrow">${esc([content.location, role].filter(Boolean).join(" · "))}</p>
        <h1 class="hero__name">${esc(content.name)}</h1>
        <p class="hero__tagline">${esc(content.tagline)}</p>
        <p class="hero__bio">${linkify(content.bio)}.</p>
      </div>
      ${
        portrait
          ? `<img class="hero__portrait" src="${esc(portrait.src)}" alt="${esc(portrait.alt)}" width="${portrait.width}" height="${portrait.height}" fetchpriority="high">`
          : ""
      }
    </header>

    <nav class="actions" aria-label="Contact and documents">
      ${
        resume
          ? `<a class="button" href="${esc(resume.href)}" download>
        <span>${esc(resume.label)}</span>
        <span class="button__meta">${esc(resume.meta)}</span>
      </a>`
          : ""
      }
      <div class="actions__links">
        <a class="link" href="mailto:${esc(content.email)}">email</a>
        ${renderLinks(content.links)}
      </div>
    </nav>

    <main id="main">
      ${section("experience", "Experience", content.experience.map(renderExperience).join("\n"))}
      ${section("research", "Research & Community", content.research.map(renderResearch).join("\n"))}
      ${section("education", "Education", content.education.map(renderEducation).join("\n"))}
      ${section("skills", "Skills", `<dl class="skills">\n  ${renderSkills(content.skills)}\n</dl>`)}
    </main>

    <footer class="footer">
      <div class="table-tennis" data-table-tennis>
        <div class="table-tennis__intro">
          <h2 class="section__title" id="table-tennis">Table tennis</h2>
          <p>Made it to the bottom. First to 5.</p>
        </div>
        <canvas class="table-tennis__canvas" width="640" height="360" aria-labelledby="table-tennis"
                role="img" aria-describedby="table-tennis-help" tabindex="0"></canvas>
        <p class="table-tennis__help" id="table-tennis-help">
          Move with the pointer, or focus the table and use <kbd>&uarr;</kbd> <kbd>&darr;</kbd>.
        </p>
      </div>
      <p class="footer__note">${esc(content.name)} · ${esc(content.location)}</p>
    </footer>
  </div>

  <script type="module" src="./src/main.ts"></script>
</body>
</html>
`;

writeFileSync(OUT_PATH, html);
console.log(`\n  ✓ Generated index.html (${(html.length / 1024).toFixed(1)} KB)`);
