# FlashMind Setup Checklist

Follow this checklist to get FlashMind running in VS Code.

## Prerequisites ✓

- [ ] **Node.js v18+** installed ([Download](https://nodejs.org/))
  - Check: `node --version`
- [ ] **VS Code** installed ([Download](https://code.visualstudio.com/))
- [ ] **npm** or **yarn** available (comes with Node.js)
  - Check: `npm --version`

## Setup Steps ✓

### 1. Open Project
- [ ] Open VS Code
- [ ] File → Open Folder
- [ ] Select the FlashMind project folder

### 2. Install Extensions
- [ ] VS Code shows "This workspace has extension recommendations"
- [ ] Click **"Install All"** or **"Show Recommendations"**
- [ ] Wait for all extensions to install

**Required Extensions:**
- [ ] ESLint
- [ ] Prettier
- [ ] Tailwind CSS IntelliSense
- [ ] ES7+ React/Redux snippets
- [ ] Auto Rename Tag

### 3. Install Dependencies
- [ ] Open integrated terminal (`` Ctrl+` ``)
- [ ] Run: `npm install`
- [ ] Wait for installation to complete (may take a few minutes)
- [ ] No errors in the output

### 4. Configure Environment (Optional - for Supabase)
- [ ] Copy `.env.example` to `.env.local`
  ```bash
  cp .env.example .env.local
  ```
- [ ] Open `.env.local`
- [ ] Add Supabase URL and Key
- [ ] Save the file

### 5. Start Development Server
- [ ] Run: `npm run dev`
- [ ] Terminal shows "Local: http://localhost:5173/"
- [ ] No errors in the output

### 6. Open in Browser
- [ ] Open browser
- [ ] Navigate to: `http://localhost:5173`
- [ ] FlashMind dashboard loads successfully
- [ ] No errors in browser console (F12)

## Verification ✓

### VS Code Setup
- [ ] IntelliSense works (type suggestions appear)
- [ ] Tailwind classes autocomplete
- [ ] No TypeScript errors in files
- [ ] Format on save works (try editing a file)

### Application
- [ ] Dashboard loads and displays correctly
- [ ] Sidebar navigation works
- [ ] Can navigate to different pages
- [ ] No console errors in browser

### Development Workflow
- [ ] Hot reload works (make a change, see it update)
- [ ] Can build project: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Linter runs: `npm run lint`

## Troubleshooting ✗

If something doesn't work, try these:

### Dependencies Issues
```bash
rm -rf node_modules
npm install
```

### Port Already in Use
```bash
npx kill-port 5173
npm run dev
```

### TypeScript Errors
1. Press `Ctrl+Shift+P`
2. Type: "TypeScript: Restart TS Server"
3. Press Enter

### Extension Issues
1. Press `Ctrl+Shift+P`
2. Type: "Developer: Reload Window"
3. Press Enter

### Clear Cache
```bash
rm -rf node_modules/.vite
npm run dev
```

## Quick Reference

### Start Development
```bash
npm run dev
```

### Stop Development Server
Press `Ctrl+C` in the terminal

### Run Tasks
Press `Ctrl+Shift+B` and select a task

### Debug
Press `F5` to launch Chrome debugger

## Need More Help?

- **Quick Start:** [QUICKSTART.md](./QUICKSTART.md)
- **Detailed Guide:** [VSCODE_SETUP.md](./VSCODE_SETUP.md)
- **Full Documentation:** [README.md](./README.md)
- **Development Guidelines:** [Guidelines.md](./Guidelines.md)

## Success! 🎉

Once all checkboxes are checked, you're ready to develop FlashMind!

### Next Steps:
1. Explore the codebase
2. Read [Guidelines.md](./Guidelines.md) for coding standards
3. Make changes and see live updates
4. Start building features!

---

**Last Updated:** When you see the FlashMind dashboard in your browser at `http://localhost:5173`, you're all set! ✅
