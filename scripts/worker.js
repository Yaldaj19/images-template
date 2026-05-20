// worker.js — Web Worker for parallel image compositing + encoding
//
// Receives one image at a time. Frame ImageBitmap is cached after first message.
//
// Messages IN:
//   { type: 'init', frameBitmap, fitMode, format, quality }
//   { type: 'process', id, imageBitmap, originalSize, originalType }
//   { type: 'update', fitMode?, format?, quality? }
//
// Messages OUT:
//   { type: 'ready' }
//   { type: 'done', id, blob, mime, ext, width, height, quality }
//   { type: 'error', id, message }

import { composite } from './frame-compositor.js';
import { encodeImage } from './webp-encoder.js';

let frameBitmap = null;
let fitMode = 'cover';
let format = 'webp-smart';
let quality = 0.9;
let canvas = null;

self.onmessage = async (e) => {
  const msg = e.data;

  if (msg.type === 'init') {
    frameBitmap = msg.frameBitmap;
    fitMode = msg.fitMode || 'cover';
    format = msg.format || 'webp-smart';
    quality = typeof msg.quality === 'number' ? msg.quality : 0.9;
    canvas = new OffscreenCanvas(frameBitmap.width, frameBitmap.height);
    self.postMessage({ type: 'ready' });
    return;
  }

  if (msg.type === 'update') {
    if (msg.fitMode) fitMode = msg.fitMode;
    if (msg.format) format = msg.format;
    if (typeof msg.quality === 'number') quality = msg.quality;
    return;
  }

  if (msg.type === 'process') {
    const { id, imageBitmap, originalSize, originalType } = msg;
    try {
      composite({ image: imageBitmap, frame: frameBitmap, fitMode, canvas });

      const result = await encodeImage(canvas, {
        format,
        quality,
        originalSize,
        originalType,
      });

      imageBitmap.close && imageBitmap.close();

      self.postMessage({
        type: 'done',
        id,
        blob: result.blob,
        mime: result.mime,
        ext: result.ext,
        width: canvas.width,
        height: canvas.height,
        quality: result.quality,
      });
    } catch (err) {
      try { imageBitmap.close && imageBitmap.close(); } catch (_) {}
      self.postMessage({ type: 'error', id, message: err?.message || 'unknown' });
    }
  }
};
