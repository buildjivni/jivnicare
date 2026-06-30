const fs = require("fs");
const path = require("path");

const colors = ["205E98", "4A8C4A", "205e98", "4a8c4a"];
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

const matches = [];

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx") || filePath.endsWith(".css") || filePath.endsWith(".js")) {
    const content = fs.readFileSync(filePath, "utf8");
    colors.forEach(color => {
      if (content.includes("#" + color) || content.includes(color)) {
        // Exclude false positives or system paths if any
        matches.push({ file: filePath, color: "#" + color });
      }
    });
  }
});

console.log("Matching files for color correction:");
const uniqueFiles = [...new Set(matches.map(m => m.file))];
uniqueFiles.forEach(f => console.log("- " + path.relative(path.resolve(__dirname, ".."), f)));
