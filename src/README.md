# FlashMind - AI-Powered Learning Platform

An intelligent learning companion that creates flashcards from various content types and provides comprehensive analytics for optimized learning.

---

## 🎯 **Ready to Run in VS Code!**

### 👉 **[START HERE](./START_HERE.md)** - New to the project? Click here!

**Quick Start:**
```bash
npm install
npm run dev
# Open http://localhost:5173
```

📚 **More Guides:**
- **Quick Reference:** [QUICKSTART.md](./QUICKSTART.md)
- **Step-by-Step:** [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)
- **Detailed Guide:** [VSCODE_SETUP.md](./VSCODE_SETUP.md)

---

## 🚀 Quick Start - Running in VS Code

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **VS Code** - [Download here](https://code.visualstudio.com/)
- **npm** or **yarn** (comes with Node.js)

### Setup Steps

1. **Open the project in VS Code:**

   ```bash
   # Navigate to your project folder
   cd /path/to/your/flashmind-project

   # Open in VS Code
   code .
   ```

2. **Install recommended extensions:**
   - VS Code will prompt you to install recommended extensions
   - Click "Install All" when the notification appears
   - Or manually install from the Extensions panel (Ctrl+Shift+X)

3. **Install dependencies:**
   Open the integrated terminal in VS Code (`` Ctrl+` `` or `View > Terminal`) and run:

   ```bash
   npm install
   ```

4. **Configure environment (optional for Supabase):**
   ```bash
   cp .env.example .env.local
   # Then edit .env.local with your Supabase credentials
   ```

5. **Start the development server:**

   ```bash
   npm run dev
   ```

6. **Open your browser:**
   - The app will be available at: `http://localhost:5173`
   - VS Code might show a popup to open the browser automatically

📖 **For detailed setup instructions, debugging tips, and troubleshooting, see [VSCODE_SETUP.md](./VSCODE_SETUP.md)**

### Recommended VS Code Extensions

When you open the project, VS Code will recommend these extensions:

1. **ESLint** - Code quality and linting
2. **Prettier** - Code formatting
3. **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
4. **ES7+ React/Redux/React-Native snippets** - Useful React snippets
5. **Auto Rename Tag** - Automatically rename paired HTML/JSX tags
6. **Path IntelliSense** - File path autocomplete
7. **Pretty TypeScript Errors** - Better error messages
8. **Supabase** - Supabase integration (optional)

## 📁 Project Structure

```
flashmind/
├── App.tsx                    # Main app entry point
├── package.json              # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── Guidelines.md             # Development guidelines
├── components/
│   ├── FlashMindDashboard.tsx # Main dashboard component
│   ├── Analytics.tsx         # Analytics dashboard
│   ├── StudyMode.tsx         # Study interface
│   ├── UploadStudio.tsx      # File upload and processing
│   ├── Community.tsx         # Community features
│   └── ui/                   # Reusable UI components (shadcn/ui)
└── styles/
    └── globals.css           # Tailwind CSS and custom styles
```

## 🛠 Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run TypeScript check
npm run lint
```

## 🎨 Features

### ✅ Completed Features

- **📊 Analytics Dashboard** - Comprehensive learning analytics with AI insights
- **🏠 Main Dashboard** - Progress tracking and quick actions
- **📚 Upload Studio** - Drag-and-drop file processing for flashcard generation
- **🧠 Study Mode** - Interactive flashcard study with spaced repetition
- **👥 Community** - Discover and share flashcard decks
- **📱 Responsive Design** - Works seamlessly on all devices
- **🎯 AI Model Performance** - Track and optimize AI model metrics

### 🔧 Technical Stack

- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Vite** for fast development and building
- **Recharts** for data visualization
- **Radix UI** for accessible components
- **Lucide React** for icons

## 🎯 Development Guidelines

This project follows strict design system guidelines defined in `Guidelines.md`. Key points:

- **Light Theme Only** - Clean, modern light theme design
- **TypeScript First** - All components use TypeScript
- **Component-Based** - Modular, reusable components
- **Responsive Design** - Mobile-first approach
- **Accessibility** - WCAG AA compliant

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use:**

   ```bash
   # Kill process on port 5173
   npx kill-port 5173
   # Then restart
   npm run dev
   ```

2. **Node modules issues:**

   ```bash
   # Delete node_modules and reinstall
   rm -rf node_modules
   npm install
   ```

3. **TypeScript errors:**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   ```

### VS Code Setup Issues

1. **Tailwind IntelliSense not working:**

   - Ensure Tailwind CSS IntelliSense extension is installed
   - Restart VS Code
   - Check that `tailwind.config.js` is recognized

2. **Import errors:**
   - Check that all dependencies are installed (`npm install`)
   - Verify TypeScript configuration in `tsconfig.json`

## 📝 Development Workflow

1. **Start the dev server:** `npm run dev`
2. **Open in browser:** `http://localhost:5173`
3. **Make changes:** Edit files in VS Code
4. **See changes:** Hot reload automatically updates the browser
5. **Check console:** Monitor browser console for any errors

## 🚀 Deployment Ready

The project is configured for easy deployment:

- Run `npm run build` to create production build
- The `dist` folder contains optimized static files
- Deploy to any static hosting service (Vercel, Netlify, etc.)

---

## 🆘 Need Help?

- Check the browser console for error messages
- Ensure all dependencies are installed with `npm install`
- Verify Node.js version is 18 or higher with `node --version`
- Make sure you're running commands in the project root directory

Happy coding! 🎉