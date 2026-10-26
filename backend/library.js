
const fs = require('fs');
const path = require('path');

const libraryFile = path.join(__dirname, 'library-data.json');

let library = [];

if (fs.existsSync(libraryFile)) {
  try {
    library = JSON.parse(fs.readFileSync(libraryFile, 'utf8'));
  } catch (error) {
    console.error('Error loading song library:', error);
  }
}

const saveLibrary = () => {
  fs.writeFileSync(
    libraryFile,
    JSON.stringify(library, null, 2),
    'utf8'
  );
};

module.exports = {
  library,
  saveLibrary,
};