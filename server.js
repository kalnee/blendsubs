(function () {

	'use strict'

	var express = require('express');

	//Manage the Node environment variable 
	var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

	var app = express();

	var config = require('./server/config/config')[env];

	//Some Express configurations
	require('./server/config/express')(app, config);

	//Modules
	require('./server/config/modules')(app);

	//Routes
	require('./server/config/routes')(app);

	app.listen(config.port);
	console.log('Listening to the port ' + config.port + ' ...');
})();