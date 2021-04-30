const fs = require('fs');
const cyphers = require('./cyphers');
const vigenereSolver = require('./vigenere');

const results = [];
cyphers.forEach((cypher) => {
  let itemResult;
  try {
    const { keyword, clearText, coincidenceIndex } = vigenereSolver(cypher);
    if (process.argv.includes('--preview')) {
      itemResult = { index: cypher.index, name: cypher.name, keyword, keywordLength: keyword.length, coincidenceIndex, textPreview: clearText.slice(0, 25) };
    } else {
      itemResult = { index: cypher.index, name: cypher.name, keyword, keywordLength: keyword.length, coincidenceIndex, text: clearText };
    }
  } catch (err) {
    itemResult = { index: cypher.index, name: cypher.name, err: err.message };
  }
  results.push(itemResult);
});

fs.writeFileSync('./output.json', JSON.stringify(results, null, 2));
