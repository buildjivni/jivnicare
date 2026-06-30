const fs = require('fs');
const path = require('path');

const readEnvKeys = (filename) => {
  const p = path.resolve(__dirname, '..', filename);
  if (fs.existsSync(p)) {
    console.log(`=== ${filename} ===`);
    const lines = fs.readFileSync(p, 'utf-8').split('\n');
    lines.forEach(l => {
      const trimmed = l.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        console.log(parts[0]);
      }
    });
  }
};

readEnvKeys('.env');
readEnvKeys('.env.local');
