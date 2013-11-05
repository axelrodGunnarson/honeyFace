var insertRefererData = function (e) {
    var req = "/top10/referer/";
    //var start_date=$('#start_date_referer').val();
    //var end_date = $('#end_date_referer').val();
    //obj={"start_date": start_date, "end_date": end_date};
    $("#infoWaitReferer").remove();
    $("#topRefererBody").empty();
    $("#ipColumnReferer").removeAttr("data-defaultsort");
    $("#reqColumnReferer").removeAttr("data-defaultsort");

    $("#topRefererContainer").append('<div class="text-info text-center" id="infoWaitReferer"> Wait, I\'m working on your request</div>');
    switch (e.currentTarget.id) {
        case "ShowRefererIPbtn":
            req+="ip";
            $("#ipColumnReferer").attr("data-defaultsort","desc");
            break;
        case "ShowRefererReqbtn":
            req+="requests";
            $("#reqColumnReferer").attr("data-defaultsort","desc");
            break;
        default:
            return;
    }
    $.getJSON(req,
        function (json) {
            $("#infoWaitReferer").remove();
            json.forEach(function (entry){
                var row='<tr><td>'+entry.url+'</td> <td>'+entry.totCountIP+'</td> <td>'+entry.totCountRequests+'</td></tr>';
                $("#topRefererBody").append(row);
            });
            $.bootstrapSortable(false);
        });
};

var insertDomainData = function (e) {
    var req = "/top10/domain/";
    //var start_date=$('#start_date_referer').val();
    //var end_date = $('#end_date_referer').val();
    //obj={"start_date": start_date, "end_date": end_date};
    $("#infoWaitDomain").remove();
    $("#topDomainBody").empty();
    $("#ipColumnDomain").removeAttr("data-defaultsort");
    $("#reqColumnDomain").removeAttr("data-defaultsort");

    $("#topDomainContainer").append('<div class="text-info text-center" id="infoWaitDomain"> Wait, I\'m working on your request</div>');
    switch (e.currentTarget.id) {
        case "ShowDomainIPbtn":
            req+="ip";
            $("#ipColumnDomain").attr("data-defaultsort","desc");
            break;
        case "ShowDomainReqbtn":
            req+="requests";
            $("#reqColumnDomain").attr("data-defaultsort","desc");
            break;
        default:
            return;
    }
    $.getJSON(req,
        function (json) {
            $("#infoWaitDomain").remove();
            json.forEach(function (entry){
                var row='<tr><td>'+entry.domain+'</td> <td>'+entry.totCountIP+'</td> <td>'+entry.totCountRequests+'</td></tr>';
                $("#topDomainBody").append(row);
            });
            $.bootstrapSortable(false);
        });
};

var insertDorksData = function (e) {
    var req = "/top10/dorks/dork_requests";
    //var start_date=$('#start_date_referer').val();
    //var end_date = $('#end_date_referer').val();
    //obj={"start_date": start_date, "end_date": end_date};
    $("#infoWaitDorks").remove();
    $("#topDorksBody").empty();
    $("#topDorksContainer").append('<div class="text-info text-center" id="infoWaitDorks"> Wait, I\'m working on your request</div>');
    $.getJSON(req,
        function (json) {
            $("#infoWaitDorks").remove();
            json.forEach(function (entry){
                var row='<tr><td>'+entry.dork+'</td><td>'+entry.totRequests+'</td></tr>';
                $("#topDorksBody").append(row);
            });
            $.bootstrapSortable(false);
        });
};


$(document).ready(function() {
    $(".refererBtn").click(insertRefererData);
    $(".domainBtn").click(insertDomainData);
    $("#dorksBtn").click(insertDorksData);

/*    var date = new Date();
    date.setDate(date.getDate() - 1);
    var strDat= date.toISOString().split("T")[0];
    //$("#dp_start").setValue("data-date",date);
    var strDatBeg="2013-06-01";
    $("#start_date_referer").attr("value",strDatBeg);
    $("#start_date_domain").attr("value",strDatBeg);
    $("#dp_start_referer").attr("data-date",strDatBeg);
    $("#dp_start_domain").attr("data-date",strDatBeg);

    var checkin_domain = $('#dp_start_domain').datepicker()
    .on('changeDate', function(ev) {
    checkin_domain.hide();
    })
    .data('datepicker');

    var checkin_referer = $('#dp_start_referer').datepicker()
    .on('changeDate', function(ev) {
    checkin_referer.hide();
    })
    .data('datepicker');

    $("#end_date_domain").attr("value",strDat);
    $("#end_date_referer").attr("value",strDat);
    $("#dp_end_domain").attr("data-date",strDat);
    $("#dp_end_referer").attr("data-date",strDat);
    var checkout_domain = $('#dp_end_domain').datepicker()
      .on('changeDate', function(ev) {
      checkout_domain.hide();
      })
      .data('datepicker');

    var checkout_referer = $('#dp_end_referer').datepicker()
      .on('changeDate', function(ev) {
      checkout_referer.hide();
      })
      .data('datepicker');
*/
});
