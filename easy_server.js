
var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json"));
var DBconfig = JSON.parse(fs.readFileSync("db_config.json"));
var host = config.host;
var port = config.port;
var express = require("express");
//just for checking (required by modules anyway)
var mysql = require('mysql');
var async = require('async');
var sanitizer = require("sanitizer");
var exec = require('child_process').exec;

var app = express();
app.use(express.bodyParser());

var basePathGraph = "/home/analysis/graphs/";


var htmlRoutes = require("./html_routes.js");

htmlRoutes(app, DBconfig);

var jsRoutes = require("./js_routes.js");

jsRoutes(app, DBconfig);

var cssRoutes = require("./css_routes.js");

cssRoutes(app, DBconfig);

var imgRoutes = require("./css_routes.js");

imgRoutes(app, DBconfig);

//added void connection.end in file_specification and download, if not working erase them

var clustersRoutes = require("./cluster_routes.js");

clustersRoutes(app, DBconfig);

var clusterizeRoutes = require("./clusterize_routes.js");

clusterizeRoutes(app, DBconfig);

var singleFileRoutes = require("./single_file_routes.js");

singleFileRoutes(app, DBconfig);

var graphRoutes = require("./graph_routes.js");

graphRoutes(app, DBconfig);

var statsRoutes = require("./stats_routes.js");

statsRoutes(app, DBconfig);

var mapRoutes = require("./map_routes.js");

mapRoutes(app, DBconfig);

var top10Routes = require("./top10_routes.js");

top10Routes(app, DBconfig);

var categoriesRoutes = require("./categories_routes.js");

categoriesRoutes(app, DBconfig);


console.log("created");
app.listen(port);
console.log("listening..");
