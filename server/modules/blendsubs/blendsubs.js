var fs = require('fs'),
  iconv = require('iconv-lite'),
  winston = require('winston'),
  wordObfuscation = require('./modes/word-obfuscation'),
  wordTranslation = require('./modes/word-translation');

module.exports = function(file, mode, percentage) {
  winston.info('Reading subtitle file: ' + file);
  fs.readFile(file, 'binary', function(err, bytes) {
    if (err) throw err;
    winston.info('Subtitle file read');
    var text = iconv.decode(bytes, "ISO-8859-1");

    var lines = text.split('\n'),
      changedWords = [];

    for (var i = 0; i < lines.length; i++) {
      if (lines[i].length < 10 || lines[i].indexOf('-->') > -1) {
        continue;
      }

      var words = lines[i].split(' ');

      for (var j = 0; j < words.length; j++) {
        if (words[j].length < 3 || /[A-Z<>]/.test(words[j])) {
          continue;
        }

        if (Math.random() < mode) {
          var wordBefore = words[j];

          if (mode === 'translation') {
            words[j] = wordTranslation(words[j]);
          } else if (mode === 'obfuscation') {
            words[j] = wordObfuscation(words[j]);
          } else {
            throw 'invalid mode';
          }

          if (wordBefore !== words[j]) {
            changedWords.push(wordBefore);
          }
        }
      }

      lines[i] = words.join(' ');
    }

    winston.info('\n======= CHANGED =========');
    winston.info('mode: ' + mode);
    winston.info('Changed words: (' + changedWords.length + ')');
    changedWords.forEach(function(w, i) {
      winston.info(i + ' - ' + w);
    });
  });
}
