var mysql = require('mysql');

module.exports = function (app,DBconfig) {
    app.get("/clusterize/getData", function (request, response) {
    var connection = mysql.createConnection({
        host     : DBconfig.host,
        user     : DBconfig.username,
        password : DBconfig.password,
        database : DBconfig.database
        });
    var queryCountFiles = "SELECT COUNT(*) as ris FROM HASHES where base=0";
    var queryCountClusters = "select count(*) as ris from (SELECT cluster_id as ris from CLUSTERS GROUP BY (cluster_id) HAVING COUNT(md5) > 1) as t";
    var queryClustersWithNoType = "SELECT cluster_id as ris from CLUSTERS where cluster_category_id IS NULL GROUP BY (cluster_id) HAVING COUNT(md5) > 1";
    var obj = {};
    obj.ClustersWithNoType=[];
    connection.query(queryCountFiles, function (err, rows) {
        if (err) throw err;
           obj["TotalNumberOfFiles"] = rows[0].ris;
    });
    connection.query(queryCountClusters, function (err, rows) {
        if (err) throw err;
           obj["TotalNumberOfClusters"] = rows[0].ris;
    });
    connection.query(queryClustersWithNoType, function (err, rows) {
        if (err) throw err;
        obj["TotalNumberOfUnknownClusters"] = rows.length;
        rows = rows.splice(0,100);
        queryGetNameMD5 = "SELECT HASHES.md5, path FROM CLUSTERS, HASHES where HASHES.md5=CLUSTERS.md5 AND cluster_id = ? AND base=0 group by CLUSTERS.md5";
        rows.forEach(function (row) {
            var cluster={};
            cluster["id"]=row.ris;
            connection.query(queryGetNameMD5, [row.ris], function (err,rowsFiles) {
                if (err) throw err;
                rowsFiles.forEach(function (single) {
                    single.path = single.path.split('/').reverse()[0];
                                //not showing the website
                    single.path = single.path.replace(/_to_.*/,"");

                });
                cluster["Files"] = rowsFiles;
                obj.ClustersWithNoType.push(cluster);
            });
        });
        connection.end(function (err){
            if (err) throw err;
            console.log("served request clusterize");
            response.send(JSON.stringify(obj));
        });

    });
});
};
