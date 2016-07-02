var api = require('./opensubtitles'),
	fs = require('fs');

module.exports = function (app) {

	app.get('/api/subtitle', function (req, res) {
		api.SearchSubtitles(function (_subtitles) {
			res.send(_subtitles);
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

	app.get('/api/subtitle/details', function (req, res) {
		api.GetDetails(req.query.id, req.query.type, req.query.name, function (err, _title) {
			res.send(_title);
		});
	});
}