# Kenneth Chen - Portfolio

A minimalist, VS Code-inspired portfolio website built with Vite + TypeScript.

## 🎨 Design Philosophy

- **IDE Aesthetic**: VS Code Dark+ theme with syntax highlighting
- **FAANG Principles**: Clean hierarchy, performance-first, accessibility
- **3D ASCII Art**: Rotating torus knot animation using pure JavaScript
- **Terminal Integration**: Interactive terminal panel showing key info

## 🚀 Tech Stack

- **Framework**: Vite + Vanilla TypeScript
- **Styling**: Pure CSS (no frameworks)
- **Deployment**: Cloudflare Pages (static)
- **Build Output**: `dist/` folder

## 📦 Installation

```bash
npm install
```

## 🏃 Development

```bash
npm run dev
```

## 🔨 Build

```bash
npm run build
```

Output will be in `dist/` folder, ready for Cloudflare Pages.

## ☁️ Cloudflare Deployment

1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Build command: `npm run build`
4. Build output: `dist`
5. Deploy!

## 🎮 Features

- **5 Sections**: About, Experience, Competitions, Skills, Contact
- **3D Torus Knot**: Real-time ASCII rendering
- **Vim Navigation**: Press `j`/`k` to scroll, `1-5` for tabs
- **Interactive Tabs**: Click sidebar icons or tabs to switch sections
- **Terminal Panel**: Shows current status and focus
- **Syntax Highlighting**: C++, TypeScript, Python, JSON, Markdown styles

## 📄 Content

All portfolio data is in `src/main.ts` - easily editable.

## 📝 License

MIT
