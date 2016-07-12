if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function () {
    "use strict";

    var provider = require('../provider/opensubtitles');

    function Subtitle() {

    }

    Subtitle.searchMoviesOnIMDB = function ($query, callback) {
        provider.SearchMoviesOnIMDB($query, callback);
    };

    Subtitle.downloadAll = function (_options, _callback) {
        provider.DownloadAll(_options, _callback);
    };

    Subtitle.getDetails = function ($imdbId, $type, $name, $year, _callback) {
        provider.GetDetails($imdbId, $type, $name, $year, _callback);
    };

    return Subtitle;
});
