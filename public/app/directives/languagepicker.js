(function (ng) {
	'use strict';

	var module = ng.module('app');

	module.directive('bsLanguagePicker', function ($compile) {

		var languagesList = [
			{
				id: 'spa',
				code: 'es',
				country: 'MX',
				fullCode: 'es_MX',
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
				country: 'CA',
				fullCode: 'fr_CA',
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

		function createTemplate(scope) {
			var template = '';
			template += '<a class="bfh-selectbox-toggle dropdown-toggle form-control" role="button" data-toggle="dropdown" href="#">';
			template += '<span class="bfh-selectbox-option">';
			template += '<i class="glyphicon bfh-flag-' + scope.language.country + '"></i>' + scope.language.name;
			template += '</span>';
			template += '<span class="caret selectbox-caret"></span>';
			template += '</a>';

			template += '<div class="bfh-selectbox-options dropdown-menu">';
			template += '<div role="listbox">';
			template += '<ul role="option">';

			if (scope.blank === true) {
				template += '<li><a tabindex="-1" href="#" data-option=""></a></li>';
			}

			ng.forEach(_.sortBy(languagesList, 'name'), function (language) {
				if (scope.flags === true) {
					template += '<li><a bs-language-option tabindex="-1" href="#" data-option="' + language.fullCode + '"><i class="glyphicon bfh-flag-' + language.country + '"></i>' + language.name + '</a></li>';
				} else {
					template += '<li><a tabindex="-1" href="#" data-option="' + language.fullCode + '">' + language.name + ' (Country Name)</a></li>';
				}
			});

			template += '</ul></div></div>';

			return template;
		}

		function getDefaultLanguage() {
			var language = navigator.language,
				filteredLanguage = [];

			//If nothing is returned by the browser just don't select anything
			if (language === undefined) {
				return undefined;
			}

			//Gets the object containing the fullCode
			filteredLanguage = _.filter(languagesList, function (_lang) {
				return _lang.fullCode === language;
			});

			//If at least one object is found, returns it. Otherwise, returns en_US object
			return (filteredLanguage[0] !== undefined) ? filteredLanguage[0] : languagesList[1] //en_US;
		}

		return {
			restrict: 'A',
			scope: {
				blank: "=blank",
				flags: "=flags"
			},

			controller: function ($scope, $element, $attrs) {
				$scope.setSelected = function (_option) {
					$scope.language = _.find(languagesList, function (_lang) {
						return _lang.fullCode === _option;
					});

					$element.find('.bfh-selectbox-option').html('<i class="glyphicon bfh-flag-' + $scope.language.country + '"></i>' + $scope.language.name);

					$element.controller('ngModel').$setViewValue($scope.language.id);
				}
			},

			link: function (scope, element, attrs) {
				scope.language = getDefaultLanguage();
				scope.setSelected(scope.language.fullCode);
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