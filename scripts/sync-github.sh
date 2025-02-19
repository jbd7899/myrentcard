#!/bin/bash

# Ensure we're in the project root
cd "$(dirname "$0")/.."

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set"
    echo "Please set your GitHub token first"
    exit 1
fi

# Configure git
git config --global user.email "github-sync@myrentcard.com"
git config --global user.name "MyRentCard Sync"

# Add all changes
git add .

# Get the current timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Commit changes with timestamp
git commit -m "Sync changes from Replit - $TIMESTAMP"

# Push to GitHub using token
git push https://$GITHUB_TOKEN@github.com/jbd7899/myrentcard.git main

echo "Changes successfully pushed to GitHub"
