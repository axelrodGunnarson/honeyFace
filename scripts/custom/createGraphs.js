var categories = {};
var arrOfFiles = [];

var handlerClick = function (event) {
        var md5=event.target.id.split("anchor")[1];
        var req = "/files_specification/"+md5;
        $.getJSON(req, function (data) {
            console.log(data);
            $("#"+"anchor"+md5).attr('data-toggle', 'collapse');
            $("#"+"anchor"+md5).attr('data-target', '#'+'filecollapser'+md5);
            $("#"+"anchor"+md5).append('<div id="'+'filecollapser'+md5+'" class="accordion-body in collapse"></div>');
            $("#"+"filecollapser"+md5).append('<div id="'+'specificInfo'+md5+'" class="accordion-inner"></div>');
            var tab='<table class="table  table-striped"><tbody><tr><td>md5</td><td>'+data.md5+'</td></tr><tr><td>base date</td><td>'+data.base_date+'</td></tr><tr><td>last date</td><td>'+data.last_date+'</td></tr><tr><td>type</td> <td>'+data.type+'</td> </tr> <tr> <td>category</td> <td>'+data.category+'</td></tr> <tr> <td>comment</td> <td>'+data.comment+'</td></tr>';
            tab +="<tr><td rowspan="+data.clusters.length+">Clusters</td>";
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
            tab += filling +"</tbody> </table>";
            $("#"+"specificInfo"+md5).append(tab);
            $("#"+"specificInfo"+md5).append('<a class="btn btn-primary" target="_blank" href="/getSingleFile/'+md5+'">Open File</a> ');
            $("#"+"specificInfo"+md5).append('<a class="btn btn-primary" target="_blank" href="/downloadSingleFile/'+md5+'">Download File</a>');
            $("#"+"anchor"+md5).off("click", handlerClick);
        });
};



var graphSliceClick = function (dataFromGraph) {
    arrOfmd5 = [];
    dataFromGraph.arrOfIndexes.forEach(function (element) {
        arrOfmd5.push(arrOfFiles[element]);
    });
    $("#myModalLabel").text("Display files for "+ dataFromGraph.name);
    $("#clustersNone").empty();
    if (arrOfmd5.length===0) {
        $("#clustersNone").append('<div class="row"><div class="span11 text-error">All files uploaded are images, You don\'t wanna look at them </div>'); //append group
        $("#sliceDetailModal").modal('toggle');
        return;
    }
    var req = "/graph/getFileNames";
    $.post (req,
        {"arr": arrOfmd5},
        function (data) {
            var len = data.length;
            data.forEach(function (file, index) {
                var filesCharacteristics="Name: "+file.path;
                $("#clustersNone").append('<div class="row" id="row'+file.md5+'"></div>'); //append group
                $("#row"+file.md5).append('<div class="span11" id="span8'+file.md5+'"></div>'); //append group
                $('#span8'+file.md5).append('<div class="accordion-group" id="group'+file.md5+'"></div>');
                $('#group'+file.md5).append('<div class="accordion-heading" id="heading'+file.md5+'"></div>');
                $("#heading"+file.md5).append('<a id="anchor'+file.md5+'" class="accordion-toggle vt-p collapsed" style="color: black">'+filesCharacteristics+'</a>');
                $("#"+"anchor"+file.md5).click (handlerClick);
                if (index === len -1)
                    $("#sliceDetailModal").modal('toggle');
            });
        });

};

$("#ShowPieGraphBtn").click(function (e) {
    $("#infoError").remove();
    var req="/getDataForTodayPie";
    var strDat=$('#start_date').val();
    var obj={"start_date": strDat};
    $(".hero-unit").append('<div class="text-info text-center" id="infoWait"> Wait, I\'m working on your request</div>');
    $.post(req,
        obj,
        function (data) {
        console.log(data);
            $(".newPie").empty();
            $(".todayPie").empty();
            $(".todayPieMachines").empty();
            $(".todayPieRequests").empty();
            $("#listOfFileClusters").empty();
        if (data.listOfFiles.length === 0) {
            $("#graphContainer").prepend('<div class="text-error text-center" id="infoError" style="margin-top:50px"> No files received on day '+strDat+', maybe honeypots are down!?!</div>');

            $("#textBoss").css("display", "none");
            return;
        }
        arrOfFiles = data.listOfFiles;
        $("#infoWait").remove();
        var numFiles=data.numOfNewFiles+data.numOfOldFiles+ data.numOfUnknownFiles;
        $("#numberTotalFiles").text(numFiles);
        $("#numberNewFiles").text(data.numOfNewFiles);
        $("#numberOldFiles").text(data.numOfOldFiles);
        $("#numberUnknownFiles").text(data.numOfUnknownFiles);
        $("#dayOfText").text(strDat);
        var arrTodayGraph=[];
        arrTodayGraph.push({"index":1,"name":"NewFiles", "value":data.numOfNewFiles, "arrOfIndexes": data.listOfNewFiles});
        arrTodayGraph.push({"index":2,"name":"OldFiles", "value":data.numOfOldFiles, "arrOfIndexes": data.listOfOldFiles});
        arrTodayGraph.push({"index":3,"name":"NewUnknownFiles", "value":data.numOfUnknownFiles, "arrOfIndexes": data.listOfUnknownFiles});

        $("#textBoss").css("display", "block");
        var arrReqPerMachine=[];
        var index = 1;
        for (var element in data.numReqPerMachine) {
            //if (data.numReqPerMachine[element]!== 0) {
            arrReqPerMachine.push({"index":index,"name":element, "value":data.numReqPerMachine[element]});
            index+=1;
        //}
        }
        var arrFilesPerMachine=[];
        index = 1;
        for (element in data.numFilesPerMachine) {
            if (data.numFilesPerMachine[element]!==0) {
                arrFilesPerMachine.push({"index":index,"name":element, "value":data.numFilesPerMachine[element], "arrOfIndexes": data.dicOfFilesPerMachine[element]});
                index+=1;
            }
        }
        var arrTodayCategoriesGraph=[];
        index=1;
        for (element in data.newFilesPerCategory) {
            if (data.newFilesPerCategory[element] !== 0) {
                $("#listOfFileClusters").append('<li>'+data.newFilesPerCategory[element]+' files of type <a href = "/clusters/getclusters/external/category/'+categories[element]+'">'+element+'</a>');
                arrTodayCategoriesGraph.push({"index":index,"name":element, "value":data.newFilesPerCategory[element], "arrOfIndexes": data.dicOfFilesPerCategory[element]});
                index+=1;
            }
        }
        var height = 320;
        ay.pie_chart ('todayPie', arrTodayGraph, graphSliceClick, {value: true});
        $(".todayPie").attr("width", $("todayGraph").width());
        $(".todayPie").attr("height", height+height/2);
        ay.pie_chart ('newPie', arrTodayCategoriesGraph, graphSliceClick, {value: true});
        $(".newPie").attr("width", $("todayNewFiles").width());
        $(".newPie").attr("height", height+height/2);
        if (arrReqPerMachine.reduce(function (a,b) {return a+b.value;}, 0) > 0) {
            ay.pie_chart ('todayPieRequests', arrReqPerMachine, function(){}, {value: true});
            $(".todayPieRequests").attr("width", $("todayGraphMachines").width());
            $(".todayPieRequests").attr("height", height+height/2);
        }
        else {
            $(".todayPieRequests").attr("height", 0);
        }
        if (arrFilesPerMachine.reduce(function (a,b) {return a+b.value;}, 0) > 0) {
            ay.pie_chart ('todayPieMachines', arrFilesPerMachine, graphSliceClick, {value: true});
            $(".todayPieMachines").attr("width", $("todayGraphRequests").width());
            $(".todayPieMachines").attr("height", height+height/2);
        }
        else {
            $(".todayPieMachines").attr("height", 0);
        }
    });
});
$(document).ready(function () {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var strDat= date.toISOString().split("T")[0];
    $("#start_date").attr("value",strDat);
    $("#dp_start").attr("data-date",strDat);
    var checkin = $('#dp_start').datepicker()
    .on('changeDate', function(ev) {
    checkin.hide();
    })
    .data('datepicker');
    $.getJSON("/getAllCategories", function (data) {
        data.forEach(function (element) {
            categories[element.name_category] = element.id_category;
        });
        $("#ShowPieGraphBtn").click();

    });
});

