// encoder.js — Multi-format encoder with smart WebP option
//
// Public API:
//   encodeImage(canvas, { format, quality, originalSize, originalType })
//     → { blob, mime, ext, quality, attempts }
//
// format values:
//   'webp-smart' : adaptive quality WebP (default)
//   'webp'       : WebP at fixed quality
//   'png'        : lossless PNG
//   'jpeg'       : JPEG at fixed quality (no alpha)
//   'auto'       : keep original mime (falls back to WebP smart for unknown)

const EXT_BY_MIME = {
  'image/webp': 'webp',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/avif': 'avif',
};

export function mimeToExt(mime) {
  return EXT_BY_MIME[mime] || 'webp';
}

/**
 * Single-shot canvas → Blob conversion (works for both OffscreenCanvas and HTMLCanvasElement).
 */
async function canvasToBlob(canvas, mime, quality) {
  if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
    return await canvas.convertToBlob({ type: mime, quality });
  }
  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob-failed'))),
      mime,
      quality
    );
  });
}

/**
 * Smart WebP: pick a target size ratio band based on the original size,
 * then iterate quality up/down (max 4 attempts) to land inside it.
 */
async function smartWebP(canvas, originalSize) {
  const qMin = 0.72, qMax = 0.95, qStart = 0.85, maxAttempts = 4;

  let targetLo, targetHi;
  if (originalSize < 100 * 1024)          { targetLo = 0.55; targetHi = 0.95; }
  else if (originalSize < 1024 * 1024)    { targetLo = 0.30; targetHi = 0.65; }
  else if (originalSize < 5 * 1024 * 1024){ targetLo = 0.18; targetHi = 0.45; }
  else                                    { targetLo = 0.10; targetHi = 0.30; }

  let quality = qStart, attempts = 0;
  let bestBlob = null, bestQuality = quality, bestScore = Infinity;

  while (attempts < maxAttempts) {
    attempts++;
    const blob = await canvasToBlob(canvas, 'image/webp', quality);
    const ratio = blob.size / Math.max(originalSize, 1);

    let score;
    if (ratio >= targetLo && ratio <= targetHi) score = 0;
    else if (ratio > targetHi) score = ratio - targetHi;
    else score = targetLo - ratio;

    if (score < bestScore) {
      bestScore = score; bestBlob = blob; bestQuality = quality;
    }
    if (score === 0) break;

    if (ratio > targetHi) {
      const step = ratio > targetHi * 1.5 ? 0.10 : 0.06;
      quality = Math.max(qMin, quality - step);
    } else {
      if (quality >= qMax) break;
      const step = ratio < targetLo * 0.5 ? 0.08 : 0.04;
      quality = Math.min(qMax, quality + step);
    }
  }

  return { blob: bestBlob, mime: 'image/webp', ext: 'webp', quality: bestQuality, attempts };
}

/**
 * Main encode dispatcher.
 */
export async function encodeImage(canvas, opts) {
  const {
    format = 'webp-smart',
    quality = 0.9,
    originalSize = 0,
    originalType = '',
  } = opts || {};

  if (format === 'webp-smart') {
    return await smartWebP(canvas, originalSize || 1);
  }

  let mime;
  if (format === 'webp') mime = 'image/webp';
  else if (format === 'png') mime = 'image/png';
  else if (format === 'jpeg') mime = 'image/jpeg';
  else if (format === 'auto') {
    // Use original type if known and encodable; otherwise WebP smart
    const ok = ['image/webp','image/png','image/jpeg'].includes(originalType);
    if (ok) mime = originalType;
    else return await smartWebP(canvas, originalSize || 1);
  } else {
    mime = 'image/webp';
  }

  const q = mime === 'image/png' ? undefined : quality;
  const blob = await canvasToBlob(canvas, mime, q);
  return { blob, mime, ext: mimeToExt(mime), quality: q ?? 1, attempts: 1 };
}
