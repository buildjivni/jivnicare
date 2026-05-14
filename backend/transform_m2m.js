const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');

// We already changed provider and @id @map("_id")
// Now we fix implicit many-to-many relations.

content = content.replace(/specialties\s+Specialty\[\]/g, 'specialtyIds String[]\n  specialties Specialty[] @relation(fields: [specialtyIds], references: [id])');
content = content.replace(/keywords\s+Keyword\[\]/g, 'keywordIds String[]\n  keywords Keyword[] @relation(fields: [keywordIds], references: [id])');

content = content.replace(/doctors\s+Doctor\[\]/g, 'doctorIds String[]\n  doctors Doctor[] @relation(fields: [doctorIds], references: [id])');
content = content.replace(/hospitals\s+Hospital\[\]/g, 'hospitalIds String[]\n  hospitals Hospital[] @relation(fields: [hospitalIds], references: [id])');

fs.writeFileSync('prisma/schema.prisma', content);
console.log('Done');
