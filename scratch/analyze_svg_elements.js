const fs = require("fs");
const path = require("path");

const appIconDir = "c:\\Users\\dharm\\Downloads\\antigravity\\docs\\brand\\app-icon";

fs.readdirSync(appIconDir).forEach(file => {
  if (!file.endsWith(".svg")) return;
  const content = fs.readFileSync(path.join(appIconDir, file), "utf8");
  
  console.log(`\n📄 SVG Analysis for: ${file}`);
  
  // Look for any rect or path with a specific color
  const hexColors = content.match(/#[0-9a-fA-F]{3,8}/g) || [];
  const uniqueColors = [...new Set(hexColors)];
  console.log(`   - Hex Colors:`, uniqueColors);
  
  // Look for dimensions inside rects
  const rects = content.match(/<rect[^>]+>/g) || [];
  console.log(`   - Rects found (${rects.length}):`);
  rects.forEach((r, idx) => {
    console.log(`     [${idx}]: ${r}`);
  });
  
  // Look for clips or masks
  const clipPath = content.match(/<clipPath[^>]+>([\s\S]*?)<\/clipPath>/g) || [];
  console.log(`   - ClipPaths found (${clipPath.length}):`);
  clipPath.forEach((c, idx) => {
    console.log(`     [${idx}]: ${c.substring(0, 100)}...`);
  });
  
  // Look for image source dimensions or patterns
  const images = content.match(/<image[^>]+>/g) || [];
  console.log(`   - Images found (${images.length}):`);
  images.forEach((img, idx) => {
    // get width, height, and display first 50 chars of base64
    const w = img.match(/width="([^"]+)"/) || [];
    const h = img.match(/height="([^"]+)"/) || [];
    const href = img.match(/xlink:href="([^"]+)"/) || [];
    console.log(`     [${idx}]: width=${w[1] || "N/A"}, height=${h[1] || "N/A"}, href length=${href[1] ? href[1].length : 0}`);
  });
});
