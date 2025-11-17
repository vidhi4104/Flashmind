@echo off
REM FlashMind Platform - Quick Setup Script (Windows)
REM This script helps you quickly set up the FlashMind platform for development

echo.
echo ========================================
echo FlashMind Platform - Quick Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Required version: v18 or higher
    pause
    exit /b 1
)

REM Display Node.js version
echo [OK] Node.js version:
node -v
echo.

REM Install dependencies
echo [INSTALL] Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed successfully!
echo.

REM Check if .env.local exists, if not copy from .env.example
if not exist ".env.local" (
    if exist ".env.example" (
        echo [CREATE] Creating .env.local from .env.example...
        copy .env.example .env.local >nul
        echo [OK] .env.local created!
        echo [WARNING] Don't forget to add your Supabase credentials to .env.local
        echo.
    )
) else (
    echo [OK] .env.local already exists
    echo.
)

echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. If using Supabase, edit .env.local with your credentials
echo 2. Run 'npm run dev' to start the development server
echo 3. Open http://localhost:5173 in your browser
echo.
echo For more detailed instructions, see VSCODE_SETUP.md
echo.
echo Happy coding!
echo.
pause
