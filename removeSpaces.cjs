const fs = require('fs');
const path = require('path');

const directory = process.argv[2];

console.log(directory);
function renameFiles(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  files.forEach(file => {
    console.log(file);
    const filePath = path.join(directoryPath, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isFile()) {
      const newName = file.replace(/\s+/g, '-');
      if (newName !== file) {
        const newFilePath = path.join(directoryPath, newName);
        fs.renameSync(filePath, newFilePath);
        console.log(`Renamed ${file} to ${newName}`);
      }
    }
  });
}

// Call the function
renameFiles(directory);