// scripts/convert-shiki-inline-styles.js
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { createHash } from 'crypto';

function walkHtml(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (p.endsWith('.html')) out.push(p);
    else {
      try { if (readdirSync(p)) out.push(...walkHtml(p)); } catch {}
    }
  }
  return out;
}

function hashName(str, prefix = 'shiki') {
  return `${prefix}-${createHash('sha256').update(str).digest('hex').slice(0,10)}`;
}

const htmlFiles = walkHtml('./dist');
const cssRules = new Map();

for (const file of htmlFiles) {
  let html = readFileSync(file, 'utf8');

  // Find each <pre ...>...</pre>
  html = html.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, (preBlock) => {
    // Only process astro-code blocks
    const classMatch = preBlock.match(/class="([^"]*)"/i);
    if (!classMatch || !/astro-code/.test(classMatch[1])) return preBlock;

    // Replace style on the opening <pre ...>
    const openingTagMatch = preBlock.match(/^<pre\b([^>]*)>/i);
    if (openingTagMatch) {
      const openingTag = openingTagMatch[0];
      const styleMatch = openingTag.match(/\sstyle="([^"]*)"/i);
      if (styleMatch && styleMatch[1].trim()) {
        const style = styleMatch[1].trim();
        const name = hashName(style, 'shiki-pre');
        cssRules.set(`.${name}`, style);
        // append new class and remove inline style from opening tag
        const newOpening = openingTag
          .replace(/\sstyle="[^"]*"/i, '')
          .replace(/class="([^"]*)"/i, (m, cls) => `class="${cls} ${name}"`);
        preBlock = newOpening + preBlock.slice(openingTag.length);
      }
    }

    // Replace inline styles inside the preBlock (spans, code, etc.)
    preBlock = preBlock.replace(/\sstyle="([^"]*)"/gi, (m, styleStr) => {
      const style = styleStr.trim();
      if (!style) return '';
      const name = hashName(style, 'shiki-token');
      // create a class rule for token styles (scoped under .astro-code)
      cssRules.set(`.astro-code .${name}`, style);
      // remove the inline style and append the new class attribute
      // If the element already has a class attr, append; else add class attr.
      // We must replace the style attr occurrence with a marker to later append class
      return ` data-shiki-style="${name}"`;
    });

    // Now convert data-shiki-style attributes to proper class attr on elements
    preBlock = preBlock.replace(/(<\w+)([^>]*?)\sdata-shiki-style="([^"]+)"([^>]*?)(>)/gi,
      (m, tagStart, before, name, after, end) => {
        // if element already has class attr, append to it
        if (/class="/i.test(before + after)) {
          return (tagStart + before + after)
            .replace(/class="([^"]*)"/i, (m2, cls) => `class="${cls} ${name}"`) + end;
        } else {
          return `${tagStart}${before} class="${name}"${after}${end}`;
        }
      });

    return preBlock;
  });

  // Inject stylesheet link if not present
  if (!/href="\/_astro\/shiki-theme\.css"/i.test(html)) {
    html = html.replace(/<\/head>/i, '  <link rel="stylesheet" href="/_astro/shiki-theme.css">\n</head>');
  }

  writeFileSync(file, html, 'utf8');
}

// Emit CSS file
if (cssRules.size > 0) {
  const outDir = './dist/_astro';
  try { mkdirSync(outDir, { recursive: true }); } catch {}
  let css = '';
  for (const [selector, style] of cssRules) {
    // Normalize: ensure trailing semicolon
    const s = style.trim().endsWith(';') ? style.trim() : style.trim() + ';';
    css += `${selector} { ${s} }\n`;
  }
  writeFileSync(join(outDir, 'shiki-theme.css'), css, 'utf8');
  console.log(`✓ wrote shiki-theme.css with ${cssRules.size} rules to ${outDir}`);
} else {
  console.log('✓ no shiki inline styles found, no css emitted');
}
