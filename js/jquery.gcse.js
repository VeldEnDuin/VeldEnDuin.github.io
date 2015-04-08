/*
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
*/

/**************************************************************************
 * Name:   gcse
 * Copyright (c) 2015
 * Author: Marc Portier <marc.portier@gmail.com>
 **************************************************************************
 * Small thingy to retrieve google-search-results using a configured google cse (custom-search-engine)
 * Get and manage your own at: https://cse.google.com/cse/all
 * See API dox at: https://developers.google.com/custom-search/docs/xml_results?hl=nl&csw=1
 * and https://developers.google.com/custom-search/json-api/v1/using_rest
 */

/*jslint regexp: true */

(function ($) {
    "use strict";


    /*
     * handy common stuff
     * =======================================================================
     */
    function isEmpty(a) {
        return (a === null || a === undefined || (a.hasOwnProperty("length") && a.length === 0));
    }


    /*
     * jquery stuff I like to use
     * =======================================================================
     */
    function jqMerge(defs, vals) {
        return $.extend($.extend({}, defs), vals);
    }

    /*
     * URL handling stuff in both ways
     * =======================================================================
     */
    function qryParams() {
        var params, match, done = false,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = window.location.search.substring(1);

        params = {};
        while (!done) {
            match = search.exec(query);
            if (match) {
                params[decode(match[1])] = decode(match[2]);
            } else {
                done = true;
            }
        }
        return params;
    }

    function updateLocation(qry) {
        var uri = '', join = '?', state = {"q": qry.q, "start": qry.start};
        Object.keys(qry).forEach(function (name) {
            var val = qry[name];
            if (!isEmpty(val)) {
                uri += join + name + '=' + encodeURIComponent(val);
                join = '&';
            }
        });

        window.history.pushState(state, "Zoeken '" + qry.q + "'", uri);
    }

    function getAPIUri(qry, cnf) {
        var lang = cnf.lang || "en", params = [], join = '?',
            uri = "https://www.googleapis.com/customsearch/v1";

        if (isEmpty(cnf.key) || isEmpty(cnf.cx)) {
            throw 'API-uri invalid without key or cx params';
        }

        params.push({"name": "key",      "value": cnf.key});
        params.push({"name": "cx",       "value": cnf.cx});
        params.push({"name": "q",        "value": qry.q});
        params.push({"name": "hl",       "value": lang});
        params.push({"name": "lr",       "value": "lang_" + lang});
        params.push({"name": "start",    "value": qry.start || 1});

        params.forEach(function (p) {
            var name = p.name, val = p.value;
            if (!isEmpty(val)) {
                uri += join + name + '=' + encodeURIComponent(val);
                join = '&';
            }
        });
        uri += join + 'callback=?';

        return uri;
    }

    $(function () {
        var $gcse, conf, qry, $form, $pager, $results, $input, $lang, $info, msg;

        $gcse = $('[role="jquery.gcse"]').eq(0); // only grab the first
        qry = qryParams();
        conf = $gcse.data('gcse');
        msg = conf.msg;

        $form = $("form#gcse-search").clone().attr("id", "gcse-search-clone");
        $input = $("input[name=q]", $form);
        $input.val(qry.q);

        $info = $('<div class="jq-gcse-info"></div>');
        $pager = $('<div class="jq-gcse-pager"></div>');
        $results = $('<div class="jq-gcse-results"><div class="alert alert-info">' + msg.wait + '</div></div>');

        $gcse.append($('<div class="col-lg-5 col-md-5 col-sm-6 col-xs-12"></div').append($form));
        $gcse.append($('<div class="col-lg-5 col-md-5 col-sm-6 col-xs-12"></div').append($pager));
        $gcse.append($('<div class="col-lg-2 col-md-2 hidden-sm hidden-xs"></div').append($info));
        $gcse.append($('<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12"></div').append($results));

        function updateResults(n, isPop) {
            isPop = isPop || false;
            qry.start = n;
            qry.q = $input.val();

            if (!isPop) {
                updateLocation(qry);
            }

            if (isEmpty(qry.q)) {
                $results.html('<div class="alert alert-primary">' + msg.use + '<div>');
            } else {
                $.getJSON(getAPIUri(qry, conf), function (response) {
                    var info = "", results = "", pager = "",
                        infoSet = response.searchInformation,
                        request = response.queries.request[0],
                        pageStart = 1, pageNum = 1, active, activeNum,
                        prevStart, nextStart, last, activeEnd, size = 10;

                    if (Number(infoSet.totalResults) > 0 && !isEmpty(response.items)) {

                        /*--------------- pager --------------*/
                        last = request.totalResults;
                        active = request.startIndex;
                        activeNum = Math.floor(active / size) + 1;
                        prevStart = ((activeNum - 2) * size) + 1;
                        activeEnd = Math.min(last, active + size);
                        nextStart = (activeNum * size) + 1;

                        pager += '<nav><ul class="pagination">';
                        pager += '<li';
                        if (pageNum === activeNum) {
                            pager += ' class="disabled"';
                        }
                        pager += '><a data-start="' + prevStart + '" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';

                        while (pageStart < last) {
                            pager += '<li';
                            if (pageStart <= active && pageStart + size > active) {
                                pager += ' class="active"';
                            }
                            pager += '><a href="#" data-start="' + pageStart + '">' + pageNum + '</a></li>';

                            pageStart += size;
                            pageNum += 1;
                        }
                        pager += '<li';
                        pageStart -= size; // backup one page to calculate:
                        pageNum -= 1;
                        if (pageNum === activeNum) {
                            pager += ' class="disabled"';
                        }
                        pager += '><a data-start="' + nextStart + '" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
                        pager += '</ul></nav>';

                        /*--------------- info ---------------*/
                        info += '<div class="label label-success">';
                        info += '<span class="fa fa-info-circle"></span>|';
                        info += '<span class="jq-gcse-time"><span class="fa fa-clock-o"></span> ' +
                            infoSet.formattedSearchTime + 's</span>|';
                        info += '<span class="jq-gcse-nums">' + active + ' <span class="fa fa-arrows-h"></span> ' +
                            activeEnd + '</span>|';
                        info += '<span class="jq-gcse-count"><span class="fa fa-arrows-v"></span> ' +
                            infoSet.formattedTotalResults + ' </span>';
                        info += '</div>';


                        /*--------------- items --------------*/
                        response.items.forEach(function (item) {
                            var res = "", tmb;

                            res += '<div class="row jq-gcse-result"><div class="jq-gcse-result-inner">';

                            res += '<div class="col-lg-5 col-md-5 col-sm-6 col-xs-6"><a href="' +
                                item.link + '">';
                            res += '<div class="jq-gcse-title">' + item.htmlTitle + '</div>';
                            res += '<div class="jq-gcse-url">' + item.formattedUrl + '</div>';
                            res += '</a></div>';
                            res += '<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 jq-gcse-snippet">' +
                                item.htmlSnippet + '</div>';

                            if (!isEmpty(item.pagemap) && !isEmpty(item.pagemap.cse_thumbnail)) {
                                tmb = item.pagemap.cse_thumbnail[0];

                                res += '<div class="col-lg-1 col-md-1 hidden-sm hidden-xs jq-gcse-thumbnail">' +
                                    '<img class="img-responsive img-thumbnail" src="' +
                                    tmb.src + '" height="' + tmb.height + '" width="' + tmb.width + '" ></div>';
                            }

                            res += '</div></div>';
                            results += res;
                        });
                    } else {
                        results = '<div class="alert alert-warning">' + msg.empty + '<div>';
                    }

                    $info.html(info);
                    $pager.html(pager);
                    $('li', $pager).not('[class*="disabled"]').children('a').each(function () {
                        var $a = $(this);
                        $a.click(function () {
                            updateResults($a.data('start'));
                            return false;
                        });
                    });
                    $results.html(results);
                });
            }
        }

        function refresh() {
            updateResults(1);
            return false;
        }
        $form.removeAttr('action').submit(refresh);
        $input.change(refresh);
        window.onpopstate = function (event) {
            var state = event.state;
            $input.val(state.q);
            updateResults(state.start, true);
        };

        refresh();
    });
}(window.jQuery));
