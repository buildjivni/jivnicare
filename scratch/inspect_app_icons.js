const fs = require("fs");
const path = require("path");

const appIconDir = "c:\\Users\\dharm\\Downloads\\antigravity\\docs\\brand\\app-icon";
const faviconDir = "c:\\Users\\dharm\\Downloads\\antigravity\\docs\\brand\\favicon";

function inspectSVG(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  // Find width, height, viewBox
  const width = content.match(/width="([^"]+)"/) || [];
  const height = content.match(/height="([^"]+)"/) || [];
  const viewBox = content.match(/viewBox="([^"]+)"/) || [];
  
  console.log(`\n📄 File: ${path.basename(filePath)}`);
  console.log(`   - Size: ${fs.statSync(filePath).size} bytes`);
  console.log(`   - Width: ${width[1] || "N/A"}`);
  console.log(`   - Height: ${height[1] || "N/A"}`);
  console.log(`   - ViewBox: ${viewBox[1] || "N/A"}`);
  
  // Let's count how many <path> or <image> tags exist
  const pathCount = (content.match(/<path/g) || []).length;
  const imageCount = (content.match(/<image/g) || []).length;
  const rectCount = (content.match(/<rect/g) || []).length;
  const circleCount = (content.match(/<circle/g) || []).length;
  
  console.log(`   - Elements: path(${pathCount}), image(${imageCount}), rect(${rectCount}), circle(${circleCount})`);
  
  // Inspect clipPaths if any
  const clipPaths = content.match(/<clipPath id="([^"]+)"/g) || [];
  console.log(`   - clipPaths found: ${clipPaths.length}`);
}

console.log("🔍 Inspecting App Icon SVGs:");
fs.readdirSync(appIconDir).forEach(file => {
  if (file.endsWith(".svg")) {
    inspectSVG(path.join(appIconDir, file));
  }
});

console.log("\n🔍 Inspecting Favicon SVGs:");
fs.readdirSync(faviconDir).forEach(file => {
  if (file.endsWith(".svg")) {
    inspectSVG(path.join(faviconDir, file));
  }
});
