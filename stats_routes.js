var mysql = require('mysql');


module.exports = function (app, DBconfig) {
    app.post("/getStats", function (request, response) {
    var start_date=request.body.start_date;
    var end_date=request.body.end_date;
    var connection = mysql.createConnection({
              host     : DBconfig.host,
              user     : DBconfig.username,
              password : DBconfig.password,
              database : DBconfig.database
            });
    var query_pcap = "SELECT count(*) as num_tries, inet_ntoa(ip_dst) as dst_ip, dst_port, host as dst_host from pcap_logs where from_unixtime(timestamp) BETWEEN ? AND ? group by inet_ntoa(ip_dst), dst_port";
    connection.query(query_pcap, [start_date, end_date], function (err, rows) {
        if (err)
            throw (err);
        response.send(rows);
        });
    connection.end();
});
app.post("/stats/detailsRequest", function (request, response) {
    var ip=request.body.ip;
    var port = request.body.port;
    var start_date=request.body.start_date;
    var end_date=request.body.end_date;
        var connection = mysql.createConnection({
              host     : DBconfig.host,
              user     : DBconfig.username,
              password : DBconfig.password,
              database : DBconfig.database
            });
    var queryDetailsPcap = "SELECT from_unixtime(timestamp) as time, request from pcap_logs where from_unixtime(timestamp) BETWEEN ? AND ? and inet_ntoa(ip_dst)=? and dst_port = ?";
    connection.query(queryDetailsPcap, [start_date, end_date, ip, port], function (err, rows) {
        if (err)
            throw err;
        response.send(rows);
        console.log("served details for ip "+ip+" port"+port);
    });
    connection.end();
});
};
