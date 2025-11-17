# FlashMind - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
```
http://localhost:5173
```

---

## 📝 Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run type-check` | Check TypeScript types |
| `npm run format` | Format code with Prettier |

---

## 🔧 VS Code Quick Setup

### Run Setup Script

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Install Recommended Extensions

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Extensions: Show Recommended Extensions"
3. Click "Install All"

### Quick Tasks (Ctrl+Shift+B)

- **Start Dev Server** (Default)
- Build for Production
- Run Linter
- Type Check

---

## 🌐 Supabase Setup (Optional)

### 1. Create .env.local
```bash
cp .env.example .env.local
```

### 2. Add Your Credentials
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Get Credentials
1. Go to [app.supabase.com](https://app.supabase.com)
2. Open your project
3. Settings > API
4. Copy "Project URL" and "anon/public" key

---

## ⚡ VS Code Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `` Ctrl+` `` | Toggle terminal |
| `Ctrl+P` | Quick file open |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+Shift+B` | Run build task |
| `F5` | Start debugging |
| `Ctrl+Shift+F` | Search in files |
| `Shift+Alt+F` | Format document |

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
npx kill-port 5173
npm run dev
```

### Module Not Found
```bash
rm -rf node_modules
npm install
```

### TypeScript Errors in VS Code
1. Press `Ctrl+Shift+P`
2. Type "TypeScript: Restart TS Server"
3. Press Enter

---

## 📚 More Documentation

- **[VSCODE_SETUP.md](./VSCODE_SETUP.md)** - Detailed VS Code setup guide
- **[Guidelines.md](./Guidelines.md)** - Development guidelines
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Supabase backend setup
- **[README.md](./README.md)** - Full project documentation

---

## 🎯 Project Structure

```
flashmind/
├── App.tsx              # Main app component
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── Analytics.tsx
│   ├── StudyMode.tsx
│   ├── UploadStudio.tsx
│   └── ui/             # Shadcn UI components
├── styles/
│   └── globals.css     # Global styles
├── utils/              # Utility functions
└── supabase/           # Supabase functions
```

---

## ✅ Development Checklist

- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] VS Code extensions installed
- [ ] Environment variables configured (if using Supabase)
- [ ] Dev server running (`npm run dev`)
- [ ] Browser open at `http://localhost:5173`

---

**Need help?** Check the [VSCODE_SETUP.md](./VSCODE_SETUP.md) for detailed instructions!
