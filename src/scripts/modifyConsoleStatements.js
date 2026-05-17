const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');

    // First uncomment all console statements
    let modifiedContent = content.replace(
      /\/\/\s*(console\.(log|error)\(.*\))/g,
      '$1',
    );

    modifiedContent = modifiedContent.replace(
      /console\.log\((?!.*error).*\);?\n?/g,
      '',
    );

    modifiedContent = modifiedContent.replace(
      /console\.log\(/g,
      'console.error(',
    );

    // Write back to file
    fs.writeFileSync(filePath, modifiedContent);
 
  } catch (err) {
 
  }
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(fullPath);
    } else if (file.endsWith('.js')) {
      processFile(fullPath);
    }
  });
}

// Start processing from src directory
const srcPath = path.join(__dirname, '..');
processDirectory(srcPath);
