// i18n.js — Bilingual fa/en with RTL/LTR toggle

const dictionaries = {
  fa: {
    'app.title': 'جایگذاری الگو/امضا روی تصویر',
    'app.name': 'جایگذاری الگو/امضا روی تصویر',
    'app.tagline': 'اعمال فریم روی دسته‌ای از تصاویر',
    'pwa.install': 'نصب اپ',
    'hero.title': 'تصاویرتو با یک کلیک فریم بزن',
    'hero.subtitle': 'فریم رو آپلود کن، تصاویرت رو پشت بنداز، و یک فایل ZIP تمیز با فرمت دلخواه بگیر.',

    'step.frame.title': '۱. انتخاب فریم',
    'step.images.title': '۲. انتخاب تصاویر',
    'step.settings.title': '۳. تنظیمات',

    'frame.cta': 'فریم رو بکش اینجا یا کلیک کن',
    'frame.hint': 'پیشنهاد: PNG شفاف با ابعاد یکسان با تصاویر هدف',
    'frame.loaded': 'فریم بارگذاری شد',

    'images.cta': 'تصاویر رو اینجا بنداز یا کلیک کن',
    'images.hint': 'حداکثر ۳۰۰ تصویر — همه فرمت‌ها',
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

    'footer.credit': 'ساخته شده به وسیله',

    'unit.seconds': 'ث',
    'unit.minutes': 'دق',
    'unit.kb': 'KB',
    'unit.mb': 'MB',
  },

  en: {
    'app.title': 'Image Overlay Tool',
    'app.name': 'Image Overlay Tool',
    'app.tagline': 'Apply a frame to many images at once',
    'pwa.install': 'Install app',
    'hero.title': 'Frame all your images in one click',
    'hero.subtitle': 'Upload your frame, drop in your images, and get a clean ZIP in your preferred format.',

    'step.frame.title': '1. Choose frame',
    'step.images.title': '2. Choose images',
    'step.settings.title': '3. Settings',

    'frame.cta': 'Drop your frame here or click to browse',
    'frame.hint': 'Tip: transparent PNG matching your target dimensions',
    'frame.loaded': 'Frame loaded',

    'images.cta': 'Drop images here or click to browse',
    'images.hint': 'Up to 300 images — all formats supported',
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

    'footer.credit': 'Made by',

    'unit.seconds': 's',
    'unit.minutes': 'm',
    'unit.kb': 'KB',
    'unit.mb': 'MB',
  }
};

const LS_KEY = 'frame-studio.lang';
let currentLang = 'fa';
const listeners = new Set();

function detectInitialLang() {
  const saved = localStorage.getItem(LS_KEY);
  if (saved && dictionaries[saved]) return saved;
  const nav = (navigator.language || 'fa').toLowerCase();
  if (nav.startsWith('en')) return 'en';
  return 'fa';
}

export function t(key, params = {}) {
  const dict = dictionaries[currentLang] || dictionaries.fa;
  let str = dict[key] ?? key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(`{${k}}`, String(v));
  }
  return str;
}

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (!dictionaries[lang]) return;
  currentLang = lang;
  localStorage.setItem(LS_KEY, lang);
  applyDom();
  listeners.forEach((fn) => fn(lang));
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function applyDom() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  // Plain text elements
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // <option> labels
  document.querySelectorAll('[data-i18n-option]').forEach((el) => {
    const key = el.getAttribute('data-i18n-option');
    el.textContent = t(key);
  });

  // Title
  document.title = t('app.title');

  // Language buttons active state
  document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.langBtn === currentLang);
  });
}

export function initI18n() {
  currentLang = detectInitialLang();
  applyDom();

  document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.langBtn));
  });
}

// Format helpers respect lang
export function formatNumber(n) {
  if (currentLang === 'fa') return n.toLocaleString('fa-IR');
  return n.toLocaleString('en-US');
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ${t('unit.kb')}`;
  return `${(bytes / 1024 / 1024).toFixed(2)} ${t('unit.mb')}`;
}

export function formatDuration(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '—';
  if (seconds < 60) return `${Math.round(seconds)} ${t('unit.seconds')}`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m} ${t('unit.minutes')} ${s} ${t('unit.seconds')}`;
}
