var mysql = require('mysql');
var async = require('async');
var fs = require('fs');


module.exports = function (app,DBconfig) {
    app.get("/clusters/getclusters/external/:type/:id_category", function (request, response) {
        var typ = request.params.type;
        var requested = request.params.id_category;
        var contentHtml = "";
        fs.readFile(htmlBasePath+"clusters.html", function (err,data) {
            contentHtml = data.toString();
            if (typ == 'category')
                contentHtml = contentHtml.replace("CATEGORYFORLOADING", requested);
            else if (typ == 'cluster')
                contentHtml = contentHtml.replace("CLUSTERFORLOADING", requested);
            response.send(contentHtml);
            console.log("served request external of type "+typ+" for cluster "+ requested);
        });
    });

    app.get ("/clusters/getclusters/internal/:type/:id_category", function (request, response) {
        var connection = mysql.createConnection({
            host     : DBconfig.host,
            user     : DBconfig.username,
            password : DBconfig.password,
            database : DBconfig.database
            });
        var typ = request.params.type;
        var requested = request.params.id_category;
        var queryCountFiles ="";
        var queryClustersForCategory = "";
        var countFilesPerCluster = "";
        var queryFindDescription = "SELECT cluster_description from CLUSTERS, CLUSTER_CATEGORIES where cluster_id = ? and CLUSTERS.cluster_category_id = CLUSTER_CATEGORIES.cluster_category_id";

        if (typ === "category") {
            queryCountFiles = "SELECT COUNT(distinct md5) as ris FROM CLUSTERS WHERE cluster_category_id = ?";
            queryClustersForCategory = "SELECT distinct(cluster_id) as ris from CLUSTERS where cluster_category_id = ?";
            countFilesPerCluster = "select count(distinct md5) as ris from CLUSTERS where cluster_id = ?";
        }
        else if (typ === "cluster") {
            queryCountFiles = "SELECT COUNT (distinct md5) as ris FROM CLUSTERS WHERE cluster_id = ?";
            queryClustersForCategory = "SELECT distinct(cluster_id) as ris from CLUSTERS where cluster_id = ?";
            countFilesPerCluster = "select count(distinct md5) as ris from CLUSTERS where cluster_id = ?";
        }
        else {
            connection.end(function() {
                response.send({});
            });
        }

            var obj = {};
            obj.Clusters=[];
            async.parallel([
                function (cb) {
                connection.query(queryCountFiles, [requested], function (err, rows) {
                    if (err) throw err;
                       obj["TotalNumberOfFiles"] = rows[0].ris;
                    cb(null);
                });
            },
            function (cb) {
                connection.query(queryClustersForCategory, [requested], function (err, rows) {
                    if (err) throw err;
                    async.forEach(rows,
                        function (row, cab) {
                            var cluster={};
                            cluster["id"]=row.ris;
                            async.parallel([
                                function (ceb) {
                                    connection.query(countFilesPerCluster, [row.ris], function (err,res) {
                                        if (err) throw err;
                                        cluster.numOfFiles=res[0].ris;
                                        ceb();
                                    });
                                },
                                function (ceb) {
                                    //ask for cluster description for that cluster_id
                                    connection.query(queryFindDescription, [row.ris], function (err, res) {
                                        if (err) throw err;
                                        cluster.description = "None";
                                        if (res[0])
                                            cluster.description = res[0].cluster_description;
                                        ceb();
                                    });
                                }
                            ],
                                function (err, result) {
                                    obj.Clusters.push(cluster);
                                    cab();
                                }
                            );
                        },
                        function (err){
                            cb(null);
                        }
                    );
                });
            }],
            function (err, result) {
                connection.end(function (err){
                    if (err) throw err;
                    console.log("served request internal of type "+typ+" for cluster "+ requested);
                    response.send(obj);
                });
            });
    });

    app.get ("/clusters/getFiles/:id_cluster", function (request, response) {
        var id_cluster=request.params.id_cluster;
        var connection = mysql.createConnection({
            host     : DBconfig.host,
            user     : DBconfig.username,
            password : DBconfig.password,
            database : DBconfig.database
        });
        var queryFilesPerCluster="SELECT HASHES.md5, path from HASHES where md5 in (SELECT distinct(md5) from CLUSTERS where cluster_id=?)";
        var obj=[];
        connection.query(queryFilesPerCluster, [id_cluster], function(err, rows) {
            if (err) throw err;
            rows.forEach(function (row) {
                file = {};
                file.path = row.path.split('/').reverse()[0];
                //not showing the website
                file.path = file.path.replace(/_to_.*/,"");
                file.md5 = row.md5;
                obj.push(file);
            });
        });
        connection.end(function (err){
            if (err) throw err;
            console.log("served request getFiles for cluster "+id_cluster);
            response.send(obj);
        });
    });
};
