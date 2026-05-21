/* ============================================================
   جایگذاری الگو/امضا روی تصویر (Image Overlay Tool) — Single-file bundle
   Works with both file:// and http:// protocols.
   No ES module imports, no module workers.
   ============================================================ */
(function () {
  'use strict';

  /* ========== Version + auto cache purge ==========
     Every build bumps APP_VERSION. On boot, if the stored version is older
     (or missing), we wipe all frame-studio.* localStorage keys and any
     CacheStorage caches owned by this app. This guarantees a clean slate
     for THIS tool only — without touching unrelated sites' data. */
  const APP_VERSION = '2026.05.12.e';
  const VERSION_KEY = 'frame-studio.version';

  function purgeAppStorage() {
    try {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf('frame-studio.') === 0 && k !== VERSION_KEY) toRemove.push(k);
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
    try {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((n) => { if (n.indexOf('frame-studio') === 0) caches.delete(n); });
        });
      }
    } catch (_) {}
  }

  function checkVersionAndPurge() {
    try {
      const saved = localStorage.getItem(VERSION_KEY);
      if (saved !== APP_VERSION) {
        purgeAppStorage();
        localStorage.setItem(VERSION_KEY, APP_VERSION);
      }
    } catch (_) {}
  }
  checkVersionAndPurge();

  /* ========== i18n ========== */
  const dictionaries = {
    fa: {
      'app.title': 'جایگذاری الگو/امضا روی تصویر',
      'app.name': 'جایگذاری الگو/امضا روی تصویر',
      'app.tagline': 'اعمال فریم روی دسته‌ای از تصاویر',
      'hero.title': 'تصاویرتو با یک کلیک فریم بزن',
      'hero.subtitle': 'فریم رو آپلود کن، تصاویرت رو پشت بنداز، و یک فایل ZIP تمیز با فرمت دلخواه بگیر.',
      'step.frame.title': '۱. انتخاب فریم',
      'step.images.title': '۲. انتخاب تصاویر',
      'step.settings.title': '۳. تنظیمات',
      'step.settings.optional': 'اختیاری — در صورت عدم تنظیم، موارد پیش‌فرض اعمال می‌شود',
      'frame.cta': 'فریم رو بکش اینجا یا کلیک کن',
      'frame.hint': 'پیشنهاد: PNG شفاف با ابعاد یکسان با تصاویر هدف',
      'images.cta': 'تصاویر رو اینجا بنداز یا کلیک کن',
      'images.hint': 'حداکثر ۳۰۰ تصویر — همه فرمت‌ها',
      'upload.processing': 'در حال بارگذاری تصاویر…',
      'images.added': 'افزوده شد:',
      'images.addMore': 'افزودن بیشتر',
      'images.clearAll': 'پاک کردن همه',
      'images.removeOne': 'حذف',
      'settings.fit.label': 'روش جا‌گذاری تصویر (وقتی ابعاد متفاوته)',
      'settings.fit.coverFull': 'Cover — برش وسط (پیشنهادی)',
      'settings.fit.containFull': 'Contain — با حاشیه',
      'settings.fit.stretchFull': 'Stretch — کشیدن',
      'settings.format.label': 'فرمت خروجی',
      'settings.format.webpSmart': 'WebP هوشمند (پیشنهادی)',
      'settings.format.webp': 'WebP (کیفیت دستی)',
      'settings.format.png': 'PNG (با شفافیت)',
      'settings.format.jpeg': 'JPEG (کیفیت دستی)',
      'settings.format.auto': 'حفظ فرمت اصلی',
      'settings.format.quality': 'کیفیت:',
      'settings.naming.label': 'نام‌گذاری فایل خروجی',
      'settings.naming.original': 'نام اصلی تصویر (پیشنهادی)',
      'settings.naming.pattern': 'الگوی سفارشی',
      'settings.naming.tokens': 'پارامترها:',
      'settings.naming.tokenN': 'شماره',
      'settings.naming.tokenName': 'نام اصلی',
      'settings.naming.tokenDate': 'تاریخ',
      'action.process': 'پردازش و دانلود ZIP',
      'action.processing': 'در حال پردازش…',
      'action.hint': 'ابتدا یک فریم و حداقل یک تصویر اضافه کن',
      'action.hintReady': 'آماده! دکمه بالا رو بزن',
      'action.hintNoFrame': 'فریم انتخاب نشده',
      'action.hintNoImages': 'تصویری انتخاب نشده',
      'progress.title': 'در حال پردازش…',
      'progress.done': 'انجام‌شده:',
      'progress.speed': 'سرعت:',
      'progress.eta': 'باقی‌مونده:',
      'progress.ofTotal': 'از',
      'progress.imgsPerSec': 'تصویر/ث',
      'progress.zipping': 'در حال ساخت فایل ZIP…',
      'toast.frameRequired': 'اول یک فریم انتخاب کن',
      'toast.tooManyImages': 'حداکثر ۳۰۰ تصویر مجاز است',
      'toast.invalidFile': 'فایل {name} پشتیبانی نمی‌شه',
      'toast.fileTooLarge': 'فایل {name} از ۲۰ مگابایت بزرگ‌تره',
      'toast.processComplete': 'پردازش کامل شد — ZIP در حال دانلود',
      'toast.processError': 'خطایی رخ داد: {msg}',
      'toast.itemsFailed': '{n} تصویر پردازش نشد',
      'footer.credit': 'ساخته شده به وسیله YJ19',
      'footer.local': 'کاملاً محلی، هیچ فایلی به سرور ارسال نمی‌شه',
      'unit.seconds': 'ث',
      'unit.minutes': 'دق',
      'unit.kb': 'KB',
      'unit.mb': 'MB',
    },
    en: {
      'app.title': 'Image Overlay Tool',
      'app.name': 'Image Overlay Tool',
      'app.tagline': 'Apply a frame to many images at once',
      'hero.title': 'Frame all your images in one click',
      'hero.subtitle': 'Upload your frame, drop in your images, and get a clean ZIP in your preferred format.',
      'step.frame.title': '1. Choose frame',
      'step.images.title': '2. Choose images',
      'step.settings.title': '3. Settings',
      'step.settings.optional': 'Optional — defaults will be used if left untouched',
      'frame.cta': 'Drop your frame here or click to browse',
      'frame.hint': 'Tip: transparent PNG matching your target dimensions',
      'images.cta': 'Drop images here or click to browse',
      'images.hint': 'Up to 300 images — all formats supported',
      'upload.processing': 'Loading images…',
      'images.added': 'Added:',
      'images.addMore': 'Add more',
      'images.clearAll': 'Clear all',
      'images.removeOne': 'Remove',
      'settings.fit.label': 'How to fit images (when sizes differ)',
      'settings.fit.coverFull': 'Cover — crop center (recommended)',
      'settings.fit.containFull': 'Contain — with padding',
      'settings.fit.stretchFull': 'Stretch — fill',
      'settings.format.label': 'Output format',
      'settings.format.webpSmart': 'WebP smart (recommended)',
      'settings.format.webp': 'WebP (manual quality)',
      'settings.format.png': 'PNG (lossless)',
      'settings.format.jpeg': 'JPEG (manual quality)',
      'settings.format.auto': 'Keep original format',
      'settings.format.quality': 'Quality:',
      'settings.naming.label': 'Output filename',
      'settings.naming.original': 'Use original name (recommended)',
      'settings.naming.pattern': 'Custom pattern',
      'settings.naming.tokens': 'Tokens:',
      'settings.naming.tokenN': 'number',
      'settings.naming.tokenName': 'original name',
      'settings.naming.tokenDate': 'date',
      'action.process': 'Process & Download ZIP',
      'action.processing': 'Processing…',
      'action.hint': 'Add a frame and at least one image first',
      'action.hintReady': 'Ready! Hit the button above',
      'action.hintNoFrame': 'No frame selected',
      'action.hintNoImages': 'No images selected',
      'progress.title': 'Processing…',
      'progress.done': 'Done:',
      'progress.speed': 'Speed:',
      'progress.eta': 'ETA:',
      'progress.ofTotal': 'of',
      'progress.imgsPerSec': 'img/s',
      'progress.zipping': 'Building ZIP file…',
      'toast.frameRequired': 'Please select a frame first',
      'toast.tooManyImages': 'Maximum 300 images allowed',
      'toast.invalidFile': 'File {name} is not supported',
      'toast.fileTooLarge': 'File {name} exceeds 20 MB',
      'toast.processComplete': 'Done — your ZIP is downloading',
      'toast.processError': 'Error: {msg}',
      'toast.itemsFailed': '{n} image(s) failed to process',
      'footer.credit': 'Made by YJ19',
      'footer.local': 'fully local — nothing leaves your browser',
      'unit.seconds': 's',
      'unit.minutes': 'm',
      'unit.kb': 'KB',
      'unit.mb': 'MB',
    },
  };

  const LS_LANG = 'frame-studio.lang';
  const LS_THEME = 'frame-studio.theme';
  let currentLang = 'fa';
  const langListeners = new Set();

  function safeLS(fn) { try { return fn(); } catch (_) { return null; } }

  function detectInitialLang() {
    const saved = safeLS(() => localStorage.getItem(LS_LANG));
    if (saved && dictionaries[saved]) return saved;
    // Default is always Persian (no auto-detect from browser)
    return 'fa';
  }

  function t(key, params) {
    const dict = dictionaries[currentLang] || dictionaries.fa;
    let s = dict[key] != null ? dict[key] : key;
    if (params) for (const k in params) s = s.replace('{' + k + '}', String(params[k]));
    return s;
  }

  function setLang(lang) {
    if (!dictionaries[lang]) return;
    currentLang = lang;
    safeLS(() => localStorage.setItem(LS_LANG, lang));
    applyI18nDom();
    langListeners.forEach((fn) => fn(lang));
  }

  function applyI18nDom() {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-option]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n-option'));
    });
    document.title = t('app.title');
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.langBtn === currentLang);
    });
  }

  function initI18n() {
    currentLang = detectInitialLang();
    applyI18nDom();
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.dataset.langBtn));
    });
  }

  function formatNumber(n) {
    return currentLang === 'fa' ? n.toLocaleString('fa-IR') : n.toLocaleString('en-US');
  }
  function formatDuration(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '—';
    if (seconds < 60) return Math.round(seconds) + ' ' + t('unit.seconds');
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return m + ' ' + t('unit.minutes') + ' ' + s + ' ' + t('unit.seconds');
  }

  /* ========== Theme ========== */
  function detectInitialTheme() {
    const saved = safeLS(() => localStorage.getItem(LS_THEME));
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  }
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    safeLS(() => localStorage.setItem(LS_THEME, theme));
  }
  function initTheme() {
    setTheme(detectInitialTheme());
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }

  /* ========== File handling ========== */
  const MAX_IMAGES = 300;
  const MAX_FILE_SIZE = 20 * 1024 * 1024;
  const VALID_EXTS = ['png','jpg','jpeg','webp','gif','bmp','avif','ico','tif','tiff','svg'];

  function isImageFile(file) {
    if (file.type && /^image\//i.test(file.type)) return true;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    return VALID_EXTS.indexOf(ext) >= 0;
  }

  async function decodeImage(file) {
    try {
      const bmp = await createImageBitmap(file);
      return {
        source: bmp, width: bmp.width, height: bmp.height,
        close: () => bmp.close && bmp.close(),
      };
    } catch (_) {
      const url = URL.createObjectURL(file);
      try {
        const img = await new Promise((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error('decode-failed'));
          el.src = url;
        });
        return {
          source: img, width: img.naturalWidth, height: img.naturalHeight,
          close: () => URL.revokeObjectURL(url),
        };
      } catch (err) {
        URL.revokeObjectURL(url);
        throw err;
      }
    }
  }

  async function makeThumbnail(file, maxSize) {
    maxSize = maxSize || 160;
    const decoded = await decodeImage(file);
    const ratio = Math.min(maxSize / decoded.width, maxSize / decoded.height, 1);
    const w = Math.max(1, Math.round(decoded.width * ratio));
    const h = Math.max(1, Math.round(decoded.height * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(decoded.source, 0, 0, w, h);
    const url = canvas.toDataURL('image/webp', 0.7);
    decoded.close();
    return url;
  }

  const state = {
    frameFile: null,
    frameMeta: null,
    framePreviewUrl: null,
    images: [],
  };
  let nextImgId = 1;

  async function setFrame(file, onUpdate) {
    if (!isImageFile(file)) { showToast(t('toast.invalidFile', { name: file.name }), 'error'); return false; }
    if (file.size > MAX_FILE_SIZE) { showToast(t('toast.fileTooLarge', { name: file.name }), 'error'); return false; }
    try {
      const decoded = await decodeImage(file);
      state.frameFile = file;
      state.frameMeta = {
        width: decoded.width, height: decoded.height,
        sizeKB: Math.round(file.size / 1024),
      };
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

  function clearFrame(onUpdate) {
    state.frameFile = null;
    state.frameMeta = null;
    state.framePreviewUrl = null;
    onUpdate && onUpdate();
  }

  function showUploadLoader(total) {
    const el = document.getElementById('upload-loader');
    if (!el) return;
    el.classList.remove('hidden');
    el.style.display = 'flex';
    document.getElementById('upload-count').textContent =
      formatNumber(0) + ' / ' + formatNumber(total);
    document.getElementById('upload-fill').style.width = '0%';
  }
  function updateUploadLoader(done, total) {
    document.getElementById('upload-count').textContent =
      formatNumber(done) + ' / ' + formatNumber(total);
    const pct = total > 0 ? (done / total) * 100 : 0;
    document.getElementById('upload-fill').style.width = pct.toFixed(1) + '%';
  }
  function hideUploadLoader() {
    const el = document.getElementById('upload-loader');
    if (!el) return;
    el.classList.add('hidden');
    el.style.display = '';
  }

  async function addImages(files, onUpdate) {
    const arr = Array.from(files);
    if (state.images.length + arr.length > MAX_IMAGES) {
      showToast(t('toast.tooManyImages'), 'error');
      const room = Math.max(0, MAX_IMAGES - state.images.length);
      arr.length = room;
      if (room === 0) return;
    }

    const total = arr.length;
    showUploadLoader(total);
    // Yield once so the loader actually paints before heavy work starts
    await new Promise((r) => setTimeout(r, 0));

    let processed = 0;
    for (const file of arr) {
      if (!isImageFile(file)) {
        showToast(t('toast.invalidFile', { name: file.name }), 'error');
        processed++; updateUploadLoader(processed, total); continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast(t('toast.fileTooLarge', { name: file.name }), 'error');
        processed++; updateUploadLoader(processed, total); continue;
      }
      try {
        const thumbUrl = await makeThumbnail(file);
        state.images.push({ id: nextImgId++, file, name: file.name, size: file.size, thumbUrl });
      } catch (err) {
        showToast(t('toast.invalidFile', { name: file.name }), 'error');
      }
      processed++;
      updateUploadLoader(processed, total);
      // Update grid every 5 items and yield to keep UI responsive
      if (processed % 5 === 0) {
        onUpdate && onUpdate();
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    hideUploadLoader();
    onUpdate && onUpdate();
  }

  function removeImage(id, onUpdate) {
    const idx = state.images.findIndex((it) => it.id === id);
    if (idx >= 0) state.images.splice(idx, 1);
    onUpdate && onUpdate();
  }
  function clearImages(onUpdate) { state.images = []; onUpdate && onUpdate(); }

  /* ========== Drag-drop ========== */
  let dragGuardInstalled = false;
  function installGlobalDragGuard() {
    if (dragGuardInstalled) return;
    dragGuardInstalled = true;
    ['dragover', 'drop'].forEach((ev) => {
      window.addEventListener(ev, (e) => {
        const dt = e.dataTransfer;
        if (!dt) return;
        const hasFiles = Array.from(dt.types || []).indexOf('Files') >= 0;
        if (hasFiles) e.preventDefault();
      }, false);
    });
  }

  function wireDropZone(zoneEl, inputEl, onFiles) {
    installGlobalDragGuard();
    const open = () => {
      try { inputEl.click(); }
      catch (err) { console.error('failed to open file picker', err); }
    };
    zoneEl.addEventListener('click', (e) => {
      if (e.target.closest('.no-zone-click')) return;
      open();
    });
    zoneEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    inputEl.addEventListener('change', () => {
      if (inputEl.files && inputEl.files.length) {
        // CRITICAL: snapshot files into a real Array *before* resetting value,
        // because resetting value can empty the FileList reference.
        const files = Array.from(inputEl.files);
        inputEl.value = ''; // allow re-selecting the same file later
        onFiles(files);
      }
    });
    let dragDepth = 0;
    zoneEl.addEventListener('dragenter', (e) => {
      e.preventDefault(); dragDepth++; zoneEl.classList.add('drag-over');
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
      e.preventDefault(); e.stopPropagation();
      dragDepth = 0;
      zoneEl.classList.remove('drag-over');
      const files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length) onFiles(files);
    });
  }

  /* ========== Frame compositor ========== */
  function composite(image, frame, fitMode, canvas) {
    const W = frame.width, H = frame.height;
    if (!canvas) {
      canvas = typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(W, H)
        : document.createElement('canvas');
    }
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, W, H);
    const iw = image.width, ih = image.height;
    if (fitMode === 'stretch') {
      ctx.drawImage(image, 0, 0, W, H);
    } else if (fitMode === 'contain') {
      const r = Math.min(W / iw, H / ih);
      const dw = iw * r, dh = ih * r;
      ctx.drawImage(image, 0, 0, iw, ih, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      const r = Math.max(W / iw, H / ih);
      const sw = W / r, sh = H / r;
      ctx.drawImage(image, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, W, H);
    }
    ctx.drawImage(frame, 0, 0, W, H);
    return canvas;
  }

  /* ========== Encoder ========== */
  const EXT_BY_MIME = {
    'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg',
    'image/gif': 'gif', 'image/bmp': 'bmp', 'image/avif': 'avif',
  };
  function mimeToExt(mime) { return EXT_BY_MIME[mime] || 'webp'; }

  async function canvasToBlob(canvas, mime, quality) {
    if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
      return await canvas.convertToBlob({ type: mime, quality: quality });
    }
    return await new Promise((resolve, reject) => {
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob-failed')), mime, quality);
    });
  }

  async function smartWebP(canvas, originalSize) {
    const qMin = 0.72, qMax = 0.95, qStart = 0.85, maxAttempts = 4;
    let targetLo, targetHi;
    if (originalSize < 100 * 1024) { targetLo = 0.55; targetHi = 0.95; }
    else if (originalSize < 1024 * 1024) { targetLo = 0.30; targetHi = 0.65; }
    else if (originalSize < 5 * 1024 * 1024) { targetLo = 0.18; targetHi = 0.45; }
    else { targetLo = 0.10; targetHi = 0.30; }
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
      if (score < bestScore) { bestScore = score; bestBlob = blob; bestQuality = quality; }
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
    return { blob: bestBlob, mime: 'image/webp', ext: 'webp', quality: bestQuality };
  }

  async function encodeImage(canvas, opts) {
    const format = opts.format || 'webp-smart';
    const quality = typeof opts.quality === 'number' ? opts.quality : 0.9;
    const originalSize = opts.originalSize || 0;
    const originalType = opts.originalType || '';
    if (format === 'webp-smart') return await smartWebP(canvas, originalSize || 1);
    let mime;
    if (format === 'webp') mime = 'image/webp';
    else if (format === 'png') mime = 'image/png';
    else if (format === 'jpeg') mime = 'image/jpeg';
    else if (format === 'auto') {
      const ok = ['image/webp','image/png','image/jpeg'].indexOf(originalType) >= 0;
      if (ok) mime = originalType;
      else return await smartWebP(canvas, originalSize || 1);
    } else mime = 'image/webp';
    const q = mime === 'image/png' ? undefined : quality;
    const blob = await canvasToBlob(canvas, mime, q);
    return { blob: blob, mime: mime, ext: mimeToExt(mime), quality: q || 1 };
  }

  /* ========== Zip ========== */
  function createZip() {
    if (typeof window.JSZip === 'undefined') throw new Error('JSZip not loaded');
    return new window.JSZip();
  }

  function resolveName(mode, pattern, opts) {
    const base = (opts.originalName || ('image_' + (opts.index + 1))).replace(/\.[^.]+$/, '');
    if (mode === 'original') return base;
    const pad = String(opts.total).length;
    const n = String(opts.index + 1).padStart(pad, '0');
    const today = new Date();
    const date = today.getFullYear()
      + String(today.getMonth() + 1).padStart(2, '0')
      + String(today.getDate()).padStart(2, '0');
    return (pattern || 'framed_{n}').replace(/\{n\}/g, n).replace(/\{name\}/g, base).replace(/\{date\}/g, date);
  }

  function sanitize(name) {
    return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim() || 'image';
  }

  function addToZip(zip, basename, extension, blob, usedNames) {
    const safe = sanitize(basename);
    let final = safe + '.' + extension;
    let n = 1;
    while (usedNames.has(final)) { final = safe + '_' + n + '.' + extension; n++; }
    usedNames.add(final);
    zip.file(final, blob);
    return final;
  }

  async function finalizeAndDownload(zip, archiveName, onProgress) {
    const blob = await zip.generateAsync(
      { type: 'blob', compression: 'STORE' },
      (meta) => { if (onProgress) onProgress(meta.percent / 100); }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = archiveName || 'framed-images.zip';
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
  }

  /* ========== UI / Toasts / Progress ========== */
  const TOAST_DURATION = 4000;

  function showToast(message, kind) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast toast-' + (kind || 'info');
    const icon = kind === 'error' ? '!' : kind === 'success' ? '✓' : 'i';
    const safe = String(message).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
    el.innerHTML = '<span class="toast-icon">' + icon + '</span><span class="flex-1">' + safe + '</span>';
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('toast-out');
      setTimeout(() => el.remove(), 250);
    }, TOAST_DURATION);
  }

  let progressStartTime = 0;
  function showProgress(total) {
    progressStartTime = performance.now();
    document.getElementById('progress-overlay').classList.remove('hidden');
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-pct').textContent = '0%';
    document.getElementById('stat-done').textContent = '0 ' + t('progress.ofTotal') + ' ' + formatNumber(total);
    document.getElementById('stat-speed').textContent = '—';
    document.getElementById('stat-eta').textContent = '—';
    document.getElementById('progress-sub').textContent = '';
  }
  function updateProgress(done, total, extra) {
    const pct = total > 0 ? (done / total) * 100 : 0;
    document.getElementById('progress-fill').style.width = pct.toFixed(1) + '%';
    document.getElementById('progress-pct').textContent = Math.round(pct) + '%';
    document.getElementById('stat-done').textContent = formatNumber(done) + ' ' + t('progress.ofTotal') + ' ' + formatNumber(total);
    const elapsed = (performance.now() - progressStartTime) / 1000;
    if (elapsed > 0.5 && done > 0) {
      const speed = done / elapsed;
      document.getElementById('stat-speed').textContent = speed.toFixed(1) + ' ' + t('progress.imgsPerSec');
      const remaining = (total - done) / speed;
      document.getElementById('stat-eta').textContent = formatDuration(remaining);
    }
    if (extra) document.getElementById('progress-sub').textContent = extra;
  }
  function setProgressSub(text) { document.getElementById('progress-sub').textContent = text; }
  function hideProgress() { document.getElementById('progress-overlay').classList.add('hidden'); }

  function renderFrameState() {
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
      meta.width + '×' + meta.height + ' · ' + formatNumber(meta.sizeKB) + ' ' + t('unit.kb');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function renderImagesState(onRemove) {
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
    countBadge.textContent = formatNumber(state.images.length) + ' / ' + formatNumber(MAX_IMAGES);
    added.textContent = formatNumber(state.images.length);
    grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (const img of state.images) {
      const wrap = document.createElement('div');
      wrap.className = 'thumb-item';
      wrap.innerHTML =
        '<img src="' + img.thumbUrl + '" alt="" loading="lazy" />' +
        '<button class="thumb-remove" data-id="' + img.id + '" aria-label="' + escapeHtml(t('images.removeOne')) + '">' +
        '<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
        '</button>';
      wrap.querySelector('.thumb-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        onRemove(Number(e.currentTarget.dataset.id));
      });
      frag.appendChild(wrap);
    }
    grid.appendChild(frag);
  }

  function updateProcessButton() {
    const btn = document.getElementById('process-btn');
    const hint = document.getElementById('process-hint');
    const hasFrame = !!state.frameFile;
    const hasImages = state.images.length > 0;
    btn.disabled = !(hasFrame && hasImages);
    if (!hasFrame && !hasImages) hint.textContent = t('action.hint');
    else if (!hasFrame) hint.textContent = t('action.hintNoFrame');
    else if (!hasImages) hint.textContent = t('action.hintNoImages');
    else hint.textContent = t('action.hintReady');
  }

  function rerender() {
    renderFrameState();
    renderImagesState((id) => removeImage(id, rerender));
    updateProcessButton();
  }

  /* ========== Worker (inline via Blob URL) ========== */
  const WORKER_CODE = [
    'self.onmessage = async (e) => {',
    '  const msg = e.data;',
    '  if (msg.type === "init") {',
    '    self.frameBitmap = msg.frameBitmap;',
    '    self.fitMode = msg.fitMode || "cover";',
    '    self.format = msg.format || "webp-smart";',
    '    self.quality = typeof msg.quality === "number" ? msg.quality : 0.9;',
    '    self.canvas = new OffscreenCanvas(self.frameBitmap.width, self.frameBitmap.height);',
    '    self.postMessage({ type: "ready" });',
    '    return;',
    '  }',
    '  if (msg.type === "update") {',
    '    if (msg.fitMode) self.fitMode = msg.fitMode;',
    '    if (msg.format) self.format = msg.format;',
    '    if (typeof msg.quality === "number") self.quality = msg.quality;',
    '    return;',
    '  }',
    '  if (msg.type === "process") {',
    '    const { id, imageBitmap, originalSize, originalType } = msg;',
    '    try {',
    '      const W = self.frameBitmap.width, H = self.frameBitmap.height;',
    '      const ctx = self.canvas.getContext("2d");',
    '      ctx.imageSmoothingEnabled = true;',
    '      ctx.imageSmoothingQuality = "high";',
    '      ctx.clearRect(0, 0, W, H);',
    '      const iw = imageBitmap.width, ih = imageBitmap.height;',
    '      const fm = self.fitMode;',
    '      if (fm === "stretch") {',
    '        ctx.drawImage(imageBitmap, 0, 0, W, H);',
    '      } else if (fm === "contain") {',
    '        const r = Math.min(W/iw, H/ih);',
    '        const dw = iw*r, dh = ih*r;',
    '        ctx.drawImage(imageBitmap, 0, 0, iw, ih, (W-dw)/2, (H-dh)/2, dw, dh);',
    '      } else {',
    '        const r = Math.max(W/iw, H/ih);',
    '        const sw = W/r, sh = H/r;',
    '        ctx.drawImage(imageBitmap, (iw-sw)/2, (ih-sh)/2, sw, sh, 0, 0, W, H);',
    '      }',
    '      ctx.drawImage(self.frameBitmap, 0, 0, W, H);',
    '',
    '      const fmt = self.format;',
    '      let result;',
    '      async function blobAt(mime, q) { return await self.canvas.convertToBlob({ type: mime, quality: q }); }',
    '      if (fmt === "webp-smart") {',
    '        let lo, hi;',
    '        if (originalSize < 102400) { lo = 0.55; hi = 0.95; }',
    '        else if (originalSize < 1048576) { lo = 0.30; hi = 0.65; }',
    '        else if (originalSize < 5242880) { lo = 0.18; hi = 0.45; }',
    '        else { lo = 0.10; hi = 0.30; }',
    '        let q = 0.85, best = null, bestQ = q, bestScore = Infinity;',
    '        for (let i = 0; i < 4; i++) {',
    '          const b = await blobAt("image/webp", q);',
    '          const ratio = b.size / Math.max(originalSize, 1);',
    '          let s = ratio >= lo && ratio <= hi ? 0 : (ratio > hi ? ratio - hi : lo - ratio);',
    '          if (s < bestScore) { bestScore = s; best = b; bestQ = q; }',
    '          if (s === 0) break;',
    '          if (ratio > hi) q = Math.max(0.72, q - (ratio > hi * 1.5 ? 0.10 : 0.06));',
    '          else { if (q >= 0.95) break; q = Math.min(0.95, q + (ratio < lo * 0.5 ? 0.08 : 0.04)); }',
    '        }',
    '        result = { blob: best, mime: "image/webp", ext: "webp", quality: bestQ };',
    '      } else {',
    '        let mime;',
    '        if (fmt === "webp") mime = "image/webp";',
    '        else if (fmt === "png") mime = "image/png";',
    '        else if (fmt === "jpeg") mime = "image/jpeg";',
    '        else if (fmt === "auto") {',
    '          if (["image/webp","image/png","image/jpeg"].indexOf(originalType) >= 0) mime = originalType;',
    '          else mime = "image/webp";',
    '        } else mime = "image/webp";',
    '        const q = mime === "image/png" ? undefined : self.quality;',
    '        const b = await blobAt(mime, q);',
    '        const extMap = { "image/webp":"webp","image/png":"png","image/jpeg":"jpg" };',
    '        result = { blob: b, mime: mime, ext: extMap[mime] || "webp", quality: q || 1 };',
    '      }',
    '      imageBitmap.close && imageBitmap.close();',
    '      self.postMessage({ type: "done", id, blob: result.blob, mime: result.mime, ext: result.ext, quality: result.quality });',
    '    } catch (err) {',
    '      try { imageBitmap.close && imageBitmap.close(); } catch (_) {}',
    '      self.postMessage({ type: "error", id, message: (err && err.message) || "unknown" });',
    '    }',
    '  }',
    '};',
  ].join('\n');

  let workerBlobUrl = null;
  function getWorkerUrl() {
    if (!workerBlobUrl) {
      const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
      workerBlobUrl = URL.createObjectURL(blob);
    }
    return workerBlobUrl;
  }

  /* ========== App / orchestration ========== */
  let appBooted = false;
  function boot() {
    if (appBooted) return;
    appBooted = true;

    initTheme();
    initI18n();

    langListeners.add(() => rerender());

    // Wire frame
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

    // Wire images
    const imagesDrop = document.getElementById('images-drop');
    const imagesInput = document.getElementById('images-input');
    wireDropZone(imagesDrop, imagesInput, async (files) => {
      await addImages(files, rerender);
    });
    document.getElementById('images-add-more').addEventListener('click', (e) => {
      e.stopPropagation(); imagesInput.click();
    });
    document.getElementById('images-clear').addEventListener('click', (e) => {
      e.stopPropagation(); clearImages(rerender);
    });

    // Settings
    const fitModeSelect = document.getElementById('fit-mode');
    const formatSelect = document.getElementById('output-format');
    const qualityRow = document.getElementById('quality-row');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const namingMode = document.getElementById('naming-mode');
    const patternRow = document.getElementById('pattern-row');
    const patternInput = document.getElementById('naming-pattern');

    function syncFormatUi() {
      const f = formatSelect.value;
      const showQuality = (f === 'webp' || f === 'jpeg' || f === 'auto');
      qualityRow.classList.toggle('hidden', !showQuality);
    }
    function syncNamingUi() {
      patternRow.classList.toggle('hidden', namingMode.value !== 'pattern');
    }

    formatSelect.addEventListener('change', () => {
      syncFormatUi();
      workerPool.forEach((w) => w.postMessage({ type: 'update', format: formatSelect.value, quality: Number(qualitySlider.value) / 100 }));
    });
    qualitySlider.addEventListener('input', () => { qualityValue.textContent = qualitySlider.value + '%'; });
    qualitySlider.addEventListener('change', () => {
      workerPool.forEach((w) => w.postMessage({ type: 'update', quality: Number(qualitySlider.value) / 100 }));
    });
    namingMode.addEventListener('change', syncNamingUi);
    fitModeSelect.addEventListener('change', () => {
      workerPool.forEach((w) => w.postMessage({ type: 'update', fitMode: fitModeSelect.value }));
    });

    syncFormatUi();
    syncNamingUi();
    qualityValue.textContent = qualitySlider.value + '%';

    // Process button
    document.getElementById('process-btn').addEventListener('click', runJob);

    rerender();
  }

  /* ========== Job execution ========== */
  const workerPool = [];
  let isRunning = false;

  function poolSize() {
    return Math.max(2, Math.min(8, navigator.hardwareConcurrency || 4));
  }

  async function initWorkerPool(format, quality, fitMode) {
    workerPool.forEach((w) => w.terminate());
    workerPool.length = 0;
    const url = getWorkerUrl();
    const size = poolSize();
    for (let i = 0; i < size; i++) {
      workerPool.push(new Worker(url)); // classic worker (no module)
    }
    for (let i = 0; i < size; i++) {
      const decoded = await createImageBitmap(state.frameFile);
      const ready = new Promise((resolve) => {
        const onMsg = (e) => {
          if (e.data && e.data.type === 'ready') {
            workerPool[i].removeEventListener('message', onMsg);
            resolve();
          }
        };
        workerPool[i].addEventListener('message', onMsg);
      });
      workerPool[i].postMessage(
        { type: 'init', frameBitmap: decoded, fitMode: fitMode, format: format, quality: quality },
        [decoded]
      );
      await ready;
    }
  }

  async function runJob() {
    if (isRunning) return;
    if (!state.frameFile) { showToast(t('toast.frameRequired'), 'error'); return; }
    if (state.images.length === 0) return;

    isRunning = true;
    const processBtn = document.getElementById('process-btn');
    processBtn.disabled = true;
    processBtn.classList.add('is-loading');

    const fitMode = document.getElementById('fit-mode').value;
    const format = document.getElementById('output-format').value;
    const quality = Number(document.getElementById('quality-slider').value) / 100;
    const nameMode = document.getElementById('naming-mode').value;
    const namePattern = (document.getElementById('naming-pattern').value || '').trim() || 'framed_{n}';
    const total = state.images.length;

    showProgress(total);

    try {
      await initWorkerPool(format, quality, fitMode);
      const zip = createZip();
      const usedNames = new Set();
      const queue = state.images.map((img, index) => Object.assign({}, img, { index: index }));
      let nextIndex = 0, doneCount = 0, errorCount = 0;

      const loops = workerPool.map((worker) => (async function loop() {
        while (true) {
          const item = queue[nextIndex];
          if (!item) return;
          nextIndex++;
          try {
            const decoded = await decodeImage(item.file);
            let bitmap;
            if (decoded.source instanceof ImageBitmap) bitmap = decoded.source;
            else { bitmap = await createImageBitmap(decoded.source); decoded.close(); }
            const result = await new Promise((resolve, reject) => {
              const onMsg = (e) => {
                if (!e.data || e.data.id !== item.id) return;
                worker.removeEventListener('message', onMsg);
                if (e.data.type === 'done') resolve(e.data);
                else reject(new Error(e.data.message || 'worker-error'));
              };
              worker.addEventListener('message', onMsg);
              worker.postMessage(
                { type: 'process', id: item.id, imageBitmap: bitmap, originalSize: item.size, originalType: item.file.type || '' },
                [bitmap]
              );
            });
            const basename = resolveName(nameMode, namePattern, {
              index: item.index, total: total, originalName: item.name,
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
      })());

      await Promise.all(loops);

      if (errorCount > 0) showToast(t('toast.itemsFailed', { n: errorCount }), 'error');
      if (doneCount === 0) { hideProgress(); throw new Error('No images processed'); }

      setProgressSub(t('progress.zipping'));
      const archiveName = 'framed-images-' + Date.now() + '.zip';
      await finalizeAndDownload(zip, archiveName, (frac) => {
        updateProgress(total, total, Math.round(frac * 100) + '%');
      });
      showToast(t('toast.processComplete'), 'success');
    } catch (err) {
      console.error(err);
      showToast(t('toast.processError', { msg: (err && err.message) || 'unknown' }), 'error');
    } finally {
      hideProgress();
      workerPool.forEach((w) => w.terminate());
      workerPool.length = 0;
      isRunning = false;
      processBtn.classList.remove('is-loading');
      updateProcessButton();
    }
  }

  /* ========== Boot ========== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
