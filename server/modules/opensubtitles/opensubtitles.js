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
        token;

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
        request('http://www.imdb.com/xml/find?json=1&nr=1&tt=on&q=' + $query, function (error, response, body) {
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
                }).on('response', function (response) {
                    if (_callback) {
                        _callback();
                    }
                })
                .pipe(zlib.createGunzip())
                .pipe(output);
        }

        unzip(_subtitle.SubDownloadLink, _folder + '/' + _subtitle.SubFileName);
    };

    OpenSubtitles.SearchSubtitles = function (_imdbId, _lang, _callback) {
        //var queries = [{query: 'south park', season: 1, episode: 1, sublanguageid: 'pob'}];
        var queries = [{
            imdbid: _imdbId,
            sublanguageid: _lang
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
                limit: 1
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

            OpenSubtitles.SearchSubtitles(_options.movie, _options.language, function (subtitles) {
                var filteredSubs = subtitles.filter(function (_subtitle) {
                    return _subtitle.SubFormat === 'srt';
                });

                async.each(filteredSubs, function (file, callback) {
                    OpenSubtitles.DownloadSubtitles(folder, file, callback);
                }, function (err) {
                    if (err) {
                        throw err;
                    } else {
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
                    }
                });
            });
        });
    };

    return OpenSubtitles;
});