// file-handler.js — Drag-drop, validation, decode of any image format

import { t } from './i18n.js';
import { showToast } from './ui.js';

const MAX_IMAGES = 500;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const VALID_IMAGE_PATTERN = /^image\//i;
// Some browsers report empty type for AVIF/etc. fallback to extension
const VALID_EXTENSIONS = ['png','jpg','jpeg','webp','gif','bmp','avif','ico','tif','tiff','svg'];

function hasValidExtension(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  return VALID_EXTENSIONS.includes(ext);
}

export function isImageFile(file) {
  if (file.type && VALID_IMAGE_PATTERN.test(file.type)) return true;
  return hasValidExtension(file.name);
}

/**
 * Decode any image file to a bitmap-like object usable by canvas.
 * Tries createImageBitmap first, falls back to HTMLImageElement for unusual formats.
 * Returns { source, width, height, close() }
 */
export async function decodeImage(file) {
  // Path 1: createImageBitmap (fast, supports most formats)
  try {
    const bmp = await createImageBitmap(file);
    return {
      source: bmp,
      width: bmp.width,
      height: bmp.height,
      close: () => bmp.close && bmp.close(),
    };
  } catch (_) {
    // Path 2: HTMLImageElement fallback (covers SVG, weird MIME, some AVIF)
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error('decode-failed'));
        el.src = url;
      });
      return {
        source: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        close: () => URL.revokeObjectURL(url),
      };
    } catch (err) {
      URL.revokeObjectURL(url);
      throw err;
    }
  }
}

/**
 * Generate a small thumbnail data URL for grid display.
 * Uses canvas to downscale, keeps it tiny (~120px).
 */
export async function makeThumbnail(file, maxSize = 160) {
  const decoded = await decodeImage(file);
  const ratio = Math.min(maxSize / decoded.width, maxSize / decoded.height, 1);
  const w = Math.max(1, Math.round(decoded.width * ratio));
  const h = Math.max(1, Math.round(decoded.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(decoded.source, 0, 0, w, h);

  const url = canvas.toDataURL('image/webp', 0.7);
  decoded.close();
  return url;
}

/* ============ State for current selection ============ */

export const state = {
  frameFile: null,        // File
  frameMeta: null,        // { width, height, sizeKB }
  framePreviewUrl: null,  // data url for preview
  images: [],             // [{ id, file, name, size, thumbUrl }]
};

let nextId = 1;

/* ============ Frame handling ============ */

export async function setFrame(file, onUpdate) {
  if (!isImageFile(file)) {
    showToast(t('toast.invalidFile', { name: file.name }), 'error');
    return false;
  }
  if (file.size > MAX_FILE_SIZE) {
    showToast(t('toast.fileTooLarge', { name: file.name }), 'error');
    return false;
  }

  try {
    const decoded = await decodeImage(file);
    state.frameFile = file;
    state.frameMeta = {
      width: decoded.width,
      height: decoded.height,
      sizeKB: Math.round(file.size / 1024),
    };
    // Build a small preview canvas
    const canvas = document.createElement('canvas');
    const maxSize = 256;
    const ratio = Math.min(maxSize / decoded.width, maxSize / decoded.height, 1);
    canvas.width = Math.max(1, Math.round(decoded.width * ratio));
    canvas.height = Math.max(1, Math.round(decoded.height * ratio));
    canvas.getContext('2d').drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
    state.framePreviewUrl = canvas.toDataURL('image/webp', 0.85);
    decoded.close();

    onUpdate && onUpdate();
    return true;
  } catch (err) {
    showToast(t('toast.invalidFile', { name: file.name }), 'error');
    return false;
  }
}

export function clearFrame(onUpdate) {
  state.frameFile = null;
  state.frameMeta = null;
  state.framePreviewUrl = null;
  onUpdate && onUpdate();
}

/* ============ Images handling ============ */

export async function addImages(files, onUpdate) {
  const arr = Array.from(files);
  if (state.images.length + arr.length > MAX_IMAGES) {
    showToast(t('toast.tooManyImages'), 'error');
    // Trim to fit
    const room = Math.max(0, MAX_IMAGES - state.images.length);
    arr.length = room;
    if (room === 0) return;
  }

  // Process sequentially to control memory + give UI a chance to breathe
  let added = 0;
  for (const file of arr) {
    if (!isImageFile(file)) {
      showToast(t('toast.invalidFile', { name: file.name }), 'error');
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast(t('toast.fileTooLarge', { name: file.name }), 'error');
      continue;
    }

    try {
      const thumbUrl = await makeThumbnail(file);
      state.images.push({
        id: nextId++,
        file,
        name: file.name,
        size: file.size,
        thumbUrl,
      });
      added++;
      // Update UI every 5 images (smoother)
      if (added % 5 === 0) {
        onUpdate && onUpdate();
        await new Promise((r) => setTimeout(r, 0));
      }
    } catch (err) {
      showToast(t('toast.invalidFile', { name: file.name }), 'error');
    }
  }
  onUpdate && onUpdate();
}

export function removeImage(id, onUpdate) {
  const idx = state.images.findIndex((it) => it.id === id);
  if (idx >= 0) state.images.splice(idx, 1);
  onUpdate && onUpdate();
}

export function clearImages(onUpdate) {
  state.images = [];
  onUpdate && onUpdate();
}

/* ============ Drag-drop wiring ============ */

/**
 * Prevent the browser from navigating away when files are dropped
 * anywhere on the page (outside the drop zones).
 */
let globalDragGuardInstalled = false;
function installGlobalDragGuard() {
  if (globalDragGuardInstalled) return;
  globalDragGuardInstalled = true;
  ['dragover', 'drop'].forEach((ev) => {
    window.addEventListener(ev, (e) => {
      // Only block when dragging actual files (not text/links/etc.)
      const dt = e.dataTransfer;
      if (!dt) return;
      const hasFiles = Array.from(dt.types || []).includes('Files');
      if (hasFiles) e.preventDefault();
    }, false);
  });
}

/**
 * Wire a drop zone <div> to a hidden <input type="file">.
 *  - Click on zone (anywhere except .no-zone-click) → opens file picker
 *  - Enter/Space when zone is focused → opens file picker
 *  - Drag-and-drop files → passes them to onFiles
 */
export function wireDropZone(zoneEl, inputEl, onFiles) {
  installGlobalDragGuard();

  const open = () => {
    try { inputEl.click(); }
    catch (err) { console.error('failed to open file picker', err); }
  };

  zoneEl.addEventListener('click', (e) => {
    // Exclude inner buttons (like the X remove button) from triggering the picker
    if (e.target.closest('.no-zone-click')) return;
    open();
  });

  zoneEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });

  // When files are picked via the dialog
  inputEl.addEventListener('change', () => {
    if (inputEl.files && inputEl.files.length) {
      const files = inputEl.files;
      // Reset value FIRST so re-selecting the same file still fires change
      inputEl.value = '';
      onFiles(files);
    }
  });

  // Drag-and-drop (visual highlight + receive files)
  let dragDepth = 0;
  zoneEl.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragDepth++;
    zoneEl.classList.add('drag-over');
  });
  zoneEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  });
  zoneEl.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) zoneEl.classList.remove('drag-over');
  });
  zoneEl.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth = 0;
    zoneEl.classList.remove('drag-over');
    const files = e.dataTransfer?.files;
    if (files && files.length) onFiles(files);
  });
}
