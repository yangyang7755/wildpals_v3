const fs = require('fs');
const path = require('path');

// Create a simple PNG file (1x1 green pixel, will be scaled by Expo)
function createSimplePNG(width, height, filename) {
  // PNG header for a simple green image
  const png = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xD7, 0x63, 0x60, 0xA8, 0x65, 0x00,
    0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC,
    0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
    0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(assetsDir, filename), png);
  console.log(`✅ Created ${filename}`);
}

// Create all required assets
console.log('Creating placeholder assets...');
createSimplePNG(1024, 1024, 'icon.png');
createSimplePNG(1284, 2778, 'splash.png');
createSimplePNG(1024, 1024, 'adaptive-icon.png');
createSimplePNG(48, 48, 'favicon.png');
console.log('\n✅ All assets created successfully!');
console.log('Note: These are simple placeholders. Replace with proper images later.');
