const fs = require('fs');
const path = require('path');

const assetsFolder = path.join(__dirname, './assets');
const filenameToIndex = name => parseInt(name.replace('cipher', '').replace('.txt', ''));

const cyphers = fs.readdirSync(assetsFolder)
  .map(name => {
    const filePath = path.join(assetsFolder, name);
    let value = fs.readFileSync(filePath).toString();
    if (process.argv.includes('--preview')) {
      value = value.slice(0, 10000);
    }
    return {
      index: filenameToIndex(name),
      name, value,
    };
  });

cyphers.sort((a, b) => a.index > b.index ? 1 : -1)

module.exports = cyphers;
