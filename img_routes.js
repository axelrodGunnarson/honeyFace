var imgPath="/home/web/Site/";
var fs = require("fs");

module.exports = function (app) {
    app.get("/../img/glyphicons-halflings.png", function (request, response) {
        var imgPath=imgPath+"bootstrap/img/glyphicons-halflings.png";
        fs.readFile(imgPath, function (err, data) {
            response.header("Image/png");
            response.send(data.toString());
        });
    });
};
