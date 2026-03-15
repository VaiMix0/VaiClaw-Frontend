const fs = require('fs');
const path = require('path');

const directoryPath = path.resolve(__dirname);
const searchString = /Postiz/g;
const replaceString = 'VaiMix';

const excludedDirs = ['.git', 'node_modules', '.next', 'dist', 'build', '.nx'];
const excludedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.lock', '.log', '.pack'];

function readAndReplace(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      if (!excludedDirs.includes(file)) {
        readAndReplace(filePath);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (!excludedExtensions.includes(ext) && !file.includes('pnpm-lock') && !file.includes('replace_script.js')) {
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          if (content.match(searchString)) {
            const newContent = content.replace(searchString, replaceString);
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Replaced in ${filePath}`);
          }
        } catch (err) {
          // ignore
        }
      }
    }
  });
}

readAndReplace(directoryPath);
console.log('Done.');
