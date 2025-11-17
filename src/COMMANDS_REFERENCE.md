# FlashMind - Commands Reference Card

Quick reference for all available commands and VS Code shortcuts.

---

## 📦 NPM Scripts

### Development
```bash
npm run dev              # Start development server (http://localhost:5173)
npm run build            # Build for production (output: dist/)
npm run preview          # Preview production build locally
```

### Code Quality
```bash
npm run lint             # Run ESLint to check for issues
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # Check TypeScript types without building
npm run format           # Format all files with Prettier
npm run format:check     # Check if files are formatted correctly
```

### Utilities
```bash
npm install              # Install all dependencies
npm update               # Update dependencies
npx kill-port 5173       # Kill process on port 5173
```

---

## ⌨️ VS Code Keyboard Shortcuts

### Essential
| Shortcut | Action |
|----------|--------|
| `` Ctrl+` `` | Toggle integrated terminal |
| `Ctrl+P` | Quick file open |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+\` | Split editor |
| `Ctrl+W` | Close current tab |

### Navigation
| Shortcut | Action |
|----------|--------|
| `Ctrl+Tab` | Switch between open files |
| `Ctrl+Shift+E` | Show explorer |
| `Ctrl+Shift+F` | Search in all files |
| `Ctrl+Shift+H` | Find and replace in files |
| `Ctrl+G` | Go to line |
| `Alt+Left/Right` | Navigate back/forward |

### Editing
| Shortcut | Action |
|----------|--------|
| `Shift+Alt+F` | Format document |
| `Ctrl+D` | Select next occurrence |
| `Ctrl+Shift+L` | Select all occurrences |
| `Alt+Up/Down` | Move line up/down |
| `Shift+Alt+Up/Down` | Duplicate line |
| `Ctrl+/` | Toggle line comment |
| `Shift+Alt+A` | Toggle block comment |

### Development
| Shortcut | Action |
|----------|--------|
| `F5` | Start debugging |
| `Shift+F5` | Stop debugging |
| `F9` | Toggle breakpoint |
| `Ctrl+Shift+B` | Run build task |
| `F12` | Go to definition |
| `Alt+F12` | Peek definition |
| `Shift+F12` | Find all references |

### Multi-Cursor
| Shortcut | Action |
|----------|--------|
| `Alt+Click` | Add cursor |
| `Ctrl+Alt+Up/Down` | Add cursor above/below |
| `Ctrl+Shift+L` | Add cursors to all matches |
| `Esc` | Remove extra cursors |

---

## 🔧 VS Code Tasks (Ctrl+Shift+B)

- **Start Dev Server** (Default) - Runs `npm run dev`
- **Build for Production** - Runs `npm run build`
- **Preview Production Build** - Runs `npm run preview`
- **Run Linter** - Runs `npm run lint`
- **Type Check** - Runs TypeScript type checking
- **Install Dependencies** - Runs `npm install`
- **Clean & Reinstall** - Removes node_modules and reinstalls

---

## 🐛 Debug Commands

### Start Debugging
```
F5 or Run > Start Debugging
```

### Debug Configurations
- **Launch Chrome against localhost** - Debug in Chrome browser
- **Debug Vite Dev Server** - Debug the Vite server itself

### Debug Actions
- `F5` - Continue
- `F10` - Step over
- `F11` - Step into
- `Shift+F11` - Step out
- `Ctrl+Shift+F5` - Restart
- `Shift+F5` - Stop

---

## 📁 File Operations

### Create Files
```
Ctrl+N              # New file
Ctrl+Shift+N        # New window
```

### Save Files
```
Ctrl+S              # Save
Ctrl+K S            # Save all
Ctrl+Shift+S        # Save as
```

### Close Files
```
Ctrl+W              # Close current file
Ctrl+K Ctrl+W       # Close all files
Ctrl+Shift+T        # Reopen closed file
```

---

## 🔍 Search & Replace

### Search
```
Ctrl+F              # Find in file
Ctrl+H              # Replace in file
Ctrl+Shift+F        # Find in all files
Ctrl+Shift+H        # Replace in all files
```

### Search Options
- `Alt+C` - Toggle case sensitive
- `Alt+W` - Toggle whole word
- `Alt+R` - Toggle regex

---

## 🎨 Tailwind CSS

### Quick Class Reference
```tsx
// Layout
className="flex flex-col gap-4 p-6"

// Colors (from Guidelines)
className="bg-light-bg text-light-primary"
className="bg-light-card border-light-color"

// Hover
className="hover:bg-light-hover hover:scale-105"

// Responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### Tailwind IntelliSense
- Type class name for autocomplete
- Hover over class to see CSS
- `Ctrl+Space` to trigger suggestions

---

## 🔄 Git Commands (if using Git)

```bash
git status              # Check status
git add .               # Stage all changes
git commit -m "msg"     # Commit changes
git push                # Push to remote
git pull                # Pull from remote
git checkout -b name    # Create new branch
```

### VS Code Git
- `Ctrl+Shift+G` - Show source control
- Click `+` to stage
- Enter message and `Ctrl+Enter` to commit

---

## 🌐 Browser Developer Tools

### Open DevTools
```
F12 or Ctrl+Shift+I     # Open DevTools
Ctrl+Shift+C            # Inspect element
Ctrl+Shift+J            # Console
```

### Console Commands
```javascript
// Clear console
clear()

// Check component props
$0  // Selected element
$r  // React component instance
```

---

## 🚀 Deployment

### Build
```bash
npm run build           # Creates dist/ folder
```

### Preview Build
```bash
npm run preview         # Test production build locally
```

### Deploy to Vercel (example)
```bash
npm install -g vercel
vercel                  # Follow prompts
```

---

## 🛠 Troubleshooting Commands

### Clear Caches
```bash
rm -rf node_modules/.vite          # Clear Vite cache
rm -rf node_modules                # Remove all dependencies
npm install                        # Reinstall
```

### TypeScript Issues
```
Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

### Extension Issues
```
Ctrl+Shift+P > "Developer: Reload Window"
```

### Reset VS Code Settings
```
Ctrl+Shift+P > "Preferences: Open Settings (JSON)"
```

---

## 📱 Terminal Shortcuts

### In VS Code Terminal
```
Ctrl+C              # Stop current process
Ctrl+L              # Clear terminal
Ctrl+Shift+5        # Split terminal
Ctrl+Shift+`        # Create new terminal
```

### Navigation
```
Ctrl+Tab            # Switch terminals
Ctrl+PgUp/PgDn      # Scroll terminal
```

---

## 🎯 Quick Tips

### React Component Snippet
Type `rafce` + Tab = React Arrow Function Component Export

### Import Suggestions
Start typing component name, VS Code suggests imports

### Auto Organize Imports
`Shift+Alt+O` or save file (auto on save enabled)

### Rename Symbol
`F2` on any variable/function renames all occurrences

### Multi-Line Editing
Select text → `Ctrl+Shift+L` → Edit all at once

---

## 📚 Documentation URLs

- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Vite:** https://vitejs.dev
- **Recharts:** https://recharts.org/en-US
- **Lucide Icons:** https://lucide.dev

---

## 💡 Pro Tips

1. **Zen Mode:** `Ctrl+K Z` for distraction-free coding
2. **Minimap:** Toggle in View menu for code overview
3. **Breadcrumbs:** Show file location at top of editor
4. **Sticky Scroll:** Keep function names visible while scrolling
5. **Problems Panel:** `Ctrl+Shift+M` to see all errors

---

**Print this page or keep it open as a reference while coding!**
