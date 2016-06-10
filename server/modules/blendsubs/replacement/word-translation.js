var dictionary_ptbr_en = require('../dictionaries/pt-br_en');

module.exports = function(word) {
  word = word.replace(/[\.\?,!]/g, '');
  return dictionary_ptbr_en[word] || word;
}
