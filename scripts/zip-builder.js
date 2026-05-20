// zip-builder.js — Build a ZIP with JSZip and trigger download
// JSZip is loaded as a global from index.html (CDN script tag).

export function createZip() {
  if (typeof window.JSZip === 'undefined') {
    throw new Error('JSZip not loaded — check CDN script');
  }
  return new window.JSZip();
}

/**
 * Build the final filename.
 *  - mode 'original': keep the input file's basename (sans extension)
 *  - mode 'pattern' : apply pattern tokens {n} {name} {date}
 */
export function resolveName(mode, pattern, { index, total, originalName }) {
  const base = (originalName || `image_${index + 1}`).replace(/\.[^.]+$/, '');

  if (mode === 'original') return base;

  const pad = String(total).length;
  const n = String(index + 1).padStart(pad, '0');
  const today = new Date();
  const date =
    today.getFullYear() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');

  return (pattern || 'framed_{n}')
    .replace(/\{n\}/g, n)
    .replace(/\{name\}/g, base)
    .replace(/\{date\}/g, date);
}

export function sanitize(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim() || 'image';
}

/**
 * Add a blob to the zip. Handles filename collisions by appending _1, _2, …
 */
export function addToZip(zip, basename, extension, blob, usedNames) {
  let safe = sanitize(basename);
  let final = `${safe}.${extension}`;
  let n = 1;
  while (usedNames.has(final)) {
    final = `${safe}_${n}.${extension}`;
    n++;
  }
  usedNames.add(final);
  zip.file(final, blob);
  return final;
}

export async function finalizeAndDownload(zip, archiveName = 'framed-images.zip', onProgress) {
  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'STORE', // images are already compressed
    },
    (meta) => {
      if (onProgress) onProgress(meta.percent / 100);
    }
  );
  triggerDownload(blob, archiveName);
}

function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}
