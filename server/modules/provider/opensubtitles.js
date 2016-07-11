if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function () {
    "use strict";

    var xmlrpc = require('xmlrpc'),
        request = require('request'),
        zlib = require('zlib'),
        fs = require('fs'),
        imdb = require('imdb-api'),
        appUserAgent = 'PopcornHour v1',
        client = xmlrpc.createClient({
            url: 'http://api.opensubtitles.org/xml-rpc',
            headers: {
                'User-Agent': appUserAgent
            }
        }),
        token,
        blender = require('../blendsubs/blendsubs');

    function OpenSubtitles() {

    }

    OpenSubtitles.login = function (_callback) {
        client.methodCall('LogIn', [
                    null,
                    null,
                    null,
                    appUserAgent
                ], function (error, data) {
            if (!error) {
                token = data.token;
                _callback(token);
            } else {
                console.log(error);
            }
        });
    };

    /*
     * Official but undocumented api of imdb
     *      Name search (json): http://www.imdb.com/xml/find?json=1&nr=1&nm=on&q=jeniffer+garner
     *      Title search (xml): http://www.imdb.com/xml/find?xml=1&nr=1&tt=on&q=lost
     */
    OpenSubtitles.SearchMoviesOnIMDB = function ($query, callback) {
        request('http://www.omdbapi.com/?s=' + encodeURI($query) + '&r=json', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(JSON.parse(body));
            }
        });
    };

    // Returns BASE64 encoded gzipped IDSubtitleFile(s). You need to BASE64 decode and ungzip 'data' to get its contents.
    OpenSubtitles.DownloadSubtitles = function (_folder, _subtitle, _callback) {
        function unzip(url, filename) {
            var output = fs.createWriteStream(filename);

            request({
                    url: url,
                    headers: {
                        'Accept-Encoding': 'gzip'
                    }
                })
                .pipe(zlib.createGunzip())
                .pipe(output);

            output.on('close', function () {
                if (_callback) {
                    _callback();
                }
            });
        }

        unzip(_subtitle.SubDownloadLink, _folder + '/' + _subtitle.SubFileName);
    };

    OpenSubtitles.SearchSubtitles = function (_options, _callback) {
        var queries = [{
            imdbid: _options.movie,
            sublanguageid: _options.language,
            season: _options.season ? _options.season.number : null,
            episode: _options.episode ? _options.episode.number : null
        }];

        if (!token) {
            OpenSubtitles.login(function () {
                var params = [token, queries, {
                    limit: 50
                }];
                client.methodCall('SearchSubtitles', params, function (error, data) {
                    _callback(data.data);
                });
            });
        } else {
            var params = [token, queries, {
                limit: 50
            }];
            client.methodCall('SearchSubtitles', params, function (error, data) {
                _callback(data.data);
            });
        }
    };

    OpenSubtitles.DownloadAll = function (_options, _callback) {
        const path = require('path');
        const os = require('os');
        const async = require('async');
        const archiver = require('archiver');
        fs.mkdtemp(os.tmpdir() + path.sep + 'sub-', (err, folder) => {
            if (err) throw err;

            OpenSubtitles.SearchSubtitles(_options, function (subtitles) {
                var filteredSubs = subtitles.filter(function (_subtitle) {
                    return _subtitle.SubFormat === 'srt';
                });

                async.each(filteredSubs, function (file, callback) {
                    OpenSubtitles.DownloadSubtitles(folder, file, function () {
                        blender(folder + '/' + file.SubFileName, _options.mode, _options.percentage, callback);
                    });
                }, function (err) {
                    if (err)
                        throw err;

                    var zipFile = folder + '/' + '/subtitles.zip';
                    var output = fs.createWriteStream(zipFile);
                    var archive = archiver('zip');
                    archive.pipe(output);
                    output.on('close', function () {
                        filteredSubs.forEach(function (s) {
                            fs.unlink(folder + '/' + s.SubFileName, (err) => {});
                        });
                        _callback(null, zipFile);
                    });
                    filteredSubs.forEach(function (s) {
                        archive.append(fs.createReadStream(folder + '/' + s.SubFileName), {
                            name: s.SubFileName
                        });
                    });

                    archive.finalize();
                });
            });
        });
    };

    OpenSubtitles.ListShowEpisodes = function ($name, callback) {
        request('http://imdbapi.poromenos.org/js/?name=' + encodeURI($name), function (error, response, body) {
            if (error)
                throw error;

            var _result = JSON.parse(body),
                _episodes = _result ? _result[Object.keys(_result)[0]].episodes : [],
                _seasons = [];

            for (var i = 0; i < _episodes.length; i++) {
                var seasonNumber = _episodes[i].season - 1;
                if (_seasons[seasonNumber] && _seasons[seasonNumber].episodes) {
                    if (!_seasons[seasonNumber].episodes.find(function (e) {
                            return e.number === _episodes[i].number
                        })) {
                        _seasons[seasonNumber].episodes.push({
                            name: 'Episode ' + _episodes[i].number,
                            number: _episodes[i].number
                        });
                    }
                } else {
                    _seasons[seasonNumber] = {
                        name: 'Season ' + _episodes[i].season,
                        number: _episodes[i].season,
                        episodes: [{
                            name: 'Episode ' + _episodes[i].number,
                            number: _episodes[i].number
                            }]
                    };
                }
            }

            for (var i = 0; i < _seasons.length; i++) {
                _seasons[i].episodes = _seasons[i].episodes.sort(function (a, b) {
                    return a.number - b.number;
                });
            }

            callback(_seasons);
        });
    };

    OpenSubtitles.GetDetails = function ($imdbId, $type, $name, _callback) {
        const async = require('async');

        async.parallel([(callback) => {
            request('http://www.omdbapi.com/?i=' + $imdbId + '&r=json&plot=short', function (error, response, body) {
                callback(null, JSON.parse(body));
            });
        }, (callback) => {
            if ($type === 'series') {
                OpenSubtitles.ListShowEpisodes($name, function (_seasons) {
                    callback(null, _seasons);
                });
            } else {
                callback();
            }
        }], (err, results) => {
            if (err)
                throw err;
            results[0].seasons = results[1];
            _callback(null, results[0]);
        });
    };

    return OpenSubtitles;
});