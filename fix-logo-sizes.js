const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Fix img tag square dimensions to rectangular dimensions for logo
  if (content.includes('logo.png')) {
    content = content.replace(/className="w-4 h-4([^"]*)"/g, 'className="h-4 w-auto$1"');
    content = content.replace(/className="w-8 h-8([^"]*)"/g, 'className="h-8 w-auto$1"');
    content = content.replace(/className="w-10 h-10([^"]*)"/g, 'className="h-10 w-auto$1"');
    content = content.replace(/className="w-12 h-12([^"]*)"/g, 'className="h-10 w-auto$1"');
    content = content.replace(/className="w-16 h-16([^"]*)"/g, 'className="h-12 w-auto$1"');
    
    // Some places had h-16 w-auto, let's keep them or slightly reduce if it's too big, but let's stick to what's there
  }

  // Adjust Logo component height to be slightly bigger since text requires more space
  if (content.includes('<Logo')) {
    content = content.replace(/<Logo className="h-6 w-auto"/g, '<Logo className="h-8 w-auto"');
    // For standard headers, h-10 or h-12 is better than h-8 for a full text logo
    content = content.replace(/<Logo className="h-8 w-auto/g, '<Logo className="h-10 w-auto');
    // if there's drop-shadow-md attached
    content = content.replace(/<Logo className="h-8 w-auto drop-shadow-md"/g, '<Logo className="h-10 w-auto drop-shadow-md"');
  }
  
  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
    changedCount++;
  }
});

console.log('Fixed logo sizing in ' + changedCount + ' files.');
