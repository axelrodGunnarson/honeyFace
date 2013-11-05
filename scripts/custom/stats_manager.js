function dot2num(dot) {
var d = dot.split('.');
return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);}

function num2dot(num) {
var d = num%256;
for (var i = 3; i > 0; i--) {
num = Math.floor(num/256);
d = num%256 + '.' + d;}
return d;}
function secondsToString (mseconds) {
if (typeof(mseconds) === "string")
  return mseconds;
var msec = mseconds;
var hh = Math.floor(msec / 1000 / 60 / 60);
msec -= hh * 1000 * 60 * 60;
var mm = Math.floor(msec / 1000 / 60);
msec -= mm * 1000 * 60;
var ss = Math.floor(msec / 1000);
msec -= ss * 1000;
var str="";
if (hh !== 0) str+=hh+"h";
if (mm !== 0) str+=mm+"m";
if (ss !== 0) str+=ss+"s";
return str;

}

function commonPrefix(A) {
    var tem1, tem2, s, A = A.slice(0).sort();
    tem1 = A[0];
    s = tem1.length;
    tem2 = A.pop();
    while(s && tem2.indexOf(tem1) == -1) {
        tem1 = tem1.substring(0, --s);

    }
    return tem1;
}

var detailRequester = function (e) {
  var start_date=$('#start_date').val();
  var end_date = $('#end_date').val();
  var row = e.currentTarget.id;
  var ip = row.split("port")[0];
  var port = row.split("port")[1];
  obj = {"ip": num2dot(ip), "port": port, "start_date": start_date, "end_date": end_date};
  var req = "stats/detailsRequest";
  $("#requestsDetailsBody").empty();
  $.post (
    req,
    obj,
    function (json) {
      var minAverageTime = 99999999;
      var maxAverageTime = 0;
      var firstRequest;
      var lastRequest;
      var pastItem;
      var sumOfDiff=0;
      var time_element;
      var request;
      var newItem;
      var arrOfReq=[];
      json.forEach( function (element, index) {
        time_element=new Date(element.time);
        arrOfReq.push(element.request);
        if (index === 0) { //first element
          firstRequest = time_element;
          lastRequest = time_element;
          pastItem = time_element;
          $("#requestsDetailsBody").append("<tr><td>"+time_element+"</td><td>"+element.request+"</td></tr>");
          return;
        }
        $("#requestsDetailsBody").append("<tr><td>"+time_element+"</td><td>"+element.request+"</td></tr>");
        newItem = time_element;
        if (newItem > lastRequest)
          lastRequest = newItem;
        if (newItem < firstRequest)
          firstRequest = newItem;
        diff = Math.abs(newItem-pastItem);
        if (diff < minAverageTime)
          minAverageTime = diff;
        if (diff > maxAverageTime)
          maxAverageTime = diff;
        sumOfDiff+=diff;
        pastItem = newItem;
      });
      var averageTime = sumOfDiff/json.length;
      if (json.length==1) {
        minAverageTime = "N/A";
        maxAverageTime = "N/A";
        averageTime = "N/A";
      }
      $("#detailsDstIp").text(num2dot(ip));
      $("#detailsDstPort").text(port);
      $("#detailsDstHost").text($("#dst_host"+row).text());
      $("#detailsNrRequests").text(json.length);
      $("#detailsFirstRequest").text(new Date(firstRequest));
      $("#detailsLastRequest").text(new Date(lastRequest));
      $("#detailsMinTimeInt").text(secondsToString(minAverageTime));
      $("#detailsMaxTimeInt").text(secondsToString(maxAverageTime));
      $("#detailsAvgTimeInt").text(secondsToString(averageTime));
      $("#detailsLongPrefixReq").text(commonPrefix(arrOfReq));
      $.bootstrapSortable(true);
    });

};

var statsRequester = function (e) {
  var start_date=$('#start_date').val();
  var end_date = $('#end_date').val();
  var req="getStats";
  obj={"start_date": start_date, "end_date": end_date};
  $("#canvas").css("outline", "1px solid black");
  $("#canvas").append('<div class="text-info text-center" id="infoWait"> Wait, I\'m working on your request</div>');
  $.post(
    req,
    obj,
    function (json) {
  $("#canvas").css("outline", "none");
      $("#infoWait").remove();
      $("#tableStats").remove();
      $("#canvas").append("<table class='table table-bordered table-striped table-hover sortable' id='tableStats'>");
      $("#tableStats").append("<thead><tr><th data-defaultsort='asc'>Number Of Requests<span class='arrow'></span></th><th data-defaultsort='asc'>Destination IP<span class='arrow'></span></th><th data-defaultsort='asc'>Destination Port<span class='arrow'></span></th> <th data-defaultsort='asc'>Host<span class='arrow'></span></th></tr></thead>");
      $("#tableStats").append("<tbody id='bodyStats'");
      console.log(json);
      json.forEach(function (entry){
        var idRow=dot2num(entry.dst_ip)+"port"+entry.dst_port;
        var row='<tr id="'+idRow+'" data-toggle="modal" href="#detailsModal"> <td id="numTries'+idRow+'">'+entry.num_tries+'</td> <td id="dst_ip'+idRow+'">'+entry.dst_ip+'</td> <td id="dst_port'+idRow+'">'+entry.dst_port+'</td> <td id="dst_host'+idRow+'">'+entry.dst_host+'</td></tr>';
        $("#bodyStats").append(row);
        $("#"+idRow).click(detailRequester);
      });
      $.bootstrapSortable(true);
    });
};

$(document).ready(function() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var strDat= date.toISOString().split("T")[0];
    //$("#dp_start").setValue("data-date",date);
    var strDatBeg="2013-06-01";
    $("#start_date").attr("value",strDatBeg);
    $("#dp_start").attr("data-date",strDatBeg);
    var checkin = $('#dp_start').datepicker()
    .on('changeDate', function(ev) {
    checkin.hide();
    })
    .data('datepicker');
    $("#end_date").attr("value",strDat);
    $("#dp_end").attr("data-date",strDat);
    var checkout = $('#dp_end').datepicker()
      .on('changeDate', function(ev) {
      checkout.hide();
      })
      .data('datepicker');
    $("#ShowStatsbtn").click(statsRequester);
});
