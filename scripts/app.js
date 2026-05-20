// app.js — Orchestrator: wires up modules, manages worker pool, runs the job

import { initI18n, t, onLangChange } from './i18n.js';
import { initTheme } from './theme.js';
import {
  state,
  setFrame,
  clearFrame,
  addImages,
  removeImage,
  clearImages,
  wireDropZone,
  decodeImage,
} from './file-handler.js';
import {
  showToast,
  showProgress,
  updateProgress,
  setProgressSub,
  hideProgress,
  renderFrameState,
  renderImagesState,
  updateProcessButton,
} from './ui.js';
import { createZip, addToZip, finalizeAndDownload, resolveName } from './zip-builder.js';

/* ============ Boot ============ */
initTheme();
initI18n();

onLangChange(() => {
  renderFrameState(state);
  renderImagesState(state, { onRemove: handleRemoveImage });
  updateProcessButton(state);
});

function rerender() {
  renderFrameState(state);
  renderImagesState(state, { onRemove: handleRemoveImage });
  updateProcessButton(state);
}

/* ============ Frame wiring ============ */
const frameDrop = document.getElementById('frame-drop');
const frameInput = document.getElementById('frame-input');
const frameClearBtn = document.getElementById('frame-clear');

wireDropZone(frameDrop, frameInput, async (files) => {
  const file = files[0];
  if (file) await setFrame(file, rerender);
});
frameClearBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  clearFrame(rerender);
});

/* ============ Images wiring ============ */
const imagesDrop = document.getElementById('images-drop');
const imagesInput = document.getElementById('images-input');
const imagesAddMore = document.getElementById('images-add-more');
const imagesClearBtn = document.getElementById('images-clear');

wireDropZone(imagesDrop, imagesInput, async (files) => {
  await addImages(files, rerender);
});
imagesAddMore.addEventListener('click', (e) => {
  e.stopPropagation();
  imagesInput.click();
});
imagesClearBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  clearImages(rerender);
});
function handleRemoveImage(id) { removeImage(id, rerender); }

/* ============ Settings ============ */
const fitModeSelect = document.getElementById('fit-mode');
const formatSelect = document.getElementById('output-format');
const qualityRow = document.getElementById('quality-row');
const qualitySlider = document.getElementById('quality-slider');
const qualityValue = document.getElementById('quality-value');
const namingMode = document.getElementById('naming-mode');
const patternRow = document.getElementById('pattern-row');
const patternInput = document.getElementById('naming-pattern');

function getFitMode() {
  return fitModeSelect.value || 'cover';
}
function getFormat()  { return formatSelect.value || 'webp-smart'; }
function getQuality() { return Number(qualitySlider.value) / 100; }
function getNamingMode()    { return namingMode.value || 'original'; }
function getNamingPattern() { return (patternInput.value || '').trim() || 'framed_{n}'; }

function syncFormatUi() {
  const f = getFormat();
  // Show quality slider for all lossy modes (hide for PNG and smart WebP which auto-tunes)
  const showQuality = (f === 'webp' || f === 'jpeg' || f === 'auto');
  qualityRow.classList.toggle('hidden', !showQuality);
}
function syncNamingUi() {
  patternRow.classList.toggle('hidden', getNamingMode() !== 'pattern');
}

formatSelect.addEventListener('change', () => {
  syncFormatUi();
  workerPool.forEach((w) =>
    w.postMessage({ type: 'update', format: getFormat(), quality: getQuality() })
  );
});
qualitySlider.addEventListener('input', () => {
  qualityValue.textContent = `${qualitySlider.value}%`;
});
qualitySlider.addEventListener('change', () => {
  workerPool.forEach((w) => w.postMessage({ type: 'update', quality: getQuality() }));
});
namingMode.addEventListener('change', syncNamingUi);

fitModeSelect.addEventListener('change', () => {
  workerPool.forEach((w) => w.postMessage({ type: 'update', fitMode: getFitMode() }));
});

syncFormatUi();
syncNamingUi();
qualityValue.textContent = `${qualitySlider.value}%`;

/* ============ Worker pool ============ */
const workerPool = [];

function poolSize() {
  return Math.max(2, Math.min(8, navigator.hardwareConcurrency || 4));
}

async function initWorkerPool(format, quality, fitMode) {
  workerPool.forEach((w) => w.terminate());
  workerPool.length = 0;

  const size = poolSize();
  for (let i = 0; i < size; i++) {
    const w = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    workerPool.push(w);
  }

  for (let i = 0; i < size; i++) {
    const decoded = await createImageBitmap(state.frameFile);
    const ready = new Promise((resolve) => {
      const onMessage = (e) => {
        if (e.data?.type === 'ready') {
          workerPool[i].removeEventListener('message', onMessage);
          resolve();
        }
      };
      workerPool[i].addEventListener('message', onMessage);
    });
    workerPool[i].postMessage(
      { type: 'init', frameBitmap: decoded, fitMode, format, quality },
      [decoded]
    );
    await ready;
  }
}

/* ============ Main process flow ============ */
const processBtn = document.getElementById('process-btn');
let isRunning = false;

processBtn.addEventListener('click', runJob);

async function runJob() {
  if (isRunning) return;
  if (!state.frameFile) { showToast(t('toast.frameRequired'), 'error'); return; }
  if (state.images.length === 0) return;

  isRunning = true;
  processBtn.disabled = true;
  const fitMode = getFitMode();
  const format = getFormat();
  const quality = getQuality();
  const nameMode = getNamingMode();
  const namePattern = getNamingPattern();
  const total = state.images.length;

  showProgress(total);

  try {
    await initWorkerPool(format, quality, fitMode);

    const zip = createZip();
    const usedNames = new Set();
    const queue = state.images.map((img, index) => ({ ...img, index }));
    let nextIndex = 0;
    let doneCount = 0;
    let errorCount = 0;

    const workerLoops = workerPool.map((worker) =>
      (async function loop() {
        while (true) {
          const item = queue[nextIndex];
          if (!item) return;
          nextIndex++;

          try {
            const decoded = await decodeImage(item.file);
            let bitmap;
            if (decoded.source instanceof ImageBitmap) {
              bitmap = decoded.source;
            } else {
              bitmap = await createImageBitmap(decoded.source);
              decoded.close();
            }

            const result = await new Promise((resolve, reject) => {
              const onMessage = (e) => {
                if (e.data?.id !== item.id) return;
                worker.removeEventListener('message', onMessage);
                if (e.data.type === 'done') resolve(e.data);
                else reject(new Error(e.data.message || 'worker-error'));
              };
              worker.addEventListener('message', onMessage);
              worker.postMessage(
                {
                  type: 'process',
                  id: item.id,
                  imageBitmap: bitmap,
                  originalSize: item.size,
                  originalType: item.file.type || '',
                },
                [bitmap]
              );
            });

            const basename = resolveName(nameMode, namePattern, {
              index: item.index,
              total,
              originalName: item.name,
            });
            addToZip(zip, basename, result.ext, result.blob, usedNames);
            doneCount++;
            updateProgress(doneCount + errorCount, total);
          } catch (err) {
            errorCount++;
            console.error('item failed', item.name, err);
            updateProgress(doneCount + errorCount, total);
          }
        }
      })()
    );

    await Promise.all(workerLoops);

    if (errorCount > 0) showToast(t('toast.itemsFailed', { n: errorCount }), 'error');
    if (doneCount === 0) { hideProgress(); throw new Error('No images processed'); }

    setProgressSub(t('progress.zipping'));
    const archiveName = `framed-images-${Date.now()}.zip`;
    await finalizeAndDownload(zip, archiveName, (frac) => {
      updateProgress(total, total, `${Math.round(frac * 100)}%`);
    });

    showToast(t('toast.processComplete'), 'success');
  } catch (err) {
    console.error(err);
    showToast(t('toast.processError', { msg: err?.message || 'unknown' }), 'error');
  } finally {
    hideProgress();
    workerPool.forEach((w) => w.terminate());
    workerPool.length = 0;
    isRunning = false;
    updateProcessButton(state);
  }
}

/* ============ Initial render ============ */
rerender();
