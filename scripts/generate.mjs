/**
 * generate.mjs — Builds index.html from content.json + me.txt + logos/*
 *
 * Usage: node scripts/generate.mjs
 *
 * Content pipeline:
 *   content.json  →  all text content (bio, experience, skills, etc.)
 *   me.txt        →  hero ASCII face art (embedded as-is)
 *   logos/*       →  company logo images (displayed as-is)
 *
 * To add/update content:  edit content.json
 * To change your face:    edit me.txt (paste your ASCII art there)
 * To add a company logo:  drop an image in logos/ named to match the "logo" field
 *                         in content.json (e.g. "resumify.png")
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { resolve, join, basename } from "path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT_PATH = join(ROOT, "content.json");
const ME_PATH = join(ROOT, "me.txt");
const LOGOS_DIR = join(ROOT, "logos");
const OUT_PATH = join(ROOT, "index.html");

// ── ASCII art conversion ─────────────────────────────────────────────
// Block-style density ramp: fewer chars = cleaner shading, more artistic look.
// Dark → light. Chosen for good visual weight distribution in monospace.
const DENSITY = "&$Xx+;:. ";

// Aspect ratio correction: monospace chars are ~2x taller than wide.
const CHAR_ASPECT = 0.45;

// ── Contrast enhancement ─────────────────────────────────────────────

/**
 * Auto-contrast: stretch the pixel range so darkest → 0 and lightest → 255,
 * then apply a sigmoidal curve to push midtones toward the extremes.
 * This makes logos with pale backgrounds much more punchy.
 *
 * @param {Uint8Array} pixels  – mutable grayscale pixel buffer
 * @param {number} strength    – sigmoidal contrast (0 = off, 10 = extreme). Default 6.
 */
function enhanceContrast(pixels, strength = 6) {
  // 1. Find actual min/max, ignoring pure white padding
  let min = 255, max = 0;
  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i] < min) min = pixels[i];
    if (pixels[i] > max) max = pixels[i];
  }
  if (max === min) return; // flat image, nothing to do

  // 2. Linear stretch to full 0-255 range
  const range = max - min;
  for (let i = 0; i < pixels.length; i++) {
    pixels[i] = Math.round(((pixels[i] - min) / range) * 255);
  }

  // 3. Sigmoidal contrast — S-curve that darkens darks and brightens brights
  if (strength > 0) {
    const a = strength;
    // Precompute LUT for speed
    const lut = new Uint8Array(256);
    const sig = (x) => 1 / (1 + Math.exp(-a * (x - 0.5)));
    const s0 = sig(0); // sigmoid at input 0
    const s1 = sig(1); // sigmoid at input 1
    for (let v = 0; v < 256; v++) {
      const t = v / 255;                              // normalise to 0..1
      const s = sig(t);                               // apply sigmoid
      const norm = (s - s0) / (s1 - s0);              // normalise back to 0..1
      lut[v] = Math.round(Math.min(255, Math.max(0, norm * 255)));
    }
    for (let i = 0; i < pixels.length; i++) {
      pixels[i] = lut[pixels[i]];
    }
  }
}

// ── Atkinson dithering ───────────────────────────────────────────────

/**
 * Atkinson dithering — spreads only 6/8 of the quantisation error, which
 * intentionally "loses" some, producing crisper output with more defined
 * edges than Floyd-Steinberg. Ideal for ASCII art where we have very few
 * output levels.
 *
 * Modifies `pixels` in place.  w × h grayscale buffer.
 * `levels` is the number of output levels (= DENSITY.length).
 */
function atkinsonDither(pixels, w, h, levels) {
  // Work in floats for accuracy
  const buf = new Float32Array(pixels.length);
  for (let i = 0; i < pixels.length; i++) buf[i] = pixels[i];

  const step = 255 / (levels - 1);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const old = buf[i];
      const quantised = Math.round(old / step) * step;
      buf[i] = quantised;
      const err = (old - quantised) / 8; // Atkinson divides by 8

      // Spread 6/8 of error to 6 neighbours (1/8 each)
      if (x + 1 < w)                     buf[i + 1]     += err;
      if (x + 2 < w)                     buf[i + 2]     += err;
      if (y + 1 < h) {
        if (x - 1 >= 0)                  buf[i + w - 1] += err;
                                          buf[i + w]     += err;
        if (x + 1 < w)                   buf[i + w + 1] += err;
      }
      if (y + 2 < h)                     buf[i + 2 * w] += err;
    }
  }

  // Write back clamped
  for (let i = 0; i < pixels.length; i++) {
    pixels[i] = Math.round(Math.min(255, Math.max(0, buf[i])));
  }
}

// ── Pixel buffer → ASCII string ──────────────────────────────────────

function pixelsToAscii(pixels, w, h) {
  const rampLen = DENSITY.length - 1;
  let ascii = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const brightness = pixels[y * w + x];
      const idx = Math.round((brightness / 255) * rampLen);
      ascii += DENSITY[idx];
    }
    ascii += "\n";
  }
  return ascii.trimEnd();
}

// ── Public conversion functions ──────────────────────────────────────

/**
 * Convert an image to ASCII art with contrast enhancement + Atkinson dithering.
 */
async function imageToAscii(
  imagePath,
  { width = 60, contrast = 6, background = [255, 255, 255] } = {}
) {
  const meta = await sharp(imagePath).metadata();
  const aspectRatio = meta.height / meta.width;
  const height = Math.round(width * aspectRatio * CHAR_ASPECT);

  const bg = { r: background[0], g: background[1], b: background[2] };

  const { data } = await sharp(imagePath)
    .flatten({ background: bg })
    .grayscale()
    .resize(width, height, { fit: "fill", kernel: "lanczos3" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  enhanceContrast(pixels, contrast);
  atkinsonDither(pixels, width, height, DENSITY.length);

  return pixelsToAscii(pixels, width, height);
}

// ── ASCII art → PNG for mobile ───────────────────────────────────────

/**
 * Render ASCII art text into a PNG image using Sharp's SVG overlay.
 * This is needed because mobile browsers enforce minimum font sizes,
 * making sub-pixel ASCII art invisible.
 */
async function asciiToPng(asciiText, outputPath) {
  const lines = asciiText.split("\n");
  const rows = lines.length;
  const cols = Math.max(...lines.map((l) => l.length));

  const charW = 6;
  const charH = 6.3;
  const imgW = Math.ceil(cols * charW);
  const imgH = Math.ceil(rows * charH);

  // Build SVG with the ASCII text rendered in monospace
  const escapedLines = lines
    .map(
      (line, i) =>
        `<text x="0" y="${(i + 1) * charH}" fill="#999" font-family="'Courier New', monospace" font-size="${charH}px" xml:space="preserve">${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>`
    )
    .join("\n");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imgW}" height="${imgH}">
  <rect width="100%" height="100%" fill="#fafaf8"/>
  ${escapedLines}
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`  ✓ Face PNG: ${outputPath} (${imgW}×${imgH})`);
}

// ── Logo image function ─────────────────────────────────────────────

/**
 * Returns an HTML img tag for the logo image.
 * Logos are displayed as actual images, not ASCII art.
 */
async function logoToImg(imagePath) {
  const filename = basename(imagePath);
  return `<img src="./logos/${filename}" alt="${filename.replace(/\.[^.]+$/, "")} logo">`;
}

// ── Content loading ──────────────────────────────────────────────────

const content = JSON.parse(readFileSync(CONTENT_PATH, "utf-8"));

// Load me.txt (or convert me.png if no .txt exists)
const ME_PNG_PATH = join(ROOT, "me.png");
let meAscii = "";
if (existsSync(ME_PATH)) {
  meAscii = readFileSync(ME_PATH, "utf-8").trimEnd();
  console.log(`  ✓ Face: me.txt (${meAscii.split("\n").length} lines)`);
} else if (existsSync(ME_PNG_PATH)) {
  meAscii = await imageToAscii(ME_PNG_PATH, { width: 350 });
  console.log(`  ✓ Face: me.png → ASCII (${meAscii.split("\n").length} lines)`);
} else {
  console.warn("  ✗ No me.txt or me.png found — hero section will be empty");
}

// Generate mobile PNG from the ASCII art
const ME_IMG_PATH = join(ROOT, "public", "me-ascii.png");
if (meAscii) {
  await asciiToPng(meAscii, ME_IMG_PATH);
}

// Load and convert logos to img tags
const logos = {};
if (existsSync(LOGOS_DIR)) {
  const files = readdirSync(LOGOS_DIR).filter((f) =>
    /\.(png|jpe?g|gif|webp|bmp)$/i.test(f)
  );
  for (const file of files) {
    try {
      logos[file] = await logoToImg(join(LOGOS_DIR, file));
      console.log(`  ✓ Logo: ${file} → img tag`);
    } catch (err) {
      console.warn(`  ✗ Logo: ${file} failed: ${err.message}`);
    }
  }
}

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
    '<a href="$2">$1</a>'
  );
}

// ── HTML generation ──────────────────────────────────────────────────

function renderExperience(exp) {
  const hasLogo = exp.logo && logos[exp.logo];
  const companyHtml = hasLogo
    ? `    <div class="logo-company">${logos[exp.logo]} <span>${esc(exp.company)}</span></div>`
    : `    <div class="logo-company"><span>${esc(exp.company)}</span></div>`;

  return `<div class="entry">
    <div class="entry-header">
        <span class="job-title"><strong>${esc(exp.role)}</strong></span>
        <span class="dim">${esc(exp.date)}</span>
    </div>
${companyHtml}
    <p class="indent">${linkify(exp.description)}</p>
    <p class="indent tech">${esc(exp.tech)}</p>
</div>`;
}

function renderResearch(r) {
  return `<div class="entry">
    <div class="entry-header">
        <span><strong>${esc(r.title)}</strong></span>
        <span class="dim">${esc(r.org)}</span>
    </div>
    <p class="indent dim">${linkify(r.detail)}</p>
</div>`;
}

function renderEducation(edu) {
  return `<div class="entry edu">
    <div class="entry-header">
        <span><strong>${esc(edu.school)}</strong></span>
        <span class="dim">${esc(edu.date)}</span>
    </div>
    <p class="indent">${esc(edu.degree)}</p>
    <p class="indent dim">${esc(edu.awards)}</p>
</div>`;
}

function renderSkills(skills) {
  return Object.entries(skills)
    .map(
      ([label, value]) =>
        `    <tr><td class="label">${esc(label)}</td><td>${esc(value)}</td></tr>`
    )
    .join("\n");
}

function renderLinks(links) {
  return Object.entries(links)
    .map(([name, url]) => `<a href="${url}">${esc(name)}</a>`)
    .join(" / ");
}

// ── Assemble page ────────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${esc(content.name)} - Machine Learning Engineer">
    <title>${esc(content.name)}</title>
    <link rel="stylesheet" href="./src/style.css">
</head>
<body>
<div id="page">

<pre class="me" id="asciiMe">
${esc(meAscii)}
</pre>
<img class="me-img" src="./public/me-ascii.png" alt="ASCII art portrait" />

<h1>${esc(content.name)}</h1>
<p class="dim">${esc(content.tagline)}</p>

<p class="dim">${esc(content.email)} / ${renderLinks(content.links)}</p>

<p>
${linkify(content.bio)}
</p>

<hr>

<h2>Experience</h2>

${content.experience.map(renderExperience).join("\n\n")}

<hr>

<h2>Research &amp; Community</h2>

${content.research.map(renderResearch).join("\n\n")}

<hr>

<h2>Education</h2>

${content.education.map(renderEducation).join("\n\n")}

<hr>

<h2>Skills</h2>

<table>
${renderSkills(content.skills)}
</table>

</div>

<script type="module" src="./src/main.ts"></script>
</body>
</html>
`;

writeFileSync(OUT_PATH, html);
console.log(`\n  ✓ Generated index.html (${(html.length / 1024).toFixed(1)} KB)`);
