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
    $("#myModalLabel").text("Cluster "+cluster_id);
    $("#hiddenForCluster").remove();
    $("#modalChoices").append('<input type="hidden" id="hiddenForCluster" name="cluster_id" value="'+cluster_id+'">');
};

$(document).ready(function () {
    var req = "/clusterize/getData";
    $.getJSON(req, function (data) {
        console.log(data);
        var categories_modal="";
        var req="/getAllCategories";
        $.getJSON(req, function (categories_data) {
            console.log(categories_data);
            categories_data.forEach(function (element) {
                categories_modal+='<label class="radio"><input type="radio" name="optionsRadios" id="option'+element.id_category+'" value="'+element.id_category+'">'+element.name_category+'</label>';
            });
            categories_modal+='<label class="radio"><input type="radio" name="optionsRadios" id="optionNEW" value="NEW"><input type="text" name="newCategory" id="newCategory" placeholder="Create new Category"></label>';
            $("#modalChoices").append(categories_modal);
        });
        $('#TotalNumberOfFiles').text(data.TotalNumberOfFiles);
        $('#TotalNumberOfClusters').text(data.TotalNumberOfClusters);
        $('#TotalNumberOfUnknownClusters').text(data.TotalNumberOfUnknownClusters);
        data.ClustersWithNoType.forEach(function (cluster) {
            $("#clustersNone").append('<div class="row" id="row'+cluster.id+'"></div>'); //append group
            $("#row"+cluster.id).append('<div class="span8" id="span8'+cluster.id+'"></div>'); //append group
            $('#span8'+cluster.id).append('<div class="accordion-group" id="group'+cluster.id+'"></div>');
            $('#group'+cluster.id).append('<div class="accordion-heading" id="heading'+cluster.id+'"></div>');
            $("#heading"+cluster.id).append('<a class="accordion-toggle vt-p collapsed" data-toggle="collapse" data-target="#collapser'+cluster.id+'">Cluster ID: '+cluster.id+' Number Of Files inside cluster: '+cluster.Files.length+'</a>');
            $('#row'+cluster.id).append('<div class="span4" id="span4'+cluster.id+'">');
            $('#span4'+cluster.id).append('<a href ="#decideModal" id="modali'+cluster.id+'" role="button" class="btn modaliClass" data-toggle="modal">Clusterize!');
            $("#modali"+cluster.id).click(modaliClick);
            $("#heading"+cluster.id).append('<div id="collapser'+cluster.id+'" class="accordion-body collapse"></div>');
            cluster.Files.forEach(function (file, index) {
                var filesCharacteristics="Name: "+file.path;
                //$("#collapser"+cluster.id).append('<div id="innerCluster'+file.md5+'" class="accordion-inner"></div>');
                //for each file we create an inner collapse, when clicked it should do a query to the server for asking for more data
                //$("#innerCluster"+file.md5).append('<div id="generalIntern'+file.md5+'" class = "accordion"');
                //$("#generalIntern"+file.md5).append('<div class="accordion-group" id="filegroup'+file.md5+'"></div>');
                $("#collapser"+cluster.id).append('<div class="accordion-group" id="'+cluster.id+'filegroup'+file.md5+'"></div>');
                //$('#filegroup'+file.md5).append('<div class="accordion-heading fileheading" id="fileheading'+file.md5+'"></div>');
                $("#"+cluster.id+"filegroup"+file.md5).append('<a id="'+cluster.id+'anchor'+file.md5+'" class="accordion-toggle vt-p collapsed" style="color: black; padding-left: 20px">'+filesCharacteristics+'</a>');
                $("#"+cluster.id+"anchor"+file.md5).click (handlerClick);
            });
        });

    });
});



