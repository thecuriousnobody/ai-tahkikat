#!/bin/bash

echo "========================================"
echo " PUSH MEGA SYSTEM TO GITHUB"
echo "========================================"
echo ""

# Check if file exists
if [ ! -f "MEGA-FINAL-COMPLETE-SYSTEM.html" ]; then
    echo "ERROR: MEGA-FINAL-COMPLETE-SYSTEM.html not found!"
    echo "Please download it first."
    exit 1
fi

echo "Step 1: Renaming to index.html..."
mv MEGA-FINAL-COMPLETE-SYSTEM.html index.html
echo "Done!"
echo ""

echo "Step 2: Initializing Git..."
git init
echo ""

echo "Step 3: Adding files..."
git add index.html
echo "# Investigation Platform - Complete System" > README.md
git add README.md
echo ""

echo "Step 4: Committing..."
git commit -m "Complete Investigation Platform - UAT Ready"
echo ""

echo "========================================"
echo "PASTE YOUR GITHUB REPOSITORY URL"
echo ""
echo "Example: https://github.com/username/investigation-platform.git"
echo ""
echo "To get this:"
echo "1. Go to https://github.com/new"
echo "2. Create repo: investigation-platform"
echo "3. Copy the URL"
echo "========================================"
echo ""
read -p "Your GitHub URL: " REPO_URL

echo ""
echo "Step 5: Adding remote..."
git remote add origin "$REPO_URL"
echo ""

echo "Step 6: Pushing to GitHub..."
git branch -M main
git push -u origin main
echo ""

echo "========================================"
echo " SUCCESS! Files uploaded to GitHub!"
echo "========================================"
echo ""
echo "NEXT: Enable GitHub Pages"
echo ""
echo "1. Go to your repo on GitHub"
echo "2. Settings → Pages"
echo "3. Source: main branch"
echo "4. Save"
echo ""
echo "Your live URL will be:"
echo "https://YOUR-USERNAME.github.io/investigation-platform/"
echo ""
echo "Share this link for UAT!"
echo ""
