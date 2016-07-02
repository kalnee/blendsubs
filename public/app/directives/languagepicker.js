(function (ng) {
	'use strict';

	var module = ng.module('app');

	module.directive('bsLanguagePicker', function ($compile) {

		var languagesList = [
			{
				id: 'spa',
				code: 'es',
				country: 'ES',
				fullCode: 'es',
				name: 'Spanish'
			},
			{
				id: 'eng',
				code: 'en',
				country: 'US',
				fullCode: 'en_US',
				name: 'English'
			},
			{
				id: 'fre',
				code: 'fr',
				country: 'FR',
				fullCode: 'fr',
				name: 'French'
			},
			{
				id: 'pob',
				code: 'pt',
				country: 'BR',
				fullCode: 'pt_BR',
				name: 'Portuguese (Brazil)'
			}
			/*'rum': 'Romanian',
			'tur': 'Turkish',
			'dut': 'Dutch',
			'fre': 'French',
			'ger': 'German',
			'lit': 'Lithuanian',
			'lat': 'Latvian',
			'hun': 'Hungarian',
			'rus': 'Russian',
			'ukr': 'Ukrainian',
			'fin': 'Finnish',
			'bul': 'Bulgarian'*/
		];

		var filteredLanguageList = [];

		function createTemplate(scope) {
			var template = '';
			template += '<a class="bfh-selectbox-toggle dropdown-toggle form-control" role="button" data-toggle="dropdown" href="#">';
			template += '<span class="bfh-selectbox-option">';
			if (scope.language !== null) {
				template += '<i class="glyphicon bfh-flag-' + scope.language.country + '"></i>' + scope.language.name;
			} else {
					template += 'Select a language';
			}
			template += '</span>';
			template += '<span class="caret selectbox-caret"></span>';
			template += '</a>';

			template += '<div class="bfh-selectbox-options dropdown-menu">';
			template += '<div role="listbox">';
			template += '<ul role="option">';

			ng.forEach(_.sortBy(filteredLanguageList, 'name'), function (language) {
				if (scope.flags === true) {
					template += '<li><a bs-language-option href="#" data-option="' + language.fullCode + '"><i class="glyphicon bfh-flag-' + language.country + '"></i>' + language.name + '</a></li>';
				} else {
					template += '<li><a href="#" data-option="' + language.fullCode + '">' + language.name + ' (Country Name)</a></li>';
				}
			});

			template += '</ul></div></div>';

			return template;
		}

		return {
			restrict: 'A',
			scope: {
				flags: "=",
				includes: "@"
			},

			controller: function ($scope, $element, $attrs) {
				$scope.init = function() {
					var includedLanguages = $scope.includes.split(',');

					filteredLanguageList = _.filter(languagesList, function(language) {
						return _.contains(includedLanguages, language.fullCode);
					});
				}

				$scope.init();

				$scope.setSelected = function (_option) {
					$scope.language = _.find(filteredLanguageList, function (_lang) {
						return _lang.fullCode === _option;
					});

					$element.find('.bfh-selectbox-option').html('<i class="glyphicon bfh-flag-' + $scope.language.country + '"></i>' + $scope.language.name);

					$element.controller('ngModel').$setViewValue($scope.language.id);
				}
			},

			link: function (scope, element, attrs) {
				scope.language = null;
				element.addClass('bfh-selectbox');
				element.addClass('bfh-languages');
				element.addClass('dropdown');

				element.html('');

				element.append($compile(createTemplate(scope))(scope));
			}
		}
	});

	module.directive('bsLanguageOption', function () {
		return {
			restrict: 'A',
			require: '?bsLanguagePicker',

			link: function (scope, element, attrs) {
				element.bind('click', function () {
					scope.setSelected(attrs.option);
				});
			}
		}
	});

})(angular);
