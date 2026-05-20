// frame-compositor.js — Merge image + frame on canvas (3 fit modes)
//
// API:
//   composite({ image, frame, fitMode, canvas? }) → canvas
//
// image and frame can be: ImageBitmap | HTMLImageElement | HTMLCanvasElement
// fitMode: 'cover' | 'contain' | 'stretch'
// canvas: optional reusable canvas (OffscreenCanvas or HTMLCanvasElement)
//
// Output dimensions = frame dimensions. Frame is drawn on top of image.

export function composite({ image, frame, fitMode = 'cover', canvas }) {
  const W = frame.width;
  const H = frame.height;

  if (!canvas) {
    canvas = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(W, H)
      : document.createElement('canvas');
  }
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  // Better quality for downscales
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Clear (transparent) — important for "contain" mode
  ctx.clearRect(0, 0, W, H);

  // ----- 1) Draw image with selected fit mode -----
  const iw = image.width;
  const ih = image.height;

  if (fitMode === 'stretch') {
    ctx.drawImage(image, 0, 0, W, H);
  } else if (fitMode === 'contain') {
    const r = Math.min(W / iw, H / ih);
    const dw = iw * r;
    const dh = ih * r;
    const dx = (W - dw) / 2;
    const dy = (H - dh) / 2;
    ctx.drawImage(image, 0, 0, iw, ih, dx, dy, dw, dh);
  } else {
    // cover (default): scale to fill, crop center
    const r = Math.max(W / iw, H / ih);
    const sw = W / r;
    const sh = H / r;
    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, W, H);
  }

  // ----- 2) Draw frame on top -----
  ctx.drawImage(frame, 0, 0, W, H);

  return canvas;
}
