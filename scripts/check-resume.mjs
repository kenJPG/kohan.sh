// Guards the two rules that quietly break a resume PDF:
//   1. it must be exactly one page
//   2. it must actually be a PDF (a truncated or missing compile is easy to miss
//      on this host, where a missing path serves index.html with a 200)
//
// Runs in CI and locally via `pnpm resume:check`. Deliberately dependency-free
// so it works on a bare runner with no install step.

import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";

const ROOT = resolve(import.meta.dirname, "..");

const TARGETS = [
  { file: "public/kenneth-chen-ko-han-resume.pdf", paper: "A4" },
  { file: "public/kenneth-chen-ko-han-resume-letter.pdf", paper: "US Letter" },
];

/** Page count from the page-tree root, falling back to counting page objects. */
function pageCount(buf) {
  const counts = [...buf.toString("latin1").matchAll(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/g)]
    .map((m) => Number(m[1]));
  if (counts.length > 0) return Math.max(...counts);

  return (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
}

let failed = false;

for (const { file, paper } of TARGETS) {
  const path = join(ROOT, file);

  if (!existsSync(path)) {
    console.error(`  x ${file} — missing. Run \`pnpm resume:build\`.`);
    failed = true;
    continue;
  }

  const buf = readFileSync(path);

  if (!buf.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    console.error(`  x ${file} — not a PDF (bad magic bytes).`);
    failed = true;
    continue;
  }

  const pages = pageCount(buf);
  if (pages !== 1) {
    console.error(
      `  x ${file} — ${pages} pages, expected 1.\n` +
        `      Trim content, or lower the font size for ${paper} in resume/resume.typ.`
    );
    failed = true;
    continue;
  }

  console.log(`  ok ${file} — 1 page, ${(buf.length / 1024).toFixed(1)} KB (${paper})`);
}

if (failed) {
  process.exit(1);
}

console.log("\n  Resume PDFs OK.");
