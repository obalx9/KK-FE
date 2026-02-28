const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

const srcDir = path.join(__dirname, 'src');
const allFiles = getAllFiles(srcDir);

let filesChanged = 0;

allFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  content = content.replace(/from ['"]\.\.\/lib\/supabase['"]/g, "from '../lib/api'");
  content = content.replace(/from ['"]\.\.\/\.\.\/lib\/supabase['"]/g, "from '../../lib/api'");
  content = content.replace(/from ['"]\.\/lib\/supabase['"]/g, "from './lib/api'");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesChanged++;
    console.log(`✓ ${path.relative(srcDir, filePath)}`);
  }
});

console.log(`\nDone! Changed ${filesChanged} files.`);
