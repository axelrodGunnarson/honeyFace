var handlerClick = function (event) {
        var cluster_id = event.target.id.split("anchor")[0];
        var md5=event.target.id.split("anchor")[1];
        var req = "/files_specification/"+md5;
        $.getJSON(req, function (data) {
            console.log(data);
            $("#"+cluster_id+"anchor"+md5).attr('data-toggle', 'collapse');
            $("#"+cluster_id+"anchor"+md5).attr('data-target', '#'+cluster_id+'filecollapser'+md5);
            $("#"+cluster_id+"filegroup"+md5).append('<div id="'+cluster_id+'filecollapser'+md5+'" class="accordion-body in collapse"></div>');
            $("#"+cluster_id+"filecollapser"+md5).append('<div id="'+cluster_id+'specificInfo'+md5+'" class="accordion-inner"></div>');
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
            $("#"+cluster_id+"specificInfo"+md5).append(tab);
            $("#"+cluster_id+"specificInfo"+md5).append('<a class="btn btn-primary" target="_blank" href="/getSingleFile/'+md5+'">Open File</a> ');
            $("#"+cluster_id+"specificInfo"+md5).append('<a class="btn btn-primary" target="_blank" href="/downloadSingleFile/'+md5+'">Download File</a>');
            $("#"+cluster_id+"anchor"+md5).off("click", handlerClick);
        });
};

$("form").submit(function (e) {
     e.preventDefault();
     var $this = $(this); // `this` refers to the current form element
    $.post(
        $this.attr("action"), // Gets the URL to sent the post to
        $this.serialize(), // Serializes form data in standard format
        function(data) {location.reload();}
    );
});

var modaliClick = function (event) {
    var cluster_id = event.target.id.split("modali")[1];
    $("#clusterN").text(cluster_id);
    $("#clusterModalCat").text($("#typeOf"+cluster_id).text());
    $("#hiddenForCluster").remove();
    $("#modalChoices").append('<input type="hidden" id="hiddenForCluster" name="cluster_id" value="'+cluster_id+'">');
};


var fileRequesterHandler = function (event) {
    var cluster_id = event.currentTarget.id.split("heading")[1];
    var req="/clusters/getFiles/"+cluster_id;
    $.getJSON(req, function (data) {
            console.log(data);
            $("#toggle"+cluster_id).attr('data-toggle', 'collapse');
            $("#toggle"+cluster_id).attr('data-target', '#collapser'+cluster_id);
            $("#heading"+cluster_id).append('<div id="collapser'+cluster_id+'" class="accordion-body in collapse"></div>');

            data.forEach(function (file, index) {
                var filesCharacteristics="Name: "+file.path;
                //$("#collapser"+cluster.id).append('<div id="innerCluster'+file.md5+'" class="accordion-inner"></div>');
                //for each file we create an inner collapse, when clicked it should do a query to the server for asking for more data
                //$("#innerCluster"+file.md5).append('<div id="generalIntern'+file.md5+'" class = "accordion"');
                //$("#generalIntern"+file.md5).append('<div class="accordion-group" id="filegroup'+file.md5+'"></div>');
                $("#collapser"+cluster_id).append('<div class="accordion-group" id="'+cluster_id+'filegroup'+file.md5+'"></div>');
                //$('#filegroup'+file.md5).append('<div class="accordion-heading fileheading" id="fileheading'+file.md5+'"></div>');
                $("#"+cluster_id+"filegroup"+file.md5).append('<a id="'+cluster_id+'anchor'+file.md5+'" class="accordion-toggle vt-p collapsed" style="color: black; padding-left: 20px">'+filesCharacteristics+'</a>');
                $("#"+cluster_id+"anchor"+file.md5).click (handlerClick);
            });
    $("#heading"+cluster_id).off("click", fileRequesterHandler);
    });
};

var clusterSelectionHandler = function (e) {
    //print all clusters here for a certain type wanted
    e.preventDefault();
    var req="";
    if ($("#clusterNumberSelect").val())
        //select values only for a certain cluster
        req = "/clusters/getclusters/internal/cluster/"+$("#clusterNumberSelect").val();
    else {
        if ($("select").val()!="Bogus")
            req="/clusters/getclusters/internal/category/"+$("select").val();
    }
    $("#clustersNone").empty();
    $.getJSON(req, function (data) {
        var categories_modal="";
        $('#TotalNumberOfFiles').text(data.TotalNumberOfFiles);
        $('#TotalNumberOfClusters').text(data.Clusters.length);
        var last_cluster=-1;
        data.Clusters.forEach(function (cluster) {
            $("#clustersNone").append('<div class="row" id="row'+cluster.id+'"></div>'); //append group
            $("#row"+cluster.id).append('<div class="span8" id="span8'+cluster.id+'"></div>'); //append group
            $('#row'+cluster.id).append('<div class="span3" id="span4'+cluster.id+'"></div>');
            $('#span4'+cluster.id).append('<a href ="#decideModal" id="modali'+cluster.id+'" role="button" class="btn modaliClass" data-toggle="modal">Change Category!');
            $('#span8'+cluster.id).append('<div class="accordion-group" id="group'+cluster.id+'"></div>');
            $('#group'+cluster.id).append('<div class="accordion-heading" id="heading'+cluster.id+'"></div>');
            $("#heading"+cluster.id).append('<a id="toggle'+cluster.id+'" class="accordion-toggle vt-p collapsed">Cluster ID: '+cluster.id+' Number Of Files inside cluster: '+cluster.numOfFiles+' Type Of Cluster: <span id="typeOf'+cluster.id+'">'+cluster.description+'</span></a>');
            $("#heading"+cluster.id).click(fileRequesterHandler);
            $("#modali"+cluster.id).click(modaliClick);
            last_cluster = cluster.id;
        });
    if ($("#clusterNumberSelect").val() && last_cluster!= -1) {
        $("#heading"+last_cluster).trigger("click");
    }
    });
};

$(document).ready(function () {
    $("#clusterNumberSelect").width($("#typeSelect").width());
    $("#clusterNumberSelect").height($("#typeSelect").height());
    $("#getClusterbtn").width($("#typeSelect").width());
    $("#getClusterbtn").height($("#typeSelect").height());
    var req = "/getAllCategories";
    var insert = function (req, append_id) {
        var categories_string='<option name="optionsBogus" id="optionBogus" value="Bogus">None Selected</option>';
        var categories_modal = "";
        $.getJSON(req, function (categories_data) {
            categories_data.forEach(function (element) {
                categories_string+='<option name="options'+element.id_category+'" id="option'+element.id_category+'" value="'+element.id_category+'">'+element.name_category+'</option>';
                categories_modal+='<label class="radio"><input type="radio" name="optionsRadios" id="option'+element.id_category+'" value="'+element.id_category+'">'+element.name_category+'</label>';

            });
            $(append_id).append(categories_string);
            categories_modal+='<label class="radio"><input type="radio" name="optionsRadios" id="optionNEW" value="NEW"><input type="text" name="newCategory" id="newCategory" placeholder="Create new Category"></label>';
            $("#modalChoices").append(categories_modal);

        if ($("#categoryForLoading").text() != "CATEGORYFORLOADING") {
            var num_category = $("#categoryForLoading").text();
            $("#typeSelect").val(num_category);
        }
        else if ($("#clusterForLoading").text() != "CLUSTERFORLOADING") {
            $("#clusterNumberSelect").val($("#clusterForLoading").text());
        }
        $("#getClusterbtn").trigger("click");
        });
    };
    insert("/getAllCategories", "#typeSelect");
    $("#getClusterbtn").click(clusterSelectionHandler);

});
