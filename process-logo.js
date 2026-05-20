const sharp = require('sharp');
const fs = require('fs');

async function processIcons() {
  try {
    const inputPath = '../logo2.png';
    console.log('Processing', inputPath);

    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    const width = metadata.width;
    const height = metadata.height;
    
    // Zoom factor 1.2
    const cropWidth = Math.floor(width * 0.8);
    const cropHeight = Math.floor(height * 0.8);
    const left = Math.floor((width - cropWidth) / 2);
    const top = Math.floor((height - cropHeight) / 2);

    // 1. Google Favicon (48x48) - standard ICO replacement
    await sharp(inputPath)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize(48, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile('src/app/favicon.ico');
    console.log('Saved src/app/favicon.ico (48x48)');

    // 2. High-res Favicon (192x192, multiple of 48px as required by Google)
    await sharp(inputPath)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile('src/app/icon.png');
    console.log('Saved src/app/icon.png (192x192)');

    // 3. Apple Touch Icon (180x180)
    await sharp(inputPath)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile('src/app/apple-icon.png');
    console.log('Saved src/app/apple-icon.png (180x180)');
    
    // 4. OpenGraph Image (1200x630)
    // For OG, we usually want a rectangular image. We'll place the logo in the center.
    await sharp(inputPath)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize(600, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .extend({
        top: 15,
        bottom: 15,
        left: 300,
        right: 300,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFile('public/logo.png');
    console.log('Saved public/logo.png (OpenGraph 1200x630)');

  } catch (err) {
    console.error('Error processing logo:', err);
  }
}

processIcons();
