const sharp = require('sharp');
const fs = require('fs');

async function processBrandAssets() {
  const fullLogoSource = 'C:\\Users\\dharm\\.gemini\\antigravity\\brain\\98d4bd13-c68e-47a7-8908-b58fd7a4b75d\\media__1779276838644.png';
  const iconSource = 'C:\\Users\\dharm\\.gemini\\antigravity\\brain\\98d4bd13-c68e-47a7-8908-b58fd7a4b75d\\media__1779276838677.png';

  console.log('Processing Official Brand Assets...');

  // 1. Full Logo -> public/logo.png
  await sharp(fullLogoSource)
    .resize(600, null, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toFile('public/logo.png');
  console.log('✓ public/logo.png (Full Logo)');

  // 2. Icon -> public/icon-only.png (for UI)
  await sharp(iconSource)
    .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile('public/icon-only.png');
  console.log('✓ public/icon-only.png (Compact UI Icon)');

  // 3. Icon -> src/app/icon.png (for favicon / manifest)
  await sharp(iconSource)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile('src/app/icon.png');
  console.log('✓ src/app/icon.png (512x512 App Icon)');

  // 4. Icon -> src/app/apple-icon.png
  await sharp(iconSource)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile('src/app/apple-icon.png');
  console.log('✓ src/app/apple-icon.png (180x180)');
  
  // Cleanup any old stray files
  if (fs.existsSync('public/logo.svg')) fs.unlinkSync('public/logo.svg');
  if (fs.existsSync('src/app/favicon.ico')) fs.unlinkSync('src/app/favicon.ico');
  
  console.log('\n✅ Official brand assets perfectly placed!');
}

processBrandAssets().catch(console.error);
