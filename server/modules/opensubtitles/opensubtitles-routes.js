var api = require('./opensubtitles'),
	fs = require('fs');

module.exports = function (app) {

	app.get('/api/subtitle', function (req, res) {
		api.SearchSubtitles(function (_subtitles) {
			res.send(_subtitles);
		});
	});

	app.get('/api/subtitle/download', function (req, res) {
		api.DownloadSubtitles('http://dl.opensubtitles.org/en/download/filead/src-api/vrf-135aad67e0/1952060809.gz', function () {
			res.send('Downloaded.');
		});
	});

	app.get('/api/subtitle/search', function (req, res) {
		api.SearchMoviesOnIMDB(req.query.movie, function (_movies) {
			res.send(_movies);
		});
	});

	app.post('/api/subtitle/merge', function (req, res) {
		api.DownloadAll(req.body, function (err, zipFile) {
			res.download(zipFile, function (err) {
				var fs = require('fs');
				fs.unlink(zipFile);
			});
		});
	});
}