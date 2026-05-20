const sharp = require('sharp');

async function replaceIcons() {
  // Use the standalone icon file directly - no crop needed
  const iconSource = 'C:\\Users\\dharm\\Downloads\\icon 2.png';
  const logoSource = 'C:\\Users\\dharm\\Downloads\\JivniCare3.png'; // logo with text for OG image

  const meta = await sharp(iconSource).metadata();
  console.log('Icon source:', meta.width, 'x', meta.height);

  // 1. public/logo.png - full logo with text (used for OG / branding)
  await sharp(logoSource)
    .resize(400, null, { fit: 'inside' })
    .png()
    .toFile('public/logo.png');
  console.log('✓ public/logo.png (full logo with text)');

  // 2. src/app/icon.png - 512x512 square app icon (Next.js uses this)
  await sharp(iconSource)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile('src/app/icon.png');
  console.log('✓ src/app/icon.png (512x512)');

  // 3. src/app/apple-icon.png - 180x180 for Apple touch icon
  await sharp(iconSource)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile('src/app/apple-icon.png');
  console.log('✓ src/app/apple-icon.png (180x180)');

  console.log('\n✅ All icons replaced with correct standalone JivniCare icon!');
}

replaceIcons().catch(console.error);
