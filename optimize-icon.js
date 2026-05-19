const sharp = require('sharp');
const fs = require('fs');

async function processIcon(inputPath, outputPath) {
  try {
    const tempPath = outputPath + '.tmp.png';
    
    // 1. Trim transparency
    const img = sharp(inputPath);
    const { data, info } = await img.trim().toBuffer({ resolveWithObject: true });
    
    console.log(`Trimmed size: ${info.width}x${info.height}`);

    // 2. Put it in a 512x512 square with 440x440 max size to leave safe margins for circle crop
    await sharp(data)
      .resize({
        width: 420,
        height: 420,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
      })
      .extend({
        top: 46,
        bottom: 46,
        left: 46,
        right: 46,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(tempPath);

    fs.copyFileSync(tempPath, outputPath);
    fs.unlinkSync(tempPath);
    console.log(`Optimized and updated: ${outputPath}`);
  } catch (err) {
    console.error(`Failed to process ${inputPath}:`, err.message);
  }
}

async function run() {
  await processIcon('src/app/icon.png', 'src/app/icon.png');
  // Copy to public/logo.png as well for consistency
  fs.copyFileSync('src/app/icon.png', 'public/logo.png');
  console.log('Logo copied to public/logo.png');
}

run();
