var mysql = require('mysql');

module.exports = function(app, DBconfig) {

app.get("/top10/:request/:ranking", function (request, response) {
    //var start_dates = request.body.start_date;
    //var end_dates = request.body.end_date;
    var requestType = request.params.request;
    var ranking = request.params.ranking;
    var table = "";
    var ordered = "";
    switch (requestType) {
        case "domain":
            table="DOMAIN_TOTAL";
            break;
        case "referer":
            table="REFERER_TOTAL";
            break;
        case "dorks":
            table="USED_DORKS";
            break;
        default:
            response.send([]);
            return;
    }

    switch (ranking) {
        case "ip":
            ordered = "totCountIP";
            break;
        case "requests":
            ordered = "totCountRequests";
            break;
        case "dork_requests":
            ordered = "totRequests";
            break;
        default:
            response.send([]);
            return;

    }
    var query = "SELECT * FROM "+table+" order by "+ordered+" DESC LIMIT 10";
    var connection = mysql.createConnection({
      host     : DBconfig.host,
      user     : DBconfig.username,
      password : DBconfig.password,
      database : DBconfig.database
    });
    connection.query(query, [table, ordered], function (err, rows) {
        if (err) throw err;
        response.send(rows);
        connection.end(function (err) {
            console.log("Served request for "+requestType+"with ranking "+ ranking);
        });
    });

});
};
