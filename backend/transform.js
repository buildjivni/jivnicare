const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');
content = content.replace(/provider\s*=\s*"postgresql"/, 'provider = "mongodb"');
content = content.replace(/@id\s+@default\(uuid\(\)\)/g, '@id @default(uuid()) @map("_id")');
fs.writeFileSync('prisma/schema.prisma', content);
console.log('Done');
