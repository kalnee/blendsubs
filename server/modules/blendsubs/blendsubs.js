var fs = require('fs');
var threshold = '0.2';

var file = 'samples/the-walking-dead_pt-br.srt',
    destination = 'samples/obfuscated.srt';

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
        words[j] = words[j].replace(/[a-z\u00E0-\u00FC]/g, '_');
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
