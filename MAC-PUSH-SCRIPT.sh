#!/bin/bash

echo "================================================"
echo " PUSH TO GITHUB - MAC/LINUX SCRIPT"
echo "================================================"
echo ""

# Check if file exists
if [ ! -f "ABSOLUTE-FINAL-COMPLETE-PLATFORM.html" ]; then
    echo "ERROR: ABSOLUTE-FINAL-COMPLETE-PLATFORM.html not found!"
    echo "Please make sure this script is in the same folder as the HTML file."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "ERROR: Git is not installed!"
    echo "Mac: Install Xcode Command Line Tools"
    echo "Linux: sudo apt-get install git"
    exit 1
fi

echo "Step 1: Renaming file to index.html..."
mv ABSOLUTE-FINAL-COMPLETE-PLATFORM.html index.html
echo "Done!"
echo ""

echo "Step 2: Initializing git repository..."
git init
echo ""

echo "Step 3: Adding files..."
git add index.html
echo "# Investigation Platform Prototype" > README.md
git add README.md
echo ""

echo "Step 4: Committing..."
git commit -m "Initial commit - Investigation Platform"
echo ""

echo "================================================"
echo "IMPORTANT: Enter your GitHub repository URL"
echo ""
echo "Example: https://github.com/YOUR-USERNAME/investigation-platform.git"
echo ""
echo "To get this URL:"
echo "1. Go to https://github.com/new"
echo "2. Create repository named: investigation-platform"
echo "3. Copy the repository URL"
echo "================================================"
echo ""
read -p "Paste your repository URL here: " REPO_URL

echo ""
echo "Step 5: Adding remote repository..."
git remote add origin "$REPO_URL"
echo ""

echo "Step 6: Pushing to GitHub..."
git branch -M main
git push -u origin main
echo ""

echo "================================================"
echo " SUCCESS! Files pushed to GitHub!"
echo "================================================"
echo ""
echo "Next Steps:"
echo "1. Go to your repository on GitHub"
echo "2. Click Settings"
echo "3. Click Pages (left sidebar)"
echo "4. Under Source, select 'main' branch"
echo "5. Click Save"
echo ""
echo "Your site will be live in 1-2 minutes at:"
echo "https://YOUR-USERNAME.github.io/investigation-platform/"
echo ""
