import { readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync, mkdirSync, statSync } from "fs";
import { resolve, join, basename, extname } from "path";

// sharp ships prebuilt per-platform binaries. This repo gets run from both
// Windows and WSL against the same node_modules on /mnt/c, so whichever OS
// installed last is the only one that can load it. Logo optimisation is a
// nice-to-have, not a reason to block the dev server - fall back to copying
// the originals through unresized.
let sharp = null;
try {
  ({ default: sharp } = await import("sharp"));
} catch (error) {
  console.warn(`  ! sharp unavailable (${error.code ?? "load failed"}) - copying logos unoptimised.`);
  console.warn(`    To fix: pnpm install (from this OS), or see supportedArchitectures in package.json.`);
}

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT_PATH = join(ROOT, "content.json");
const LOGOS_DIR = join(ROOT, "logos");
const PUBLIC_DIR = join(ROOT, "public");
const IMG_DIR = join(PUBLIC_DIR, "img");
const OUT_PATH = join(ROOT, "index.html");

const content = JSON.parse(readFileSync(CONTENT_PATH, "utf-8"));

function esc(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeHeroBio(str) {
  if (str == null) return "";
  return String(str).replace(/—/g, "-");
}

function linkify(str) {
  if (str == null) return "";
  return esc(str).replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" rel="noreferrer">$1</a>'
  );
}

function range(str) {
  return esc(str).replace(/\s*-\s*/g, "–");
}

function items(str) {
  return String(str ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const LOGO_PX = 18;

// ── Command block ─────────────────────────────────────────────────────────
// A hand-placed asset, not a generated one, so it lives at public/ root
// rather than public/img/ - that directory is gitignored as build output and
// anything dropped in it would never reach the deployed site.
//
// No loading="lazy": it sits inside the first viewport, at the foot of the
// hero, so deferring it would only make it pop in late.
//
// Both files are true 16x16 - the browser only ever scales UP, which
// `image-rendering: pixelated` keeps crisp. Downscaling pixel art to an
// arbitrary height drops rows unevenly and looks ragged.
const COMMAND_BLOCK_SRC = "/command-block.gif";
const COMMAND_BLOCK_STILL = "/command-block.png";

// ── Block textures ────────────────────────────────────────────────────────
// Real Minecraft assets, committed under public/textures/ rather than
// generated: mirrored from InventivetalentDev/minecraft-assets (1.20.1).
// They are Mojang's textures, used here as fan art.
//
// The directory is the source of truth - drop a 16x16 png in and it joins the
// rotation, no code change. destroy_stage_N are the game's own break overlay
// frames, so the fracture is the real animation rather than an imitation.

const TEXTURE_DIR = join(PUBLIC_DIR, "textures");

function readTextures() {
  if (!existsSync(TEXTURE_DIR)) return { names: [], cracks: [] };

  const files = readdirSync(TEXTURE_DIR).filter((f) => f.endsWith(".png"));

  const names = files
    .filter((f) => !f.startsWith("destroy_stage_"))
    .sort()
    .map((f) => `/textures/${f}`);

  const cracks = files
    .filter((f) => f.startsWith("destroy_stage_"))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
    .map((f) => `/textures/${f}`);

  console.log(`  ✓ Textures: ${names.length} blocks, ${cracks.length} break frames`);
  return { names, cracks };
}

const textures = readTextures();

/**
 * Renders the greeting, turning a [bracketed] run into the block. Only that
 * run gets a texture - "Hi" is near enough to square that one 16x16 tile maps
 * onto it as a single block, which is the whole idea; stretching one tile
 * across "Hi! I'm Kenneth" would just smear it.
 */
function renderGreeting(text) {
  const match = String(text ?? "").match(/^(.*?)\[([^\]]+)\](.*)$/);
  if (!match || textures.names.length === 0) {
    return esc(String(text ?? "").replace(/[[\]]/g, ""));
  }

  const [, before, word, after] = match;

  // The first texture is inlined as a data URI rather than referenced by path.
  // It is painted the instant the element is styled, and `url()` inside a CSS
  // custom property is invisible to the preload scanner - so a path would not
  // even start downloading until styles are computed, by which point
  // `color: transparent` has already applied and the word has gone blank.
  // Inlining removes the request entirely. It costs ~350 bytes; the visible
  // flash of missing text is worth more than that.
  const first = join(TEXTURE_DIR, basename(textures.names[0]));
  const inlined = `data:image/png;base64,${readFileSync(first).toString("base64")}`;

  return (
    esc(before) +
    `<span class="brk" data-textures="${esc(textures.names.join(","))}"` +
    ` data-cracks="${esc(textures.cracks.join(","))}"` +
    ` style="--tex: url('${inlined}')">${esc(word)}</span>` +
    esc(after)
  );
}

// The animated front face, built from Minecraft's own command_block_front
// sprite strip (16x64, four keyframes) with the tweens its .mcmeta asks for
// (frametime 10 ticks, interpolate true) baked in - a 2s loop, same as the
// game. See the note by COMMAND_BLOCK_SRC for why it is a gif.
//
// <picture> serves the static first frame under prefers-reduced-motion: a gif
// animates regardless of CSS, so it is the only way to actually honour that.
const commandBlockMarkup = `<picture>
          <source srcset="${COMMAND_BLOCK_STILL}" media="(prefers-reduced-motion: reduce)">
          <img class="block" src="${COMMAND_BLOCK_SRC}" alt="" width="16" height="16" decoding="async">
        </picture>`;

async function buildLogos() {
  const map = new Map();
  if (!existsSync(LOGOS_DIR)) return map;

  mkdirSync(join(IMG_DIR, "logos"), { recursive: true });

  const files = readdirSync(LOGOS_DIR).filter((f) => /\.(png|jpe?g|gif|webp)$/i.test(f));

  for (const file of files) {
    const name = basename(file, extname(file));
    const before = statSync(join(LOGOS_DIR, file)).size;

    if (!sharp) {
      copyFileSync(join(LOGOS_DIR, file), join(IMG_DIR, "logos", file));
      map.set(file, `/img/logos/${file}`);
      console.log(`  · Logo: ${file} copied as-is (${(before / 1024).toFixed(1)} KB)`);
      continue;
    }

    const outName = `${name}.webp`;
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

function entry({ date, title, source, sourceLogo, sourceUrl, body, meta, gpa }) {
  const logo = sourceLogo && logos.has(sourceLogo)
    ? `<img class="entry__logo" src="${esc(logos.get(sourceLogo))}" alt="" width="18" height="18" loading="lazy">`
    : "";
  const sourceMarkup = sourceUrl
    ? `<a class="entry__org" href="${esc(sourceUrl)}" rel="noreferrer">${esc(source)}</a>`
    : `<span>${esc(source)}</span>`;

  return `<article class="entry">
  <div class="entry__date">${range(date)}</div>
  <div class="entry__main">
    <h3 class="entry__title">${esc(title)}</h3>
    ${source ? `<p class="entry__source">${logo}${sourceMarkup}</p>` : ""}
    ${gpa ? `<p class="entry__gpa">GPA ${esc(gpa)}</p>` : ""}
    ${body ? `<p class="entry__body">${linkify(body)}</p>` : ""}
    ${meta ? `<ul class="tags">${items(meta).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
  </div>
</article>`;
}

const renderExperience = (e) =>
  entry({ date: e.date, title: e.role, source: e.company, sourceLogo: e.logo, sourceUrl: e.url, body: e.description, meta: e.tech });

const renderResearch = (r) =>
  entry({ date: r.org, title: r.title, body: r.detail });

const renderEducation = (e) =>
  entry({ date: e.date, title: e.school, source: e.degree, body: e.awards, gpa: e.gpa, meta: e.coursework });

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

function renderPhotos(photos = []) {
  return photos
    .filter((photo) => typeof photo?.src === "string" && photo.src.trim())
    .map((photo) => {
      const src = `/portraits/${basename(photo.src.trim())}`;
      const alt = photo.alt ?? content.name;
      return `<img src="${esc(src)}" alt="${esc(alt)}" width="480" height="600" loading="lazy">`;
    })
    .join("\n        ");
}

function section(id, title, body) {
  return `<section class="section" aria-labelledby="${id}">
  <h2 class="section__title" id="${id}">${esc(title)}</h2>
  <div class="section__body">
    ${body}
  </div>
</section>`;
}

const resume = content.resume;
const role = content.role ?? "";
const description = [content.name, role, content.location].filter(Boolean).join(" · ");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${esc(description)}">
  <title>${esc(content.name)}${role ? ` · ${esc(role)}` : ""}</title>
  <link rel="canonical" href="https://kohan.sh/">
  <!-- Favicons are pre-upscaled with nearest-neighbour: browsers ignore
       image-rendering on tab icons, so a bare 16x16 gets smoothed into mush on
       a hidpi display. 16 covers 1x, 32 covers 2x, 180 is the iOS home screen
       (flattened, because iOS composites transparency onto black). -->
  <link rel="icon" type="image/png" sizes="16x16" href="/command-block.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#ffffff">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <div class="page">
    <header class="hero">
      <div class="hero__photos">
        ${renderPhotos(content.photos)}
      </div>
      <div class="hero__title">
        <h1 class="hero__name">${renderGreeting(content.greeting ?? content.name)}</h1>
      </div>
      <p class="hero__role">${esc([content.location, role].filter(Boolean).join(" · "))}</p>
      <p class="hero__bio">${linkify(normalizeHeroBio(content.bio))}.</p>
      <nav class="actions" aria-label="Contact and documents">
        ${
          resume
            ? `<a class="button" href="${esc(resume.href)}" target="_blank" rel="noreferrer">${esc(resume.label)}</a>`
            : ""
        }
        <div class="actions__links">
          <a class="link" href="mailto:${esc(content.email)}">email</a>
          ${renderLinks(content.links)}
        </div>
      </nav>
      <div class="hero__block" aria-hidden="true">
        ${commandBlockMarkup}
      </div>
    </header>

    <main id="main">
      ${section("experience", "Experience", content.experience.map(renderExperience).join("\n"))}
      ${section("research", "Research & Community", content.research.map(renderResearch).join("\n"))}
      ${section("education", "Education", content.education.map(renderEducation).join("\n"))}
      ${section("skills", "Skills", `<dl class="skills">\n  ${renderSkills(content.skills)}\n</dl>`)}
    </main>

    <footer class="footer">
      <p class="footer__note">${esc(content.name)} · ${esc(content.location)}</p>
    </footer>
  </div>

  <script type="module" src="./src/main.ts"></script>
</body>
</html>
`;

writeFileSync(OUT_PATH, html);
console.log(`\n  ✓ Generated index.html (${(html.length / 1024).toFixed(1)} KB)`);
