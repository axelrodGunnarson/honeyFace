var mysql = require('mysql');
var async = require('async');
var fs = require('fs');
var sanitizer = require("sanitizer");
var exec = require('child_process').exec;

module.exports = function (app, DBconfig) {
    app.get("/files_specification/:md5", function (request, response){
    var md5 = request.params.md5;
    var connection = mysql.createConnection({
      host     : DBconfig.host,
      user     : DBconfig.username,
      password : DBconfig.password,
      database : DBconfig.database
    });
    queryComment = "SELECT comment from COMMENTS where id=?";
    queryClusters = "SELECT cluster_id, cluster_category_id FROM CLUSTERS where md5=?";
    queryDescription = "SELECT cluster_description FROM CLUSTER_CATEGORIES where cluster_category_id = ?";
    queryTimesSeen = "SELECT sum(times_seen) AS sumti from FILES where md5=?";
    var obj={};
    async.series ([
        function (cb) {
            query = "SELECT path, base_date, last_date, type, category, id_comment from HASHES, CATEGORIES where HASHES.md5=? AND id_category = id";
            connection.query(query, [md5], function (err, rows){
                if (err) throw err;
                obj.base_date = rows[0].base_date;
                obj.last_date = rows[0].last_date;
                obj.md5 = md5;
                obj.path=rows[0].path.split('/').reverse()[0];
                            //not showing the website
                obj.path = obj.path.replace(/_to_.*/,"");

                obj.type = rows[0].type;
                obj.category = rows[0].category;
                obj.id_comment=rows[0].id_comment;
                cb(null);
            });
        },
        function (cb) {
            async.parallel([
                //look for clusters
                function (callback) {
                    connection.query(queryClusters, [md5], function (err,rows) {
                        var arr=[];
                        rows.forEach(function (row) {
                            var ob={};
                            ob.id = row.cluster_id;
                            connection.query(queryDescription, [row.cluster_category_id], function (err,desc){
                                if (err) throw err;
                                if (desc.length===0) {
                                    ob.category = "None";
                                    ob.category_id = -1;
                                }
                                else {
                                    ob.category = desc[0].cluster_description;
                                    ob.category_id = row.cluster_category_id;
                                }
                                arr.push(ob);
                            });
                        });
                    obj.clusters = arr;
                    callback(null);
                    });
                },
                //look for comments
                function (callback) {
                    obj.comment="None";
                    if (obj.id_comment !== null) {
                        connection.query(queryComment, [obj.id_comment], function(err, rows) {
                            if (err) throw err;
                            obj.comment= rows[0].comment;
                            callback(null);
                        });
                    }
                    else
                        callback(null);

                },
                function (callback) {
                    obj.times_seen=1;
                    connection.query(queryTimesSeen, [md5], function(err, rows) {
                        if (err) throw err;
                        obj.times_seen= rows[0].sumti;
                        callback(null);
                    });
                }
                ],
                function (e, result) {
                    //do at the end of async
                    cb(null);
                }
            );
        }],
        function (err, result) {
            connection.end(function (err){
                if (err) throw err;
                console.log("served request for "+md5);
                response.send(obj);
            });
        }
    );
});

app.get("/files_evaluation/:typ/:md5", function (request, response) {
    var md5 = request.params.md5;
    var type = request.params.typ;
    var connection = mysql.createConnection({
      host     : DBconfig.host,
      user     : DBconfig.username,
      password : DBconfig.password,
      database : DBconfig.database
    });
    var obj={};
    var queryPath="SELECT path from HASHES where md5=?";
    connection.query(queryPath, md5, function (err, rows){
        if (err)
            throw err;
        var cmd="";
        switch (type) {
            case "2":
                cmd = 'sudo -u analysis /home/analysis/file_analysis/scripts/single_file_evaluation.py "'+rows[0].path+'"';
                break;
            case "3":
                cmd = 'sudo -u analysis /home/analysis/file_analysis/scripts/single_file_evaluation2.py "'+rows[0].path+'"';
                break;
            default:
                response.send({});
                console.log ("served evaluation of type error");
        }
        var child = exec(cmd, {maxBuffer: 2000*1024}, function (error, stdout, stderr) {
            obj = JSON.parse(stdout.toString());
            obj.file_content = sanitizer.escape(obj.file_content);
            response.send(obj);
            console.log ("served evaluation of type "+type+" for "+md5);
        });
        connection.end();
    });
});

app.post ("/updateComment", function (request, response) {
    var connection = mysql.createConnection({
      host     : DBconfig.host,
      user     : DBconfig.username,
      password : DBconfig.password,
      database : DBconfig.database
    });
    var id_comment = sanitizer.escape (request.body.id_comment);
    var comment = sanitizer.escape(request.body.comment);
    console.log("id_comment = "+id_comment+ " comment = "+comment);
    var md5 = request.body.md5;
    var query="";
    var obj={};
    if (id_comment==='null')
        query="INSERT INTO COMMENTS (comment, id) VALUES (?,?)";
    else
        query ="UPDATE COMMENTS SET comment=? where id = ?";
    connection.query(query, [comment, id_comment], function (err, rows) {
        if (err) throw err;
        if (rows.insertId !== 0) {
            obj.id_comment = rows.insertId;
            console.log("inserted comment for "+ md5);
            connection.query("UPDATE HASHES SET id_comment = ? where md5 = ?", [obj.id_comment, md5], function (err, rows) {
                if (err) throw err;
                });
        }
        else {
            obj.id_comment = id_comment;
            console.log("updated comment for "+ md5);
        }
        obj.comment = comment;
        connection.end(function (err) {
            if(err) throw err;
    console.log("id_comment = "+obj.id_comment+ " comment = "+obj.comment);

            response.send(obj);
        });
    });
});

app.get("/getSingleFile/:md5", function (request, response) {
    var md5=request.params.md5;
    fs.readFile(htmlBasePath+"single_file.html", function (err, data) {
        dat=data.toString();
        dat= dat.replace("MD5OFFILE", md5);
        response.send(dat);
    });
});

app.get("/getSingleFileData/:md5", function (request, response) {
    var connection = mysql.createConnection({
      host     : DBconfig.host,
      user     : DBconfig.username,
      password : DBconfig.password,
      database : DBconfig.database
    });
    var md5=request.params.md5;
    queryFile="SELECT path from HASHES where md5=?";
    connection.query(queryFile, [md5], function (err, rows) {
        if (err) throw err;
        if (rows.length === 0) {
            response.send("not a valid file");
        }
        var path = rows[0].path;
        fs.readFile(path, function (err, data) {
            if (err) throw err;
            console.log("served file "+ md5);
            response.header("text/plain");
            data = data.toString();
            data = sanitizer.escape(data);
            response.send(data.toString());
        });
    });
    connection.end();
});

app.get("/downloadSingleFile/:md5", function (request, response) {
    var md5=request.params.md5;
    var connection = mysql.createConnection({
      host     : DBconfig.host,
      user     : DBconfig.username,
      password : DBconfig.password,
      database : DBconfig.database
    });
    queryFile="SELECT path from HASHES where md5=?";
    connection.query(queryFile, [md5], function (err, rows) {
        if (err) throw err;
        var path = rows[0].path;
        response.download(path, path.split('/').reverse()[0]);
    });
    connection.end();
});
};
