#!/bin/bash

# Script to create placeholder assets for Expo
# This creates simple colored squares as placeholders

echo "Creating placeholder assets..."

mkdir -p assets

# Create a simple green square for icon (requires ImageMagick)
if command -v convert &> /dev/null; then
    echo "Creating icon.png..."
    convert -size 1024x1024 xc:#4A7C59 -pointsize 200 -fill white -gravity center -annotate +0+0 "W" assets/icon.png
    
    echo "Creating splash.png..."
    convert -size 1284x2778 xc:#4A7C59 -pointsize 300 -fill white -gravity center -annotate +0+0 "Wildpals" assets/splash.png
    
    echo "Creating adaptive-icon.png..."
    cp assets/icon.png assets/adaptive-icon.png
    
    echo "Creating favicon.png..."
    convert -size 48x48 xc:#4A7C59 assets/favicon.png
    
    echo "✅ Assets created successfully!"
else
    echo "⚠️  ImageMagick not found. Please install it or create assets manually:"
    echo ""
    echo "Required assets:"
    echo "  - assets/icon.png (1024x1024)"
    echo "  - assets/splash.png (1284x2778)"
    echo "  - assets/adaptive-icon.png (1024x1024)"
    echo "  - assets/favicon.png (48x48)"
    echo ""
    echo "You can use any PNG images for now as placeholders."
fi
