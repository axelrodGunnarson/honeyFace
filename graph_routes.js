var mysql = require('mysql');
var async = require('async');
var fs = require('fs');


module.exports = function (app, DBconfig) {
    app.post("/graphs_single", function (request, response) {
/*we take the graph corresponding to last date, load it as a json and set the name of each node as the path (now is the md5).
Basically it has to look on database for the path (HASHES) and put it inside the objet (use md5_original)
then it look for how many times this file has been seen inside FILES (number of things with that md5) and set a parameter
with this number (it will increase the size of the node).
then add a property "new" for the objets that have a base_date > base_date received
*/
    var dates = request.body.start_date;
    var re="";
    var mat = null;
    var base_date = null;
    var obj={};
    var graphPath="";
    var last_year = null;
    var last_month = null;
    var last_date = null;
    var cnt=0;
    re=/(\d{4})\-(\d{2})\-(\d{2})/;
    mat = dates.match(re);
    last_year = mat[1];
    last_month = mat[2];
    last_date = mat[3];
    if (!last_year || !last_month || !last_date) {
        response.send(obj);
        console.log("error in parsing data from "+ request.params.dates);
    }

    graphPath = basePathGraph+last_year+"/"+last_month+"/"+last_date+"/graph.json";
    console.log(graphPath);

    var connection = mysql.createConnection({
              host     : DBconfig.host,
              user     : DBconfig.username,
              password : DBconfig.password,
              database : DBconfig.database
            });
    var arrOfCat = [];
    var arrOfClusters=[];
    var map={};
    var arrOfClusterCategories=request.body.arrayCategories.map (function (a) {return parseInt(a, 10);});
    fs.readFile(graphPath, function (err, data) {
        if (err) {
            response.send(obj);
            console.log("No graphs for date"+dates);
        }
        else {
            async.series([
                function (callback) {
                    async.forEach(
                    request.body.arrayFileCategories,
                    function (el, cb) {
                        connection.query("select category from CATEGORIES where id=?", [el], function (err, rows){
                            if (err) throw err;
                            arrOfCat.push(rows[0].category);
                            cb(null);
                        });
                    },
                    function (err) {
                        callback(null);
                    });
                },
                function (callback) {
                    obj = JSON.parse(data.toString());
                    async.series([
                        //first we set the nodes that will be part of the graph
                        function (call) {
                            async.filter(
                                obj.nodes,
                                function (node, cb) {
                                    //for each node send true if the node is accepted (both for cluster_category and category)
                                    //it's a filter, so if return true node will be accepted otherwise rejected
                                    async.parallel([
                                        function (cab) {
                                            //for all cluster_categories of that file, return true if one of them is among the asked ones (they are in arrOfClusterCategories)
                                            connection.query ('SELECT cluster_category_id from CLUSTERS where md5=?', [node.md5_original], function (err, rows) {
                                                if (err) throw err;
                                                var ret = rows.reduce (
                                                    function(a,b) {
                                                        var t = b.cluster_category_id===null ? 0: b.cluster_category_id;
                                                        return (a || (!!~arrOfClusterCategories.indexOf(t)));
                                                    }, false);
                                                cab (null,ret);
                                            });
                                        },
                                        function (cab) {
                                            //same thing as before but it's easier because a file belong to only one category
                                            connection.query('select category FROM HASHES, CATEGORIES WHERE md5=? and id_category=id', [node.md5_original], function (err, rows) {
                                                if (err) throw err;
                                                var ret = !!~arrOfCat.indexOf(rows[0].category);
                                                cab(null,ret);
                                            });
                                        }
                                        ],
                                        function (err, result) {
                                            if (result[0] && result[1]) {//node accepted
                                                map[obj.nodes.indexOf(node)]=cnt;
                                                cnt+=1;
                                            }
                                            else {
                                                map[obj.nodes.indexOf(node)]=null;
                                            }
                                            cb(result[0] && result[1]);
                                        }
                                    );
                                },
                                function (result) {
                                    obj.nodes=result;
                                    call(null);
                                }
                            );
                        },
                        function (call) {
                            //because we filtered nodes, we need to remap the links and to erase the one connecting to missing nodes
                            async.filter(
                                obj.links,
                                function (link, cb) {
                                    //check if both edges of the link are inside,
                                    if (map[link.source.toString()] === null || map[link.target.toString()] === null) {
                                        cb(false);
                                    }
                                    else {
                                        //set present=true so that it will be displayed as svg
                                        link.source = map[link.source.toString()];
                                        obj.nodes[link.source].present=true;
                                        link.target = map[link.target.toString()];
                                        obj.nodes[link.target].present=true;
                                        cb(true);
                                    }
                                },
                                function (result) {
                                    obj.links = result;
                                    call(null);
                                }
                            );
                        }
                        ],
                        function (err, result) {
                            callback(null);
                        }
                    );
                },
                //we selected both nodes and edges that will be in the graph, now we can fill infos for nodes
                //nodes present will be the ones are for specified cluster categories
                function (callback) {
                    async.forEach(
                        obj.nodes,
                        function (element, cb) {
                            async.parallel([
                                function (callbac) {
                                    connection.query('select PATH AS result from HASHES WHERE md5=?', [element.md5_original],
                                    function(err, rows) {
                                        if (err) throw err;
                                        element['path']=rows[0].result.split('/').reverse()[0]; //write only the filename, not the whole path
                                                    //not showing the website
                                        element.path = element.path.replace(/_to_.*/,"");

                                        callbac(null);
                                    });
                                },
                                function (callbac) {
                                    connection.query('SELECT COUNT(*) AS ris FROM FILES where md5 = ?', [element.md5_original],
                                    function(err, rows) {
                                        if (err) throw err;
                                        element.times_seen = rows[0].ris; //write the number of times i saw that file
                                        callbac(null);
                                    });
                                },
                                function (callbac) {
                                    if (arrOfClusters.indexOf(element["color"]) === -1) arrOfClusters.push(element["color"]);
                                    callbac(null);
                                }
                                ],
                                function (err, result) {
                                    cb();
                                });
                        },
                        function (err) {
                            callback(null);
                        }
                    );
                }
                ],
                function (err, result) {
                    connection.end(function (err){
                        if (err) throw err;
                        obj.TotalNumberOfClusters = arrOfClusters.length;
                        console.log("served graph request "+graphPath);
                        response.send(obj);
                    });
                }
            );
        }
    });
});
app.post('/graph/getFileNames', function (request, response) {
    var arrOfMd5 = request.body.arr;
    var connection = mysql.createConnection({
        host     : DBconfig.host,
        user     : DBconfig.username,
        password : DBconfig.password,
        database : DBconfig.database
    });
    var query = "SELECT path FROM HASHES where md5=?";
    var fileArr = [];
    async.forEach(
        arrOfMd5,
        function (element, callbac) {
            connection.query(query, [element], function (err, rows) {
                if (err) throw err;
                var obj ={"md5": element};
                obj.path=rows[0].path.split('/').reverse()[0];
                            //not showing the website
                obj.path = obj.path.replace(/_to_.*/,"");

                fileArr.push(obj);
                callbac();
            });
        },
        function (err) {
            connection.end( function (err) {
                response.send(fileArr);
                console.log("served getFileNames");
            });
        });
});
app.post('/getDataForTodayPie', function (request, response) {
    var dates = request.body.start_date;
    var re="";
    var mat = null;
    var base_date = null;
    var graphPath="";
    var last_year = null;
    var last_month = null;
    var last_date = null;
    var cnt=0;
    re=/(\d{4})\-(\d{2})\-(\d{2})/;
    mat = dates.match(re);
    last_year = mat[1];
    last_month = mat[2];
    last_date = mat[3];
    if (!last_year || !last_month || !last_date) {
        response.send(obj);
        console.log("error in parsing data from "+ request.params.dates);
    }
    var arrMachines = ["web1", "web2", "web3", "web4", "web5", "web6", "web7", "web8"];
    var connection = mysql.createConnection({
        host     : DBconfig.host,
        user     : DBconfig.username,
        password : DBconfig.password,
        database : DBconfig.database
    });

    async.parallel ([
        function(cb) {
            graphPath = basePathGraph+last_year+"/"+last_month+"/"+last_date+"/pie_graph.json";
            var obj={};
            fs.readFile(graphPath, function (err, data) {
                if (err) {
                    console.log("No graphs for date "+dates);
                    response.send({});
                }
                else {
                    obj=JSON.parse(data.toString());
                }
                cb(null, obj);
            });
        },
        function(cb){
            query = "SELECT nr_request_real FROM GENERAL_REQUEST where date(date)=? and machine=?";
            var numReqPerMachines = {};
            async.forEach(
                arrMachines,
                function (element, callbac) {
                    connection.query(query, [dates, element], function (err, rows) {
                        if (err) throw err;
                        if (!rows[0])
                            numReqPerMachines[element]=0;
                        else
                            numReqPerMachines[element]=rows[0].nr_request_real;
                        callbac();
                    });
                },
                function (err) {
                    connection.end( function (err) {
                        cb(null, numReqPerMachines);
                    });
                });
        }
        ],
        function(err, result){
            var finObj= result[0];
            finObj.numReqPerMachine=result[1];
            response.send(finObj);
            console.log("served pie graph request for date "+ dates);
        }
    );

});
};
