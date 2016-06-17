var dictionary_ptbr_en = require('../dictionaries/pt-br_en');

module.exports = function(word) {
  var wordToBeTranslated = word.replace(/[\.\?,!]/g, '');
  var translatedWord = dictionary_ptbr_en[wordToBeTranslated];

  if (translatedWord) {
    return word.replace(wordToBeTranslated, '<b>' + translatedWord + '</b>');
  }

  return word;
}
