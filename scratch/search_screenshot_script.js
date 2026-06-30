const fs = require("fs");
const path = require("path");

const srcDir = path.resolve(__dirname, "..");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (!f.startsWith(".") && f !== "node_modules" && f !== ".next") {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

const found = [];
walkDir(srcDir, (filePath) => {
  if (filePath.endsWith(".ts") || filePath.endsWith(".js")) {
    const content = fs.readFileSync(filePath, "utf8");
    if (content.includes("hero_default") || content.includes("hero_carousel")) {
      found.push(filePath);
    }
  }
});

console.log("Found files referencing hero screenshots:");
found.forEach(f => console.log("- " + path.relative(path.resolve(__dirname, ".."), f)));
