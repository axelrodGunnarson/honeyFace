var cssPath="/home/web/Site/";
var fs = require("fs");

module.exports = function (app) {
    app.get("/prettify.css", function (request, response) {
        fs.readFile(basePath + "google-code-prettify/prettify.css", function (err, data) {
            response.header("text/css");
            response.send(data.toString());
        });
    });


    app.get("/bootstrap.min.css", function (request, response) {
        fs.readFile(basePath+"bootstrap/css/bootstrap.min.css", function (err, data) {
            response.header("text/css");
            response.send(data.toString());
        });
    });
    app.get("/bootstrap-responsive.min.css", function (request, response) {
        fs.readFile(basePath+"bootstrap/css/bootstrap-responsive.min.css", function (err, data) {
            response.header("text/css");
            response.send(data.toString());
        });
    });
    app.get("/bootstrap-sortable.css", function (request, response) {
        fs.readFile(basePath+"bootstrap/css/bootstrap-sortable.css", function (err, data) {
            response.header("text/css");
            response.send(data.toString());
        });
    });
    app.get("/bootstrap-modal.css", function (request, response) {
        fs.readFile(basePath+"bootstrap/css/bootstrap-modal.css", function (err, data) {
            response.header("text/css");
            response.send(data.toString());
        });
    });

    app.get("/jquery-jvectormap.css", function (request, response) {
        fs.readFile(basePath+"jvectormap/jquery-jvectormap-1.2.2.css", function (err, data) {
            response.header("text/css");
            response.send(data.toString());
        });
    });
    app.get("/datepicker.css", function (request, response) {
        fs.readFile(basePath+"datepicker/css/datepicker.css", function (err, data) {
            response.header("text/css");
            response.send(data.toString());
        });
    });
    app.get("/datepicker.less", function (request, response) {
        fs.readFile(basePath+"datepicker/less/datepicker.less", function (err, data) {
            response.header("text/css");
            response.send(data.toString());
        });
    });
};
