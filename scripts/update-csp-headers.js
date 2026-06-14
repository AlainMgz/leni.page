import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

function getAllHtmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    statSync(full).isDirectory()
      ? files.push(...getAllHtmlFiles(full))
      : entry.endsWith('.html') && files.push(full);
  }
  return files;
}

const hashes = new Set();
for (const file of getAllHtmlFiles('./dist')) {
  const html = readFileSync(file, 'utf8');
  const regex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const content = m[1].trim();
    if (content) hashes.add(`'sha256-${createHash('sha256').update(content).digest('base64')}'`);
  }
}

const csp = [
  `default-src 'none'`,
  `script-src 'self' ${[...hashes].join(' ')}`,
  `style-src 'self'`,
  `style-src-attr 'none'`,
  `img-src 'self' data:`,
  `font-src 'self'`,
  `connect-src 'self'`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'none'`,
].join('; ');

const headers = `/*
  Content-Security-Policy: ${csp}
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
`;

writeFileSync('dist/_headers', headers);
console.log(`✓ _headers written with ${hashes.size} script hashes`);
