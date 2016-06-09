module.exports = function(word) {
  return word.replace(/[a-z\u00E0-\u00FC]/g, '_');
}
