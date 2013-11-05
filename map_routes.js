
var mysql = require('mysql');
var sanitizer = require("sanitizer");

module.exports = function (app, DBconfig) {
app.post ('/map/getData', function (request, response) {
    var start_dates = request.body.start_date;
    var end_dates = request.body.end_date;

    var query="select country_code, count(distinct (ip_src)) as totIPs, avg(hits) as hits, avg(nr_ua) as nr_ua, avg(nr_domains) as nr_domains From GEO_IP where country_code is NOT NULL and date(date) BETWEEN ? AND ? ";
    if (request.body.hasOwnProperty("machines")) {
        var machines = request.body.machines;
        var listOfMachines = { 0: ' 1=1 ',
                             1: ' OR machine="web1" ',
                             2: ' OR machine="web2" ',
                             3: ' OR machine="web3" ',
                             4: ' OR machine="web4" ',
                             5: ' OR machine="web5" ',
                             6: ' OR machine="web6" ',
                             7: ' OR machine="web7" ',
                             8: ' OR machine="web8" '};
        var queryAdd="";
        var first=true;
        machines.forEach(function (el) {
            if (listOfMachines.hasOwnProperty(el)) {
                var added = listOfMachines[el];
                if (first)
                    added=added.replace("OR","");
                queryAdd+=added;
                first=false;
            }
        });
    if (!first)
        query=query+"AND ("+queryAdd+") ";

    }
    if (request.body.hasOwnProperty("displayOptions")) {
        var displayOptions = request.body.displayOptions;
        var listOfOptions = { "crawlers": ' AND is_crawler=0 ',
                            "images": ' AND images=0 '
                        };
        displayOptions.forEach(function(el) {
            for (var name in el) {
                if (listOfOptions.hasOwnProperty(name) && el[name]==='false')
                    query+=listOfOptions[name];
            }
        });
    }


    query+="GROUP BY country_code;";
    var connection = mysql.createConnection({
      host     : DBconfig.host,
      user     : DBconfig.username,
      password : DBconfig.password,
      database : DBconfig.database
    });
    var obj={};
    connection.query(query, [start_dates, end_dates], function (err, rows) {
        if (err) throw err;
        rows.forEach(function (data) {
            obj[data.country_code] = {};
            obj[data.country_code].totIPs = data.totIPs;
            obj[data.country_code].average_hits = data.hits;
            obj[data.country_code].average_domains = data.nr_domains;
            obj[data.country_code].average_ua = data.nr_ua;

        });
    });
    connection.end(function (err) {
        if (err) throw err;
        console.log("served map request for date period: "+start_dates+" - "+ end_dates);
        response.send(obj);
    });
});


};
