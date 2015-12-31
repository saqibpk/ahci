var path = require('path');
var http = require('http');
var express = require('express');
var bodyParser= require('body-parser');
var methodOverride= require('method-override');
app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(methodOverride());

app.set('views', path.join(__dirname, 'views'));

var router=require("router");
var route=router();

var main=require('./route.js');
app.use('/',main);

 app.use(express.static(path.join(__dirname, './views')));

db="";
var waterlineConfig = require('./config/waterline')
, waterlineOrm = require('./init/models').waterlineOrm;
var modelPath = path.join(__dirname, '/models');
require('./init/models')(modelPath);
waterlineOrm.initialize(waterlineConfig, function (err, models) {
    if (err) throw err;
	db = function (table) { return models['collections'][table]; };
    db.collections = models.collections;
    db.connections = models.connections;
 http.createServer(app).listen(3000, function () {
        console.log('Express server listening on port ' + 3000);
    });});
