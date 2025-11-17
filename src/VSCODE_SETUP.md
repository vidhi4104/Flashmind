# FlashMind - VS Code Setup Guide

This guide will help you set up and run the FlashMind platform in Visual Studio Code.

## Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js** (v18.x or higher) - [Download here](https://nodejs.org/)
2. **npm** or **yarn** package manager (comes with Node.js)
3. **Visual Studio Code** - [Download here](https://code.visualstudio.com/)
4. **Git** (optional, for version control) - [Download here](https://git-scm.com/)

## Step 1: Open Project in VS Code

1. Open Visual Studio Code
2. Go to `File > Open Folder...`
3. Navigate to the FlashMind project folder and click "Select Folder"

## Step 2: Install Recommended Extensions

When you open the project, VS Code should prompt you to install recommended extensions. Click **"Install All"**.

If the prompt doesn't appear, you can manually install these extensions from the Extensions panel (Ctrl+Shift+X):

- **ESLint** - Code quality and linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind class autocomplete
- **ES7+ React/Redux/React-Native snippets** - React code snippets
- **Auto Rename Tag** - Automatically rename paired HTML/JSX tags
- **Path IntelliSense** - Autocomplete for file paths
- **TypeScript** - Enhanced TypeScript support
- **Pretty TypeScript Errors** - Better TypeScript error messages
- **Supabase** - Supabase integration (optional)

## Step 3: Install Dependencies

Open the integrated terminal in VS Code:
- Press `` Ctrl+` `` (backtick) or go to `Terminal > New Terminal`

Run the following command to install all project dependencies:

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

This will install all the packages listed in `package.json`.

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. To get your Supabase credentials:
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Open your project
   - Go to Settings > API
   - Copy the "Project URL" and "anon/public" key

**Note:** If you don't have a Supabase project yet, refer to `BACKEND_SETUP.md` for detailed setup instructions.

## Step 5: Run the Development Server

In the VS Code terminal, run:

```bash
npm run dev
```

Or with yarn:

```bash
yarn dev
```

You should see output like:

```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 6: Open in Browser

1. Hold `Ctrl` (or `Cmd` on Mac) and click on `http://localhost:5173/`
2. Or manually open your browser and go to `http://localhost:5173/`

The FlashMind platform should now be running! 🎉

## Debugging in VS Code

### Method 1: Using Chrome Debugger

1. Make sure the dev server is running (`npm run dev`)
2. Press `F5` or go to `Run > Start Debugging`
3. Select "Launch Chrome against localhost" from the dropdown
4. VS Code will open Chrome with debugging enabled
5. Set breakpoints in your code by clicking on the line numbers
6. The debugger will pause execution when breakpoints are hit

### Method 2: Using Browser DevTools

1. Open the app in your browser
2. Press `F12` to open DevTools
3. Go to the Sources tab
4. Find your files under `webpack://` or `localhost:5173`
5. Set breakpoints and debug as usual

## Common Commands

Here are some useful commands you can run in the terminal:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## Project Structure

```
flashmind/
├── .vscode/              # VS Code configuration
├── components/           # React components
│   ├── ui/              # Shadcn UI components
│   ├── pages/           # Page components
│   └── ...              # Feature components
├── contexts/            # React contexts (Auth, etc.)
├── styles/              # Global styles and CSS
├── supabase/            # Supabase functions
├── utils/               # Utility functions
├── App.tsx              # Main app component
├── index.html           # HTML entry point
├── src/
│   └── main.tsx        # React entry point
└── vite.config.ts      # Vite configuration
```

## Troubleshooting

### Port 5173 is already in use

If you see an error that port 5173 is already in use:

1. Find the process using the port:
   ```bash
   # On Windows
   netstat -ano | findstr :5173
   
   # On Mac/Linux
   lsof -i :5173
   ```

2. Kill the process or change the port in `vite.config.ts`:
   ```typescript
   export default defineConfig({
     server: {
       port: 3000, // Use a different port
     },
   })
   ```

### Module not found errors

If you see "Module not found" errors:

1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```

### TypeScript errors

If you see TypeScript errors in VS Code:

1. Make sure the correct TypeScript version is being used:
   - Press `Ctrl+Shift+P`
   - Type "TypeScript: Select TypeScript Version"
   - Choose "Use Workspace Version"

2. Restart the TypeScript server:
   - Press `Ctrl+Shift+P`
   - Type "TypeScript: Restart TS Server"

### Supabase connection errors

If you see Supabase connection errors:

1. Check that `.env.local` exists and has correct credentials
2. Verify your Supabase project is running
3. Check the browser console for specific error messages
4. Refer to `CREDENTIALS_FIX.md` for common Supabase issues

### Hot reload not working

If changes aren't reflected automatically:

1. Restart the dev server (`Ctrl+C` then `npm run dev`)
2. Hard refresh the browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)
3. Check that the file you're editing is within the `content` paths in `tailwind.config.js`

## VS Code Tips & Tricks

### Keyboard Shortcuts

- `Ctrl+P` - Quick file navigation
- `Ctrl+Shift+F` - Search across all files
- `Ctrl+Shift+P` - Command palette
- `Ctrl+B` - Toggle sidebar
- `` Ctrl+` `` - Toggle terminal
- `Alt+Up/Down` - Move line up/down
- `Shift+Alt+Up/Down` - Duplicate line
- `Ctrl+D` - Select next occurrence of selected text

### Useful Features

1. **Multiple Cursors**: Hold `Alt` and click to add cursors
2. **Rename Symbol**: Press `F2` on a variable/function to rename all occurrences
3. **Format Document**: Press `Shift+Alt+F` to format the current file
4. **Auto Import**: Start typing a component name and VS Code will suggest imports
5. **Tailwind IntelliSense**: Type a class name and see autocomplete suggestions

## Next Steps

1. **Review the Guidelines**: Check `Guidelines.md` for design system and coding standards
2. **Explore the Backend**: See `BACKEND_SETUP.md` for Supabase configuration
3. **Read the Documentation**: Review other `.md` files for specific features
4. **Start Developing**: Make changes and see them live with hot reload!

## Getting Help

If you encounter any issues:

1. Check the existing `.md` documentation files in the project
2. Review the error messages in the terminal and browser console
3. Check Supabase logs in the Supabase dashboard
4. Consult the [Vite documentation](https://vitejs.dev/)
5. Consult the [React documentation](https://react.dev/)

Happy coding! 🚀
