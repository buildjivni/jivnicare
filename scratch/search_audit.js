const fs = require('fs');
const path = require('path');

const brainDir = "C:\\Users\\dharm\\.gemini\\antigravity\\brain\\f38e1754-fed2-42be-9702-0592d34035a5";
const files = fs.readdirSync(brainDir);

for (const file of files) {
  if (file.endsWith('.md')) {
    const filePath = path.join(brainDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.toLowerCase().includes('add doctor') || content.toLowerCase().includes('onboard')) {
      console.log(`\n=== Matches in ${file} ===`);
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes('add doctor') || line.toLowerCase().includes('onboard')) {
          console.log(`${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}
