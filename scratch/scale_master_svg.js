const fs = require('fs');
const path = require('path');

const svgPath = 'c:/Users/dharm/Downloads/antigravity/docs/brand/app-icon/app-icon-master.svg';

try {
  let content = fs.readFileSync(svgPath, 'utf8');

  // Verify target strings exist
  const targetOpen = '<g clip-path="url(#7c28933226)">';
  const targetClose = '</g></g></svg>';

  if (!content.includes(targetOpen)) {
    throw new Error('Target opening tag not found!');
  }
  if (!content.includes(targetClose)) {
    throw new Error('Target closing tag not found!');
  }

  // Scale by 0.78 (enforces 11% padding on all sides of 1500x1500px canvas)
  // Shift by 165px (11% of 1500)
  const replacementOpen = '<g transform="translate(165, 165) scale(0.78)"><g clip-path="url(#7c28933226)">';
  const replacementClose = '</g></g></g></svg>';

  // Perform replacements
  content = content.replace(targetOpen, replacementOpen);
  // Replace only the occurrence at the end of the file
  if (content.endsWith(targetClose)) {
    content = content.slice(0, -targetClose.length) + replacementClose;
  } else {
    // Fallback replacement if whitespace exists at the end
    content = content.replace(targetClose, replacementClose);
  }

  fs.writeFileSync(svgPath, content, 'utf8');
  console.log('Successfully scaled and centered app-icon-master.svg!');
} catch (error) {
  console.error('Error scaling SVG:', error.message);
  process.exit(1);
}
