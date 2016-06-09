var fs = require('fs'),
    wordObfuscation = require('./replacement/word-obfuscation'),
    wordTranslation = require('./replacement/word-translation');

var file = 'samples/simple-subtitle.str',
    destination = 'samples/translated.srt',
    threshold = '0.2';

console.log('Reading str file: ' + file);
fs.readFile(file, 'utf8', function(err, text) {
  if (err) throw err;
  console.log('Srt file read');

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

      if (Math.random() < threshold) {
        changedWords.push(words[j]);
        words[j] = wordTranslation(words[j]);
      }
    }

    lines[i] = words.join(' ');
  }

  console.log('\n======= CHANGED =========');
  console.log('Threshold: ' + threshold);
  console.log('Changed words: (' + changedWords.length + ')');
  changedWords.forEach(function(w, i) {
    console.log(i + ' - ' + w);
  });
  console.log('Salving in ' + destination);
  fs.writeFile(destination, lines.join(''), function(err) {
    if (err) throw err;
    console.log("The file was saved!");
    console.log('=========================\n');
  });
});
