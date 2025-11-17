#!/bin/bash

# FlashMind Platform - Quick Setup Script
# This script helps you quickly set up the FlashMind platform for development

echo "🚀 FlashMind Platform - Quick Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Required version: v18 or higher"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version is below 18. Please upgrade to v18 or higher."
    echo "Current version: $(node -v)"
    echo ""
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check if .env.local exists, if not copy from .env.example
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo "✅ .env.local created!"
        echo "⚠️  Don't forget to add your Supabase credentials to .env.local"
        echo ""
    fi
else
    echo "✅ .env.local already exists"
    echo ""
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. If using Supabase, edit .env.local with your credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "For more detailed instructions, see VSCODE_SETUP.md"
echo ""
echo "Happy coding! 🚀"
