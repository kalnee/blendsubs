(function (ng, Ladda) {
	'use strict';

	var module = ng.module('app');
	
	module.value('Toastr', toastr);

	module.factory('notifier', function(Toastr) {
	  return {
	    notify: function(msg) {
	      Toastr.success(msg);
	      console.log(msg);
	    }
	  }
	});
})(angular, Ladda);