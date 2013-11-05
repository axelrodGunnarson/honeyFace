var htmlBasePath="/home/web/Site/html/";
var fs = require("fs");

module.exports = function (app) {
app.get("/", function (request, response) {
    fs.readFile(htmlBasePath+"index.html", function (err,data) {
        response.send(data.toString());
    });
});
app.get("/stats", function (request, response) {
    fs.readFile(htmlBasePath+"stats.html", function (err, data) {
        response.send(data.toString());
    });
});
app.get("/graphs", function (request, response) {
    fs.readFile(htmlBasePath+"home.html", function (err,data) {
        response.send(data.toString());
    });
});
app.get("/clusterize", function (request, response) {
    fs.readFile(htmlBasePath+"clusterize.html", function (err,data) {
        response.send(data.toString());
    });
});
app.get("/clusters", function (request, response) {
    fs.readFile(htmlBasePath+"clusters.html", function (err,data) {
        response.send(data.toString());
    });
});
app.get("/map", function (request, response) {
    fs.readFile(htmlBasePath+"map.html", function (err,data) {
        response.send(data.toString());
    });
});
app.get("/top10", function (request, response) {
    fs.readFile(htmlBasePath+"top10.html", function (err,data) {
        response.send(data.toString());
    });
});
};
