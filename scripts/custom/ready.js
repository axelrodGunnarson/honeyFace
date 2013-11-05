

$("#activateOneCluster").click(function (e) {
    if ($("g").length===0) return;
    if (e.target.checked) {
        $("g").each( function (index, element) {
            element.style.display='inline';
        });
    }
    else {
        $("g").each( function (index, element) {
            if (element.classList.contains("singleNode"))
                element.style.display='none';
        });

    }
});

var enableAllcheckHideOthers = function (e) {
    var classCheckBox=e.target.className;
    if ($("input."+classCheckBox+"#optionALL").is(":checked")) {
        $("input."+classCheckBox).each(function (index, element){
            $(element).prop('checked', false);
        });
    $("input."+classCheckBox+"#optionALL").prop('checked', true);
    }
};

var eraseAllCheck = function (e) {
    var classCheckBox=e.target.className;
    if (e.target.id==="optionALL")
        return;
    if ($("input."+classCheckBox+"#optionALL").is(":checked")) {
            $("input."+classCheckBox+"#optionALL").prop('checked', false);
        }
    };

$(document).ready(function () {
    var insert = function (req, append_id, cl) {
        var categories_modal="";
        $.getJSON(req, function (categories_data) {
            console.log(categories_data);
            categories_modal+='<label class="checkbox"><input type="checkbox" class="'+cl+'" name="optionsCheckALL" id="optionALL" value="ALL">All</input></label>';
            if (cl==="category")
                categories_modal+='<label class="checkbox"><input type="checkbox" class="'+cl+'" name="optionsCheck0" id="option0" value="0">Not Assigned</input></label>';
            categories_data.forEach(function (element) {
                categories_modal+='<label class="checkbox"><input type="checkbox" class="'+cl+'" name="optionsCheck'+element.id_category+'" id="option'+element.id_category+'" value="'+element.id_category+'">'+element.name_category+'</input></label>';
            });
            $(append_id).append(categories_modal);
            $("input."+cl+"#optionALL").prop('checked', true);
            $("input."+cl+"#optionALL").click(enableAllcheckHideOthers);
            $("input."+cl).click(eraseAllCheck);
        });
    };
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var strDat= date.toISOString().split("T")[0];
    //$("#dp_start").setValue("data-date",date);
    $("#start_date").attr("value",strDat);
    $("#dp_start").attr("data-date",strDat);
    var checkin = $('#dp_start').datepicker()
    .on('changeDate', function(ev) {
    checkin.hide();
    })
    .data('datepicker');
    insert("/getAllCategories", "#dropdownTypesMenu", "category");
    insert("/getAllFileCategories", "#dropdownCategoriesMenu", "fileCategory");
});

$("#dropdownTypesMenu").click(function (e) {
    e.stopPropagation();
});

$("#dropdownCategoriesMenu").click(function (e) {
    e.stopPropagation();
});
