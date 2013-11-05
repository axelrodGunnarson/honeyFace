var basePath="/home/web/Site/";
var customScriptPath="/home/web/Site/scripts/custom/";
var standardScriptPath="/home/web/Site/scripts/standard/";

var fs = require("fs");

module.exports = function (app) {
    app.get ("/prettify.js", function (request, response) {
        fs.readFile(basePath + "google-code-prettify/prettify.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });

    app.get("/bootstrap.min.js", function (request, response) {
        fs.readFile(basePath+"bootstrap/js/bootstrap.min.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });

    app.get("/bootstrap-modal.js", function (request, response) {
        fs.readFile(basePath+"bootstrap/js/bootstrap-modal.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });
    app.get("/bootstrap-modalmanager.js", function (request, response) {
        fs.readFile(basePath+"bootstrap/js/bootstrap-modalmanager.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });

    app.get("/jquery-jvectormap.js", function (request, response) {
        fs.readFile(basePath+"jvectormap/jquery-jvectormap-1.2.2.min.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });

    app.get("/jvectormap-world-mill-en.js", function (request, response) {
        fs.readFile(basePath+"jvectormap/jvectormap-world-mill-en.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });

    app.get("/jquery", function (request, response) {
        fs.readFile(standardScriptPath+"jquery-2.0.0.min.js", function (err,data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });
    app.get("/d3", function (request, response) {
        fs.readFile(standardScriptPath+"d3.v3.min.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });
    app.get("/d3.geom", function (request, response) {
        fs.readFile(standardScriptPath+"d3.geom.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });
    app.get("/d3.layout", function (request, response) {
        fs.readFile(standardScriptPath+"d3.layout.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });
    app.get("/d3.ay-pie-chart", function (request, response) {
        fs.readFile(standardScriptPath+"d3.ay-pie-chart.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });
    app.get ("/working.js", function (request, response) {
        fs.readFile(customScriptPath+"working.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });
    app.get ("/stats_manager.js", function (request, response) {
        fs.readFile(customScriptPath+"stats_manager.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });
    app.get ("/createGraphs.js", function (request, response) {
        fs.readFile(customScriptPath+"createGraphs.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });
    app.get ("/ready.js", function (request, response) {
        fs.readFile(customScriptPath+"ready.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });
    app.get ("/clusterize.js", function (request, response) {
        fs.readFile(customScriptPath+"clusterize.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });

    app.get ("/singleFileLoader.js", function (request, response) {
        fs.readFile(customScriptPath + "singleFileLoader.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });

    app.get ("/getclusters.js", function (request, response) {
        fs.readFile(customScriptPath + "getclusters.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });

    app.get ("/WorldMapDataFeed.js", function (request, response) {
        fs.readFile(customScriptPath + "worldMapDataFeed.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });
    app.get ("/top10.js", function (request, response) {
        fs.readFile(customScriptPath + "top10.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });

    app.get("/bootstrap-sortable.js", function (request, response) {
        fs.readFile(basePath+"bootstrap/js/bootstrap-sortable.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });
    app.get("/datepicker.js", function (request, response) {
        fs.readFile(basePath+"datepicker/js/bootstrap-datepicker.js", function (err, data) {
            response.header("text/javascript");
            response.send(data.toString());
        });
    });
};
