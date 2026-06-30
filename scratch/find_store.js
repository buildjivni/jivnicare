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
  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    const content = fs.readFileSync(filePath, "utf8");
    if (content.includes("useLocationStore") || content.includes("location-store") || content.includes("persist(")) {
      found.push(filePath);
    }
  }
});

console.log("Found location store / state related files:");
found.forEach(f => console.log("- " + path.relative(path.resolve(__dirname, ".."), f)));
