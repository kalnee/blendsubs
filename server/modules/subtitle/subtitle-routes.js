var api = require('./subtitle'),
	fs = require('fs');

module.exports = function (app) {
	app.get('/api/subtitle/search', function (req, res) {
		api.searchMoviesOnIMDB(req.query.movie, function (_movies) {
			res.send(_movies);
		});
	});

	app.post('/api/subtitle/download', function (req, res) {
		api.downloadAll(req.body, function (err, zipFile) {
			res.download(zipFile, function (err) {
				var fs = require('fs');
				fs.unlink(zipFile);
			});
		});
	});

	app.get('/api/subtitle/details', function (req, res) {
		api.getDetails(req.query.id, req.query.type, req.query.name, req.query.year, function (err, _title) {
			res.send(_title);
		});
	});
}