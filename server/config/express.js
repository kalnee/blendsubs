var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser');

module.exports = function(app, config) {

    app.set('views', config.rootPath + '/server/views');
    app.set('view engine', 'jade');
    //In replace to express.logger('dev')
    app.use(logger('dev'));
    //In replace to express.bodyParser()
    app.use(bodyParser.urlencoded({
      extended: true
    }));
    app.use(bodyParser.json());
    
    app.use(express.static(config.rootPath + '/public'));

}