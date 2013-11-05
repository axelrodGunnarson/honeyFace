
var mysql = require('mysql');

module.exports = function(app,DBconfig) {
app.get("/getAllCategories", function (request, response) {
    var query="SELECT cluster_category_id, cluster_description FROM CLUSTER_CATEGORIES";
    var connection = mysql.createConnection({
      host     : DBconfig.host,
      user     : DBconfig.username,
      password : DBconfig.password,
      database : DBconfig.database
    });
    var arr=[];
    connection.query(query, function (err, rows) {
        if (err) throw err;
        rows.forEach(function (data) {
            obj={};
            obj.name_category = data.cluster_description;
            obj.id_category = data.cluster_category_id;
            arr.push(obj);
        });
    });
    connection.end(function (err) {
        if (err) throw err;
        response.send(arr);
    });
});

app.get("/getAllFileCategories", function (request, response) {
    var query="SELECT id, category FROM CATEGORIES group by category";
    var connection = mysql.createConnection({
      host     : DBconfig.host,
      user     : DBconfig.username,
      password : DBconfig.password,
      database : DBconfig.database
    });
    var arr=[];
    connection.query(query, function (err, rows) {
        if (err) throw err;
        rows.forEach(function (data) {
            obj={};
            obj.name_category = data.category;
            obj.id_category = data.id;
            arr.push(obj);
        });
    connection.end(function (err) {
        if (err) throw err;
        response.send(arr);
    });

    });
});

app.post("/updateCategory", function (request, response) {
    var connection = mysql.createConnection({
      host     : DBconfig.host,
      user     : DBconfig.username,
      password : DBconfig.password,
      database : DBconfig.database
    });
    var option = request.body.optionsRadios;
    var cluster_id = request.body.cluster_id;
    var q1="UPDATE CLUSTERS SET cluster_category_id = ? where cluster_id=?";
    if (request.body.hasOwnProperty('newCategory') && option ==="NEW") {
        var cat = sanitizer.escape(request.body.newCategory);
        connection.query("SELECT max(cluster_category_id) as cid from CLUSTER_CATEGORIES", function (err, success) {
            if (err) throw err;
            var id = success[0].cid+1;
            connection.query("INSERT INTO CLUSTER_CATEGORIES (cluster_category_id, cluster_description) VALUES (?,?)", [id, cat], function (err,success) {
                    if (err) throw err;
                    console.log("inserted new cluster category id "+id+" description "+cat);
                });
            connection.query(q1, [id, cluster_id], function (err, success) {
                if (err) throw err;
                    console.log("updated cluster "+ cluster_id+" with cluster category id "+option);
            });
            connection.end(function (err) {
                if(err) throw err;
                response.send("ack");
            });

        });
    }
    else {
        connection.query(q1, [option, cluster_id], function (err, success) {
            if (err) throw err;
            console.log("updated cluster "+ cluster_id+" with cluster category id "+option);
            connection.end(function (err) {
                if(err) throw err;
                response.send("ack");
            });

        });
    }
});


};
