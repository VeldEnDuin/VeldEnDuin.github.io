/*jslint browser: true */
(function ($) {
    "use strict";
    // copy available i18n-country-variants into the country-agnostic variant
    $.fn.datepicker.dates["nl"] = $.fn.datepicker.dates["nl"] || $.fn.datepicker.dates["nl-BE"];
    $.fn.datepicker.dates["en"] = $.fn.datepicker.dates["en"] || $.fn.datepicker.dates["en-GB"];

/* dependencies:
 *  -- URI.js  for uritemplates    ==> https://medialize.github.io/URI.js/uri-template.html
 *  -- moment.js for date handling ==> https://momentjs.com/docs/
 *  -- boostrap datepicker         ==> https://bootstrap-datepicker.readthedocs.io/en/latest/
 */
    const DT_EU_FMT = "DD/MM/YYYY",  // for datepicker and form-view
          DT_ISO_FMT = "YYYY-MM-DD", // for uri-coding
          STANDARD_LENGTH_STAY = 7   /*days*/,
          FORMURITEMPLATE = new URITemplate("https://reservations.cubilis.eu/{LocationId}/Rooms/Select{?Arrival,Departure,Room,lang}");

    function fmtEU2ISO(instr) {
        return moment(instr, DT_EU_FMT).format(DT_ISO_FMT);
    }

    // find the language of the html page
    var lang = $("html").attr("lang") || 'nl',
        $bkfrm = $("form#booking"),
        bkcfg = $bkfrm.data("booking"),
        dp_std_cfg = {
            autoclose: true,
            format: DT_EU_FMT.toLowerCase(),
            language: lang,
        },
        today = moment().startOf("day"),
        initial_dates = {},
        dp_cfg = {},
        $dpi = {},
        $type = $("select#type",$bkfrm),
        $btn = $("button.btn[type='submit']", $bkfrm),
        lenghtOfStay = STANDARD_LENGTH_STAY;

    $type.change(function() {
        if ($("option",$type).filter(":selected").length === 0) {
            $type.parent().addClass("has-error");
        } else {
            $type.parent().removeClass("has-error");
        }
    });

    function updateDate(key, dtStr){
        $dpi[key].datepicker('update', dtStr);
    };

    //add 2 days to avoid sunday (0) as a start-day, ie when today == saturday (6)
    initial_dates.start = moment(today).add(today.day() == 6 ? 2:1,"days");
    initial_dates.end = moment(initial_dates.start).add(STANDARD_LENGTH_STAY,"days");


    dp_cfg.start = Object.assign({}, dp_std_cfg, {
        daysOfWeekDisabled: [0],
        startDate: '+1d',
    });
    dp_cfg.end = Object.assign({}, dp_std_cfg, {
        startDate: '+2d',
    });

    Object.keys(dp_cfg).forEach( function (key) {
        $dpi[key] = $("input#" + key, $bkfrm);
        dp_cfg[key].defaultViewDate = initial_dates[key].format(DT_EU_FMT);
        // activate the date-pickers (config locale, format, default)
        var dp = $dpi[key].datepicker(dp_cfg[key]);
        // set initial value for date
        updateDate(key, initial_dates[key].format(DT_EU_FMT));
        // show datepicker when input-addons are clicked
        $(".vd-form-date-trigger", $dpi[key].parent()).click(function () {
            $dpi[key].datepicker('show');
        });
        if (key === "start") {
            dp.on('changeDate', function (e) {
//                console.log("change date", e);
                var dtStart = moment(e.date);
                //     --> update first possible on datepicker for end-date to start-date +1
                $dpi["end"].datepicker('setStartDate', moment(dtStart).add(1,"days").format(DT_EU_FMT));
                //     --> update end-date by start-date + lengthOfStay
                updateDate("end", moment(dtStart).add(lenghtOfStay, "days").format(DT_EU_FMT));
            });

        } else if (key === "end") {
            dp.on('changeDate', function (e) {
//                console.log("change date", e);
                var dtEndDate = e.date,
                    dtStartStr = $dpi["start"].val();
                //     --> update length by end-date
                if (dtStartStr && dtEndDate) {
                    lenghtOfStay = moment(dtEndDate).diff(moment(dtStartStr, DT_EU_FMT), "days");
//                    console.log("updated length of stay", lenghtOfStay);
                }
            });
        }
    });

//    console.log("$btn", $btn.length);
    // register form-submit handling - convert dates, inject location and room id into url, submit, return false
    $bkfrm.submit(function() {
//        console.log("push");
        var params = {
            "LocationId" : $("option",$type).filter(":selected").data("location"),
            "Arrival"    : fmtEU2ISO($dpi['start'].val()),
            "Departure"  : fmtEU2ISO($dpi['end'].val()),
            "Room"       : $type.val(),
            "lang"       : lang
        }, uritarget     = FORMURITEMPLATE.expand(params);

        //afhandeling van niet ingevulde LocationId & ontbrekende Room
        if (!params.Room || !params.LocationId || $("option",$type).filter(":selected").length === 0) {
            $type.parent().addClass("has-error");
            return false;
        } else {
            $type.parent().removeClass("has-error");
            window.location = uritarget;
            //window.open(uritarget, '_blank')
        }

        return false; // stop the bubble up normal form handling & submit
    });

}(window.jQuery));
