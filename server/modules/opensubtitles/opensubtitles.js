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
    OpenSubtitles.DownloadSubtitles = function (_subtitle, _callback) {
        function unzip(url, filename) {
            var output = fs.createWriteStream(filename);

            request({
                url: url,
                headers: {
                    'Accept-Encoding': 'gzip'
                }
            }).on('response', function(response) {
                _callback();
              })
              .pipe(zlib.createGunzip())
              .pipe(output);
        }

        unzip(_subtitle.SubDownloadLink, '/tmp/' + _subtitle.SubFileName);
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
                    limit: 1
                }];
                client.methodCall('SearchSubtitles', params, function (error, data) {
                    _callback(data.data[0]);
                });
            });
        } else {
            var params = [token, queries, {
                limit: 1
            }];
            client.methodCall('SearchSubtitles', params, function (error, data) {
                _callback(data.data[0]);
            });
        }
        
        /*
                Output:


                [data] => Array
                    (
                        [0] => Array
                            (
                                [MatchedBy] => moviehash
                                [IDSubMovieFile] => 865
                                [MovieHash] => d745cd88e9798509
                                [MovieByteSize] => 734058496
                                [MovieTimeMS] => 0
                                [IDSubtitleFile] => 1118
                                [SubFileName] => Al sur de Granada (SPA).srt
                                [SubActualCD] => 1
                                [SubSize] => 15019
                                [SubHash] => 0cb51bf4a5266a9aee42a2d8c7ab6793
                                [IDSubtitle] => 905
                                [UserID] => 0
                                [SubLanguageID] => spa
                                [SubFormat] => srt
                                [SubSumCD] => 1
                                [SubAuthorComment] =>
                                [SubAddDate] => 2005-06-15 20:05:35
                                [SubBad] => 1
                                [SubRating] => 4.5
                                [SubDownloadsCnt] => 216
                                [MovieReleaseName] => ss
                                [IDMovie] => 11517
                                [IDMovieImdb] => 349076
                                [MovieName] => Al sur de Granada
                                [MovieNameEng] => South from Granada
                                [MovieYear] => 2003
                                [MovieImdbRating] => 6.4
                                [SubFeatured] => 0
                                [UserNickName] =>
                                [ISO639] => es
                                [LanguageName] => Spanish
                                [SubComments] => 1
                                [SubHearingImpaired] => 0
                                [UserRank] =>
                                [SeriesSeason] =>
                                [SeriesEpisode] =>
                                [MovieKind] => movie
                                [SubDownloadLink] => http://dl.opensubtitles.org/en/download/filead/1118.gz
                                [ZipDownloadLink] => http://dl.opensubtitles.org/en/download/subad/905
                                [SubtitlesLink] => http://www.opensubtitles.org/en/subtitles/905/al-sur-de-granada-es
                            )

                        [1] => Array
           */
    };

    return OpenSubtitles;
});