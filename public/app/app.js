(function (ng) {
  'use strict';

  var module = ng.module('app', ['ngRoute', 'ngResource', 'ui-rangeSlider', 'ui.bootstrap']);

  module.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/', {
        templateUrl: '/partials/main',
        controller: 'MainCtrl'
      });
  });

  module.controller('MainCtrl', function ($scope, $http, $q, notifier) {
    $scope.min = 0;
    $scope.max = 100;

    $scope.movie = null;

    $scope.subtitle = {
      movie: null,
      language: null,
      foreignLanguage: null,
      percentage: 0,
      mode: null,
      season: null,
      episode: null
    };

    $scope.getMovies = function (_query) {
      return $http.get('api/subtitle/search', {
        params: {
          movie: _query,
        }
      }).then(function (response) {
        if (response.data.Search) {
          return response.data.Search.filter(function (item) {
            return item.Type === 'movie' || item.Type === 'series';
          });
        }
      });
    };

    $scope.onSelect = function ($item, $model, $label) {
      $scope.subtitle.movie = $item.imdbID.replace('tt', '');
      $model = $item.Title;
      $http.get('api/subtitle/details', {
        params: {
          id: $item.imdbID,
          name: $item.Title,
          type: $item.Type,
          year: $item.Year.substring(0, 4)  
        }
      }).then(function (response) {
        $scope.title = response.data;
	// Set default options for season and episode
	if (!_.isEmpty($scope.title.seasons)) {
		$scope.subtitle.season = $scope.title.seasons[0];
		$scope.subtitle.episode = $scope.subtitle.season.episodes[0];
	}
      });
    };

    function executeDownload() {
      var deferred = $q.defer();
      $http.post('api/subtitle/download', $scope.subtitle, {
          responseType: 'arraybuffer'
        })
        .success(function (data) {
          deferred.resolve(data);
        });
      return deferred.promise;
    }

    $scope.download = function ($evt) {
      var t = executeDownload();

      t.then(function (results) {
        notifier.notify('Subtitles successfully generated!');

        var hiddenElement = document.createElement('a');
        var blob = new Blob([results], {
          'type': "application/octet-stream"
        });
        hiddenElement.href = URL.createObjectURL(blob);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'subtitles.zip';
        hiddenElement.click();
      });

      return t;
    };

    $scope.clear = function () {
      $scope.subtitle = {
        movie: null,
        language: null,
        foreignLanguage: null,
        percentage: 0,
        mode: null,
        season: null,
        episode: null
      };

      $scope.movie = null;
      $scope.title = null;

    };

    $scope.showPercentageBar = function() {
      if ($scope.subtitle.mode === 'translation') {
        return $scope.subtitle.language !== null && $scope.subtitle.foreignLanguage !== null;
      }

      return $scope.subtitle.language !== null;
    }
  });

})(angular);
