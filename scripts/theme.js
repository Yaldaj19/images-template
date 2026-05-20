// theme.js — Dark/Light toggle with localStorage persistence

const LS_KEY = 'frame-studio.theme';

function detectInitial() {
  const saved = localStorage.getItem(LS_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'dark'; // default: dark
}

function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

export function setTheme(theme) {
  apply(theme);
  localStorage.setItem(LS_KEY, theme);
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

export function initTheme() {
  apply(detectInitial());
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.addEventListener('click', toggleTheme);
}
