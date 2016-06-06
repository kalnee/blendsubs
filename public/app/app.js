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
		$scope.max = 10;

		$scope.movie = null;

		$scope.subtitle = {
			movie: null,
			language: null,
			foreignLanguage: null,
			percentual: 10
		};

		$scope.getMovies = function (_query) {
			return $http.get('api/subtitle/search', {
				params: {
					movie: _query,
				}
			}).then(function (response) {
				return response.data.title_popular.map(function (item) {
					return item;
				});
			});
		};

		$scope.onSelect = function ($item, $model, $label) {
			$scope.subtitle.movie = $item.id.replace('tt', '');
			$model = $item.title;
		};

		function executeMerge() {
			var deferred = $q.defer();
			$http.post('api/subtitle/merge', $scope.subtitle)
				.success(function (data) {
					deferred.resolve(data);
				});
			return deferred.promise;
		}

		$scope.merge = function ($evt) {
			var t = executeMerge();

			t.then(function (results) {
				notifier.notify('Subtitle successfully merged!');

				var hiddenElement = document.createElement('a');

				hiddenElement.href = 'data:text/plain;base64,' + results;
				hiddenElement.target = '_blank';
				hiddenElement.download = 'subtitle.srt';
				hiddenElement.click();
			});

			return t;
		};
	});

})(angular);