// ui.js — Toasts, progress bar, render helpers

import { t, formatNumber, formatDuration } from './i18n.js';

/* ============ Toasts ============ */
const TOAST_DURATION = 4000;
const toastContainer = () => document.getElementById('toast-container');

export function showToast(message, kind = 'info') {
  const container = toastContainer();
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  const icon = kind === 'error' ? '!' : kind === 'success' ? '✓' : 'i';
  el.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="flex-1">${escapeHtml(message)}</span>
  `;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('toast-out');
    setTimeout(() => el.remove(), 250);
  }, TOAST_DURATION);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ============ Progress overlay ============ */
const $progress = () => document.getElementById('progress-overlay');
const $progressFill = () => document.getElementById('progress-fill');
const $progressPct = () => document.getElementById('progress-pct');
const $progressSub = () => document.getElementById('progress-sub');
const $statDone = () => document.getElementById('stat-done');
const $statSpeed = () => document.getElementById('stat-speed');
const $statEta = () => document.getElementById('stat-eta');

let progressStartTime = 0;

export function showProgress(total) {
  progressStartTime = performance.now();
  $progress().classList.remove('hidden');
  $progressFill().style.width = '0%';
  $progressPct().textContent = '0%';
  $statDone().textContent = `0 ${t('progress.ofTotal')} ${formatNumber(total)}`;
  $statSpeed().textContent = '—';
  $statEta().textContent = '—';
  $progressSub().textContent = '';
}

export function updateProgress(done, total, extra = '') {
  const pct = total > 0 ? (done / total) * 100 : 0;
  $progressFill().style.width = `${pct.toFixed(1)}%`;
  $progressPct().textContent = `${Math.round(pct)}%`;
  $statDone().textContent = `${formatNumber(done)} ${t('progress.ofTotal')} ${formatNumber(total)}`;

  const elapsed = (performance.now() - progressStartTime) / 1000;
  if (elapsed > 0.5 && done > 0) {
    const speed = done / elapsed;
    $statSpeed().textContent = `${speed.toFixed(1)} ${t('progress.imgsPerSec')}`;
    const remaining = (total - done) / speed;
    $statEta().textContent = formatDuration(remaining);
  }
  if (extra) $progressSub().textContent = extra;
}

export function setProgressSub(text) {
  $progressSub().textContent = text;
}

export function hideProgress() {
  $progress().classList.add('hidden');
}

/* ============ Frame preview render ============ */
export function renderFrameState(state) {
  const empty = document.getElementById('frame-empty');
  const preview = document.getElementById('frame-preview');

  if (!state.frameFile) {
    empty.classList.remove('hidden');
    preview.classList.add('hidden');
    return;
  }

  empty.classList.add('hidden');
  preview.classList.remove('hidden');
  document.getElementById('frame-thumb-img').src = state.framePreviewUrl;
  document.getElementById('frame-name').textContent = state.frameFile.name;
  const meta = state.frameMeta;
  document.getElementById('frame-meta').textContent =
    `${meta.width}×${meta.height} · ${formatNumber(meta.sizeKB)} ${t('unit.kb')}`;
}

/* ============ Images grid render ============ */
export function renderImagesState(state, { onRemove }) {
  const empty = document.getElementById('images-empty');
  const grid = document.getElementById('images-grid');
  const toolbar = document.getElementById('images-toolbar');
  const countBadge = document.getElementById('images-count');
  const added = document.getElementById('images-added');

  if (state.images.length === 0) {
    empty.classList.remove('hidden');
    grid.classList.add('hidden');
    toolbar.classList.add('hidden');
    countBadge.classList.add('hidden');
    grid.innerHTML = '';
    return;
  }

  empty.classList.add('hidden');
  grid.classList.remove('hidden');
  toolbar.classList.remove('hidden');
  countBadge.classList.remove('hidden');
  countBadge.textContent = `${formatNumber(state.images.length)} / ${formatNumber(500)}`;
  added.textContent = formatNumber(state.images.length);

  // Rebuild grid (could be optimized for incremental, but 500 max is fine)
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const img of state.images) {
    const wrap = document.createElement('div');
    wrap.className = 'thumb-item';
    wrap.innerHTML = `
      <img src="${img.thumbUrl}" alt="" loading="lazy" />
      <button class="thumb-remove" data-id="${img.id}" aria-label="${escapeHtml(t('images.removeOne'))}">
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    `;
    wrap.querySelector('.thumb-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(e.currentTarget.dataset.id);
      onRemove(id);
    });
    frag.appendChild(wrap);
  }
  grid.appendChild(frag);
}

/* ============ Process button state ============ */
export function updateProcessButton(state) {
  const btn = document.getElementById('process-btn');
  const hint = document.getElementById('process-hint');
  const hasFrame = !!state.frameFile;
  const hasImages = state.images.length > 0;
  const ready = hasFrame && hasImages;

  btn.disabled = !ready;
  if (!hasFrame && !hasImages) hint.textContent = t('action.hint');
  else if (!hasFrame) hint.textContent = t('action.hintNoFrame');
  else if (!hasImages) hint.textContent = t('action.hintNoImages');
  else hint.textContent = t('action.hintReady');
}
