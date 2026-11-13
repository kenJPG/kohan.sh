// Builds the gated resume for /generate: compiles resume/resume.typ WITH the
// real phone number, then encrypts the resulting PDF so the static site ships
// only ciphertext. The page decrypts it in the browser and shows the PDF.
//
//   CONTACT_PHONE="+65 ..." PASSWORD="..." node scripts/encrypt-resume.mjs
//
// Output: public/generate/resume.enc.json  (ciphertext of the PDF bytes)
//
// The passphrase is a KEY, not a memorable password. It defaults to a random
// high-entropy string, printed on completion. The plaintext PDF is written to
// a temp file only, then deleted - nothing readable is left behind.

import { execFileSync } from "child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { resolve, join } from "path";
import { tmpdir } from "os";
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const ITERATIONS = 600_000; // OWASP 2023 floor for PBKDF2-HMAC-SHA256
const KEY_BYTES = 32; // AES-256
const SALT_BYTES = 16;
const NONCE_BYTES = 12;

const ROOT = resolve(import.meta.dirname, "..");
const RESUME_TYP = join(ROOT, "resume", "resume.typ");
const OUT_DIR = join(ROOT, "public", "generate");
const OUT = join(OUT_DIR, "resume.enc.json");
const TMP_PDF = join(tmpdir(), `gated-resume-${process.pid}.pdf`);

const phone = (process.env.CONTACT_PHONE || "").trim();
if (!phone) {
  console.error("  ✗ Set CONTACT_PHONE so the gated PDF carries the real number:");
  console.error('     CONTACT_PHONE="+65 ..." PASSWORD="..." node scripts/encrypt-resume.mjs');
  process.exit(1);
}

// 1. Compile the resume with the real phone into a temp PDF.
try {
  execFileSync("typst", ["compile", RESUME_TYP, "--input", `phone=${phone}`, TMP_PDF], {
    stdio: "inherit",
  });
} catch {
  console.error("  ✗ typst compile failed (is typst installed?).");
  process.exit(1);
}
const pdf = readFileSync(TMP_PDF);
rmSync(TMP_PDF, { force: true });

if (!pdf.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
  console.error("  ✗ compiled output is not a PDF.");
  process.exit(1);
}

// 2. Encrypt the PDF bytes with a passphrase-derived key (AES-256-GCM).
const b62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const randomPassphrase = (n = 24) => {
  const bytes = randomBytes(n);
  let out = "";
  for (let i = 0; i < n; i += 1) out += b62[bytes[i] % b62.length];
  return out;
};

const password = process.env.PASSWORD || randomPassphrase();
const usesGenerated = !process.env.PASSWORD;
const salt = randomBytes(SALT_BYTES);
const nonce = randomBytes(NONCE_BYTES);
const key = pbkdf2Sync(password, salt, ITERATIONS, KEY_BYTES, "sha256");

const cipher = createCipheriv("aes-256-gcm", key, nonce);
const ct = Buffer.concat([cipher.update(pdf), cipher.final()]);
const tag = cipher.getAuthTag();

const b64 = (buf) => Buffer.from(buf).toString("base64");
const blob = {
  kdf: "PBKDF2",
  hash: "SHA-256",
  iterations: ITERATIONS,
  keyBytes: KEY_BYTES,
  cipher: "AES-256-GCM",
  salt: b64(salt),
  nonce: b64(nonce),
  tag: b64(tag),
  ciphertext: b64(ct),
  pdfBytes: pdf.length,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, JSON.stringify(blob, null, 2) + "\n");

// 3. Round-trip: decrypt and compare to the source PDF before shipping.
const reKey = pbkdf2Sync(password, Buffer.from(blob.salt, "base64"), ITERATIONS, KEY_BYTES, "sha256");
const decipher = createDecipheriv("aes-256-gcm", reKey, Buffer.from(blob.nonce, "base64"));
decipher.setAuthTag(Buffer.from(blob.tag, "base64"));
const back = Buffer.concat([decipher.update(Buffer.from(blob.ciphertext, "base64")), decipher.final()]);
if (!timingSafeEqual(back, pdf)) {
  console.error("  ✗ round-trip verification failed.");
  process.exit(1);
}

// The old contact-JSON blob is obsolete once the PDF is the gated artifact.
rmSync(join(OUT_DIR, "contact.enc.json"), { force: true });

console.log("\n  ✓ Encrypted resume PDF -> public/generate/resume.enc.json");
console.log(`      ${(pdf.length / 1024).toFixed(1)} KB PDF, ${blob.kdf}-${blob.hash} ${ITERATIONS.toLocaleString()} iters, ${blob.cipher}`);
if (usesGenerated) {
  console.log("\n  KEY (save this - it is the passphrase; re-run with PASSWORD=... to change it):");
  console.log(`    ${password}`);
}
