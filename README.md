<div align="center">

# Frame Studio — Images Template

**Apply a frame/template to multiple images and download them as a ZIP**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CDN-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![RTL](https://img.shields.io/badge/Direction-RTL-success)](https://en.wikipedia.org/wiki/Right-to-left)
[![No Build Step](https://img.shields.io/badge/Build-None-brightgreen)]()

</div>

---

## 📖 About

A lightweight, **dependency-free** web tool that lets you batch-apply a visual frame template to many images at once and download all the results as a single ZIP file. RTL-first, Persian UI, dark theme by default.

> Just open the HTML file in your browser — no server, no install, no build step.

---

## 🚀 Getting Started

### Quick Start
```bash
# Clone the repo
git clone https://github.com/Yaldaj19/images-template.git
cd images-template

# Open in your browser (any modern browser works)
start app.html       # Windows
open app.html        # macOS
xdg-open app.html    # Linux
```

That's it. No dependencies to install. No build step. Everything is loaded via CDN.

### Optional: serve locally
If your browser blocks local file access, run a tiny static server:
```bash
# Python
python -m http.server 8000

# Node
npx serve .
```
Then visit `http://localhost:8000/app.html`.

---

## 🛠 Tech Stack

| Layer | Tool |
|---|---|
| Markup | HTML5 |
| Styling | Tailwind CSS (via CDN) + custom CSS |
| Fonts | Inter + Vazirmatn (Google Fonts) |
| Logic | Vanilla JavaScript |
| ZIP packaging | [JSZip](https://stuk.github.io/jszip/) (CDN) |

---

## 📂 Project Structure

```
images-template/
├── app.html         # Main entry point — open this in browser
├── assets/          # Images, frame templates
├── scripts/         # JavaScript modules
└── styles/          # Custom CSS
```

---

## ✨ Features

- 🖼️ **Batch processing** — apply a frame to many images at once
- 📦 **ZIP download** — all framed images bundled into one file
- 🌙 **Dark theme** with animated mesh background
- 🌐 **RTL & Persian** by default (Vazirmatn font)
- ⚡ **Zero dependencies** to install — pure browser app
- 📱 Responsive UI

---

## 🌐 Browser Support

Works on all modern browsers: Chrome, Firefox, Edge, Safari (latest 2 versions).
