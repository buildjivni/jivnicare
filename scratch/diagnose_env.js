const fs = require('fs');
const path = require('path');

const rootFiles = fs.readdirSync(path.resolve(__dirname, '..'));
console.log("Root files:", rootFiles);

const envPaths = ['.env', '.env.local', '.env.production', '.env.development'];
for (const env of envPaths) {
  const p = path.resolve(__dirname, '..', env);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf-8');
    const hasDbUrl = content.includes('DATABASE_URL');
    console.log(`File: ${env}, exists: true, size: ${content.length} bytes, has DATABASE_URL: ${hasDbUrl}`);
    // Print lines containing DATABASE_URL (censoring password/credentials)
    if (hasDbUrl) {
      const lines = content.split('\n').filter(l => l.includes('DATABASE_URL'));
      lines.forEach(l => {
        const censored = l.replace(/:([^:@]+)@/, ':****@');
        console.log("Censored Line:", censored);
      });
    }
  } else {
    console.log(`File: ${env}, exists: false`);
  }
}
