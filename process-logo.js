const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processLogo() {
  const sourceImage = 'C:\\Users\\dharm\\.gemini\\antigravity\\brain\\98d4bd13-c68e-47a7-8908-b58fd7a4b75d\\media__1779274970905.png';

  console.log('Using source image:', sourceImage);

  // 1. public/logo.png
  await sharp(sourceImage)
    .resize(600, null, { fit: 'inside' })
    .png()
    .toFile('public/logo.png');
  console.log('✓ public/logo.png');

  // 2. src/app/icon.png (for favicon / PWA)
  await sharp(sourceImage)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile('src/app/icon.png');
  console.log('✓ src/app/icon.png (512x512)');

  // 3. src/app/apple-icon.png
  await sharp(sourceImage)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile('src/app/apple-icon.png');
  console.log('✓ src/app/apple-icon.png (180x180)');
  
  // Cleanup old files
  if (fs.existsSync('public/logo.svg')) fs.unlinkSync('public/logo.svg');
  if (fs.existsSync('src/app/favicon.ico')) fs.unlinkSync('src/app/favicon.ico');
  
  console.log('\n✅ All assets updated with the official uploaded logo!');
}

processLogo().catch(console.error);
