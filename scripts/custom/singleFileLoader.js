var decodeHTML= function (st) {
    var d = document.createElement("div");
    d.innerHTML = st;
    return (d.innerText || d.text || d.textContent);
};


var insertComment= function (e) {
    var obj={};
    obj.comment= $("#commentText").val();
    obj.id_comment = $("#hiddenIdComment").text();
    obj.md5 = $("#md5forloading").text();
    var req= "/updateComment";
    $.post(
        req,
        obj,
        function (data) {
            console.log(data);
            $("#hiddenIdComment").text(data.id_comment);
            $("#tablecomment").text(decodeHTML(data.comment));
            $("#commentInserted").css("visibility", "visible");
        }
    );
};

var evaluateFile = function (e) {
    var req="/files_evaluation/";
    var container;
    var unbinder;
    console.log(e.currentTarget.id);
    switch(e.currentTarget.id) {
        case 'evaluatedFile2':
            req+="2/";
            container = "#evaluedContainer2";
            unbinder = "#evaluatedFile2";
            break;
        case 'evaluatedFile3':
            req+="3/";
            container = "#evaluedContainer3";
            unbinder = "#evaluatedFile3";
            break;
    }
    req+=$("#md5forloading").text();
    $(container).append('<div class="text-info text-center" id="infoWaitEval"> Wait, I\'m working on your request</div>');
    $.getJSON(req, function (data) {
        console.log(data);
        $("#infoWaitEval").remove();
        $("#tableEval").show();
        $("#tableEvalBeforeSize").text(data.beforeSize);
        $("#tableEvalAfterSize").text(data.afterSize);
        $("#tableEvalTimeEvalued").text(data.timesEvaled);
        $("#tableEvalError").text((data.error) ? "YES" : "NO");
        $(container).append(prettyPrintOne(data.file_content, '', true));
//        prettyPrint();
        $(unbinder).unbind("click");
    }).fail( function() {
        $("#infoWaitEval").remove();
        $(container).append('<div class="text-error text-center"> Sorry, but the document is taking too long to be evaluated, you can still analyze the fail through the console as analysis user</div>');
    });
};

$('#commentText').on("propertychange input textInput", function () {
    var left = 640 - $(this).val().length;
    $('#counterComment').text('Characters left: ' + left);
});

$(document).ready (function (){
    $("#dangerousContainer").append('<div class="text-info text-center" id="infoWait"> Wait, I\'m working on your request</div>');
    $.get("/getSingleFileData/"+$("#md5forloading").text(), function (data) {
                $("#infoWait").remove();

        $("#dangerousContainer").append(prettyPrintOne(data, '',true));
//        prettyPrint();
    });
    $("#addComment").click(insertComment);
    $("#evaluatedFile2").click(evaluateFile);
    $("#evaluatedFile3").click(evaluateFile);
    var req = "/files_specification/"+$("#md5forloading").text();
    $.getJSON(req, function (data) {
        $("#tablename").text(data.path);
        $("#tablemd5").text(data.md5);
        $("#tablebase_date").text(data.base_date);
        $("#tablelast_date").text(data.last_date);
        $("#tabletimes_seen").text(data.times_seen);
        $("#tabletype").text(data.type);
        $("#tablecategory").text(data.category);
        $("#tablecomment").text(decodeHTML(data.comment));
        $("#hiddenIdComment").text(data.id_comment);
        if (data.comment!="None") {
            $("#commentText").text(decodeHTML(data.comment));
            var left = 640 - data.comment.length;
            $('#counterComment').text('Characters left: ' + left);
        }
        tab ='<tr class="clusters"><td class="clusters" rowspan='+data.clusters.length+'>Clusters</td>';
            var filling="";
            var ref="";
            data.clusters.forEach(function (cluster, index) {
                if (index!==0) filling+="<tr>";
                if (cluster.category_id === -1)
                    ref = "href='/clusterize'";
                else
                    ref = "href='/clusters/getclusters/external/category/"+cluster.category_id+"'";
                filling+="<td><a href='/clusters/getclusters/external/cluster/"+cluster.id+"'>"+cluster.id+"</a> of Type <a "+ref+">"+cluster.category+"</a></td></tr>";
            });
            filling+="</tr>";
        tab += filling;
        $("#tbody").append(tab);
    });
});
