$("#ShowDatesbtn").click(function (e) {
    $("#infoError").remove();
    var req="/map/getData";
    var strDat=$('#start_date').val();
    var obj={"start_date": strDat};
    strDat=$('#end_date').val();
    obj["end_date"]= strDat;

    var arrMachines=[];
    $("input.machineCheck").each(function (index, element){
        if ($(element).is(":checked"))
            arrMachines.push(parseInt($(element)[0].id.split("machine")[1],10));
        });
    obj.machines = arrMachines;
    var arrDisplayOptions=[];
    $("input.displayOptions").each(function (index, element) {
        var ob={};
        if ($(element).is(":checked"))
            ob[$(element)[0].id]=true;
        else
            ob[$(element)[0].id]=false;
        arrDisplayOptions.push(ob);
    });
    obj.displayOptions = arrDisplayOptions;
    $("#world-map").empty();
    $("#world-map").append('<div class="text-info text-center" id="infoWait"> Wait, I\'m working on your request</div>');
    console.log(obj);
    $.post(req,
        obj,
        function (data) {
        var dispOb={};
        for (var el in data) {
            dispOb[el]=data[el].totIPs;
        }
        $("#infoWait").remove();
        $('#world-map').vectorMap({
          backgroundColor: '#BEBEBE',
          map: 'world_mill_en',
          series: {
            regions: [{
              values: dispOb,
              scale: ['#CAFF70', '#556B2F'],
              normalizeFunction: 'polynomial'
            }]
          },
          onRegionLabelShow: function(e, el, code){
            var dispInfo={
                "totIPs": 0, "average_hits":0, "average_ua":0, "average_domains":0
            };
            if (data[code])
                dispInfo = data[code];
            el.html(el.html()+':<br>&nbsp&nbsp&nbsp&nbsp- IPs : '+dispInfo.totIPs+"<br>&nbsp&nbsp&nbsp&nbsp- Average Hits : "+dispInfo.average_hits+"<br>&nbsp&nbsp&nbsp&nbsp- Average number Of User Agents : "+dispInfo.average_ua+"<br>&nbsp&nbsp&nbsp&nbsp- Average Number Of Domains Visited: "+dispInfo.average_domains);
          }
        });
    });
});

var enableAllcheckHideOthers = function (e) {
    var classCheckBox=e.target.className;
    if ($("input."+classCheckBox+"#machine0").is(":checked")) {
        $("input."+classCheckBox).each(function (index, element){
            $(element).prop('checked', false);
        });
    $("input."+classCheckBox+"#machine0").prop('checked', true);
    }
};

var eraseAllCheck = function (e) {
    var classCheckBox=e.target.className;
    if (e.target.id==="machine0")
        return;
    if ($("input."+classCheckBox+"#machine0").is(":checked")) {
            $("input."+classCheckBox+"#machine0").prop('checked', false);
        }
};


$(document).ready(function () {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var strDat= date.toISOString().split("T")[0];
    $("#end_date").attr("value",strDat);
    $("#dp_end").attr("data-date",strDat);
    var checkin = $('#dp_end').datepicker()
    .on('changeDate', function(ev) {
    checkin.hide();
    })
    .data('datepicker');
    strDat="2013-01-01";
    $("#start_date").attr("value",strDat);
    $("#dp_start").attr("data-date",strDat);
    var checkout = $('#dp_start').datepicker()
    .on('changeDate', function(ev) {
    checkout.hide();
    })
    .data('datepicker');

    $("input#machine0").prop('checked', true);
    $("input#crawlers").prop('checked', true);
    $("input#images").prop('checked', true);
    $("input#machine0").click(enableAllcheckHideOthers);
    $("input.machineCheck").click(eraseAllCheck);
    $("#ShowDatesbtn").click();
});
