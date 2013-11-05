var decodeHTML= function (st) {
    var d = document.createElement("div");
    d.innerHTML = st;
    return (d.innerText || d.text || d.textContent);
};



$('#ShowGraphbtn').click( function(e) {
    var start_date=$('#start_date').val();
    var req="graphs_single";
    var obj={};
    var arrCat=[];
    var arrFCat=[];
    var re=/option(\d+)/;
    var avoidControlCategories;
    var avoidControlFileCategories;
    if ($("input.category#optionALL").is(":checked"))
        avoidControlCategories=true;
    $("input.category").each(function (index, element){
        if ( (element.checked===true || avoidControlCategories===true ) && element.id!="optionALL")
            arrCat.push(element.id.match(re)[1]);
    });
    if ($("input.fileCategory#optionALL").is(":checked"))
        avoidControlFileCategories=true;
    $("input.fileCategory").each(function (index, element){
        if ( (element.checked === true || avoidControlFileCategories === true ) && element.id!="optionALL")
            arrFCat.push(element.id.match(re)[1]);
    });
    obj.arrayCategories = arrCat;
    obj.arrayFileCategories = arrFCat;
    obj.start_date = start_date;
    $("#canvas").append('<div class="text-info text-center" id="infoWait"> Wait, I\'m working on your request</div>');
    $.post(
        req,
        obj,
        function(json) {
        $("#infoWait").remove();
        console.log(json);
        if (!json.nodes) {
                $('.graph').remove();
                $('#div_tooltip').remove();
                $("#errorDate").remove();
                $('#canvas').append('<p id="errorDate" class="text-error">Sorry, no graph existing for that date');
                return;
        }
        $('.graph').remove();
        $('#div_tooltip').remove();
        $("#errorDate").remove();

        var w = $("#canvas").width();
        var h = 960;
        var tooltipOffsetX=0;
        var tooltipOffsetY=0;
        var div = d3.select("#canvas")
            .append("div")
            .attr("class", "tooltip")
            .attr("id", "div_tooltip")
            .style("opacity", 0);

        var vis = d3.select("#canvas")
            .append("svg:svg")
            .attr('class', 'graph')
            .attr("width", w)
            .attr("height", h)
            .attr("pointer-events", "all")
            .append('svg:g')
            .attr('class','graph')
            .call(d3.behavior.zoom().on("zoom", redraw))
            .append('svg:g')
            .attr('class','graph');

        vis.append('svg:rect')
            .attr('width', w)
            .attr('height', h)
            .attr('fill', 'rgba(1,1,1,0)');

        function setColor (d) {
            function addZero(num){
                if (String(num).length < 2)
                    num = String("0" + num);
                else
                    num = String(num);
                return num;
            }
            var x = d.split(" ");
            return ("#"+
                addZero(Math.round(x[0]*255).toString(16))+
                addZero(Math.round(x[1]*255).toString(16))+
                addZero(Math.round(x[2]*255).toString(16)));
        }
        function redraw() {
            vis.attr("transform","translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")"); }

        var force = d3.layout.force()
            .gravity(0.5)
            .charge(-200)
            .linkDistance(function (d) {return (20+d.weight);})
            .size([w, h]);
/*
        force.drag = function() {
            if (!drag) drag = d3.behavior.drag().origin(d3_identity).on("dragstart.force", d3_layout_forceDragstart).on("drag.force", dragmove).on("dragend.force", d3_layout_forceDragend);
            if (!arguments.length) return drag;
            this.on("mouseover.force", d3_layout_forceMouseover).on("mouseout.force", d3_layout_forceMouseout).call(drag);
        };
*/
        var numberOfNewFiles=0;
        var numOfSingleFiles = 0;
        var numberOfSingleNewFiles = 0;
        var base_date = new Date(start_date);
        var week_base_date = new Date(new Date(base_date).setDate(new Date(base_date).getDate()-7));
        json.nodes.forEach(function (el) {
            var x = new Date(el.base_date);
            if (x >week_base_date)
                numberOfNewFiles+=1;
            if (!el.present)
                numOfSingleFiles +=1;
            if (x >week_base_date && ! el.present)
                numberOfSingleNewFiles +=1;
        });
        $("#globalTableNewFiles").text(numberOfNewFiles + " ("+numberOfSingleNewFiles+" singles)");
        $("#globalTableNumberClusters").text(json.TotalNumberOfClusters + " ("+numOfSingleFiles+" singles)");
        $("#globalTableTotalFiles").text(json.nodes.length + " ("+numOfSingleFiles+" singles)");
        var link = vis.selectAll("line")
            .data(json.links)
            .enter()
                .append("line")
                .attr('class', 'link')
                .style("stroke", function(d) { return setColor(d.color); })
                .style("stroke-width", 3)
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    div.html(100-d.weight)
                        .style("left", (d3.event.pageX + tooltipOffsetX) + "px")
                        .style("top", (d3.event.pageY + tooltipOffsetY) + "px");
                })
                .on("mouseout", function(d) {
                    div.transition()
                    .duration(500)
                    .style("opacity", 0);
                });

        var node = vis.selectAll("g.node")
            .data(json.nodes)
            .enter().append("svg:g")
            .attr("class",function (d) {
                var s="node";
                if (d.present) return s;
                return (s+" singleNode");
            })
            .style("display", function (d) {
                if ($("#activateOneCluster").is(":checked"))
                    return "inline";
                if (d.present)
                    return "inline";
                else
                    return "none";
            });
            //.call(force.drag);
    /*.call(force.drag().origin(function() {
        var t = d3.transform(d3.select(this).attr("transform")).translate;
        return {x: t[0], y: t[1]};
    }).on("drag.force", function() {
        force.stop();
        d3.select(this).attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
    }));*/
            node.append("svg:circle")
                .attr("r", function(d) {return Math.log(parseInt(d.times_seen, 10))+5;} )
                .style("fill", function(d) {
                    var x = new Date(d.base_date);
                    if (x >= week_base_date) {
                        return "yellow";}
                    else if (d.hasOwnProperty("base_shell")) {
                        return "red";}
                    else
                        return "white";
                    })
                .style("stroke", function(d) {return setColor(d.color);})
                .style("stroke-width", "1.5")
                 .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    div .html(d.path)
                        .style("left", (d3.event.pageX + tooltipOffsetX) + "px")
                        .style("top", (d3.event.pageY + tooltipOffsetY) + "px");
                    })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .on("click", function (d) {
                    force.stop();
                    var req = "/files_specification/"+d.md5_original;
                    $.getJSON(req, function (data) {
                        $(".clusters").remove();
                        $("#tablename").text(d.path);
                        $("#tablemd5").text(d.md5_original);
                        $("#tablebase_date").text(d.base_date);
                        $("#tablelast_date").text(d.last_date);
                        $("#tabletimes_seen").text(d.times_seen);
                        $("#tabletype").text(data.type);
                        $("#tablecategory").text(data.category);
                        $("#tablecomment").text(decodeHTML(data.comment));
                        tab ='<tr class="clusters"><td class="clusters" rowspan='+data.clusters.length+'>Clusters</td>';
                        var filling="";
                        var ref="";
                        data.clusters.forEach(function (cluster, index) {
                            if (index!==0) filling+="<tr class='clusters'>";
                            if (cluster.category_id === -1)
                                ref = "href='/clusterize'";
                            else
                                ref = "href='/clusters/getclusters/external/category/"+cluster.category_id+"'";
                            filling+="<td class='clusters'><a href='/clusters/getclusters/external/cluster/"+cluster.id+"'>"+cluster.id+"</a> of Type <a "+ref+">"+cluster.category+"</a></td></tr>";
                        });
                        tab += filling;
                        $("#tbody").append(tab);
                        $("#anchorOpenFile").attr("href", "/getSingleFile/"+d.md5_original);
                        $("#anchorDownloadFile").attr("href", "/downloadSingleFile/"+d.md5_original);
                    });
                });

            force
                .nodes(json.nodes)
                .links(json.links)
                .on("tick", tick)
                .start();

      function tick() {
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")";});

        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        }
    });
});
