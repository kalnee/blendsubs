(function (ng, Ladda) {
	'use strict';

	var module = ng.module('app'),
	    directiveId = 'bsButton';

	module.directive(directiveId, function ($parse) {
		return {
			restrict: 'A',

			link: function (scope, element, attrs) {
				var fn = $parse(attrs[directiveId]);
				
				element.addClass('ladda-button');
				attrs.$set('data-style', 'expand-left');
				attrs.$set('type', 'button');

				element.on('click', function (event) {
                	scope.$apply(function () {
                		attrs.$set('disabled', true);
                		event.preventDefault();
	 					var l = Ladda.create(element[0]);
	 					l.start();
	 					fn(scope, { $event: event })
	                    .then(function (res) {
	                        attrs.$set('disabled', false);
	                        l.stop();
	                        return res;
	                    }, function (res) {
	                        attrs.$set('disabled', false);
	                        l.stop();
	                    });
	                });
                });

				
			}
		}
	});

})(angular, Ladda);