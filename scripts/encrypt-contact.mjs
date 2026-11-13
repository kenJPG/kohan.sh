// Encrypts Kenneth's private contact details so the static site can ship ONLY
// ciphertext. generate.html derives a key from the visitor's passphrase,
// decrypts the blob in the browser, and renders the resume with the real
// phone number. No worker, no server-side secret, no runtime Typst: the
// plaintext never touches the network or the host.
//
// The data to encrypt is NEVER hard-coded here - the committed file holds zero
// secrets. It is supplied at encrypt time, from the environment (preferred) or
// positionally on the command line:
//
//   CONTACT_PHONE="+65 XXXX XXXX" CONTACT_EMAIL="you@example.com" \
//   CONTACT_LOCATION="Singapore" PASSWORD="..." node scripts/encrypt-contact.mjs
//
//   node scripts/encrypt-contact.mjs "+65 XXXX XXXX" "you@example.com" "Singapore"
//
// Output: public/generate/contact.enc.json  (ciphertext only)
//
// The passphrase is a KEY, not a memorable password. It defaults to a random
// high-entropy string so the blob is secure against offline brute force (the
// salt is public by design); run again with PASSWORD="long passphrase" to
// trade that for something you can type.

import { writeFileSync, mkdirSync } from "fs";
import { resolve, join } from "path";
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const ITERATIONS = 600_000; // OWASP 2023 floor for PBKDF2-HMAC-SHA256
const KEY_BYTES = 32; // AES-256
const SALT_BYTES = 16;
const NONCE_BYTES = 12;

// A field is taken from the environment if set and non-empty, otherwise from
// its positional argument. Nothing is defaulted, so this script can never
// silently encrypt a stale or wrong value.
function field(name, envValue, argValue) {
  if (envValue !== undefined && envValue.trim() !== "") return envValue;
  if (argValue !== undefined && argValue.trim() !== "") return argValue;
  return null;
}

const phone = field("phone", process.env.CONTACT_PHONE, process.argv[2]);
const email = field("email", process.env.CONTACT_EMAIL, process.argv[3]);
const location = field("location", process.env.CONTACT_LOCATION, process.argv[4]);

if (phone === null && email === null && location === null) {
  console.error("  ✗ No contact data. Supply it via env or args, e.g.:");
  console.error("     CONTACT_PHONE=+65... CONTACT_EMAIL=... PASSWORD=... node scripts/encrypt-contact.mjs");
  process.exit(1);
}

// The sensitive fields that must stay private. Email also appears on the public
// site, so it is low-sensitivity, but it rides along so the generated resume is
// whole. The phone number is the sensitive bit - it is nowhere else in the repo.
const PLAINTEXT = { phone, email, location };

const b62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function randomPassphrase(len = 24) {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i += 1) out += b62[bytes[i] % b62.length];
  return out;
}

function b64(buf) {
  return Buffer.from(buf).toString("base64");
}

function deriveKey(password, salt) {
  return pbkdf2Sync(password, salt, ITERATIONS, KEY_BYTES, "sha256");
}

function encrypt(key, nonce, plaintextBuf) {
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const ct = Buffer.concat([cipher.update(plaintextBuf), cipher.final()]);
  return { ct, tag: cipher.getAuthTag() };
}

function decrypt(key, nonce, ct, tag) {
  const decipher = createDecipheriv("aes-256-gcm", key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

async function main() {
  const password = process.env.PASSWORD || randomPassphrase();
  const usesGenerated = !process.env.PASSWORD;

  const salt = randomBytes(SALT_BYTES);
  const nonce = randomBytes(NONCE_BYTES);
  const key = deriveKey(password, salt);

  const plaintextBuf = Buffer.from(JSON.stringify(PLAINTEXT), "utf-8");
  const { ct, tag } = encrypt(key, nonce, plaintextBuf);

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
  };

  const outDir = resolve(import.meta.dirname, "..", "public", "generate");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "contact.enc.json"), JSON.stringify(blob, null, 2) + "\n");

  // Round-trip: re-derive and decrypt to prove the blob is usable before we
  // hand it to the browser (and, if random, before we show the passphrase).
  const reKey = deriveKey(password, Buffer.from(blob.salt, "base64"));
  const decrypted = decrypt(
    reKey,
    Buffer.from(blob.nonce, "base64"),
    Buffer.from(blob.ciphertext, "base64"),
    Buffer.from(blob.tag, "base64")
  ).toString("utf-8");
  if (!timingSafeEqual(Buffer.from(decrypted), Buffer.from(JSON.stringify(PLAINTEXT)))) {
    throw new Error("round-trip verification failed");
  }

  console.log("\n  ✓ Encrypted contact details -> public/generate/contact.enc.json");
  console.log(`      kdf: ${blob.kdf}-${blob.hash}, ${blob.iterations.toLocaleString()} iterations, ${blob.cipher}`);
  if (usesGenerated) {
    console.log("\n  KEY (save this - it is the passphrase; re-run with PASSWORD=... to change it):");
    console.log(`    ${password}`);
  }
}

main().catch((err) => {
  console.error("\n  ✗", err.message);
  process.exit(1);
});
