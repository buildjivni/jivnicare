const fs = require("fs");
const path = require("path");

const srcDir = path.resolve(__dirname, "../src");

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
  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx") || filePath.endsWith(".json")) {
    const content = fs.readFileSync(filePath, "utf8");
    if (content.toLowerCase().includes("symptom") || content.toLowerCase().includes("disease")) {
      found.push(filePath);
    }
  }
});

console.log("Found files referencing symptoms/diseases:");
found.forEach(f => console.log("- " + path.relative(path.resolve(__dirname, ".."), f)));
