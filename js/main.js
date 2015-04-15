(function ($) {
    "use strict";
    var TRANSL = {};

    /*
     * handy common stuff
     * =======================================================================
     */
    function isEmpty(a) {
        return (a === null || a === undefined || (a.hasOwnProperty("length") && a.length === 0));
    }

    function isString(s) {
        return Object.prototype.toString.call(s) === '[object String]';
    }

    /*
     * geo stuff
     * =======================================================================
     */
    function parseLatLon(geom) {
        if (isEmpty(geom)) { return null; }
        var parts = geom.replace(/\s+/gi, '').split(',');
        return {
            "lat" : parts[0],
            "lon" : parts[1]
        };
    }

    function displacementLabelFormatter(fmt) {
        if (!isString(fmt)) {
            return;
        } else if (fmt === "dist") {
            return function (dist, crdn) { return dist + " km"; };
        } else {
            return function (dist, crdn) { return dist + " km " + crdn; };
        }
    }

    function calculateDisplacement(from, to, fmt) {
    /* assumes
        <script src="http://maps.google.com/maps/api/js?sensor=true&libraries=geometry"
                type="text/javascript" charset="utf-8"></script>
    */
        if (!window.hasOwnProperty('google') || !window.google || !window.google.maps) { return null; }

        var geoFrom = new window.google.maps.LatLng(from.lat, from.lon),
            geoTo   = new window.google.maps.LatLng(to.lat, to.lon),
            dist = Math.round(
                window.google.maps.geometry.spherical.computeDistanceBetween(geoFrom, geoTo)
            ),
            degr,
            crdn,
            cardinalDirections = TRANSL.directions,
            numParts = cardinalDirections.length,
            partSize = 360 / numParts;

        if (isNaN(dist) || dist === 0) { return null; }

        dist = Math.round(dist / 100) / 10;
        degr = window.google.maps.geometry.spherical.computeHeading(geoFrom, geoTo);
        crdn = cardinalDirections[Math.floor((degr + 360 + partSize / 2) / 45) % 8];
        fmt = displacementLabelFormatter(fmt);

        return {
            "distance": dist,
            "degree"  : degr,
            "cardinal": crdn,
            "label"   : fmt(dist, crdn)
        };
    }


    /*
     * Read and initialize TRANSL
     * =======================================================================
     */
    $(function () {
        /*
         * Read available translation data in the current language
         * =======================================================================
         */
        TRANSL = $('body').data('translations');
    });


    $(function () {
        var $content = $('#content');

        /*
         * make forms nested in the menu work and show ok
         * =======================================================================
         */
        $('.dropdown-menu').find('form').click(function (e) {
            e.stopPropagation();
        });

        /*
         * make first header in the content stand out
         * =======================================================================
         */
        $('h1', $content).eq(0).addClass('page-header');

        /*
         * make the callout form appear when called for
         * =======================================================================
         */
        (function () {
            var $btnOn, $btnOff, $callout, select, initTop;
            function showForm() {
                $callout.animate({"top": 0}, 500);
            }
            function hideForm() {
                $callout.animate({"top": initTop}, 500);
            }
            $btnOn = $('.vd-callout-btn');
            if ($btnOn.length > 0) {
                select = $btnOn.data('calloutselect');
                $callout = $(select);
                $btnOff = $('.btn[role="close"]', $callout);
                initTop = $callout.css('top');
                $btnOn.click(showForm);
                $btnOff.click(hideForm);
            }
        }());
    });

    /*
     * Build up the group pages
     * =======================================================================
     */
    $(function () {
        var $groupList = $('#vd-group-list'), $groupItems, subgrpNames, $items, geo,
            subGrpCnts, allCnt,
            $btnGrp, activeSubGrp, $btns;

        if ($groupList && $groupList.length > 0) {

            subgrpNames = $groupList.data('subgroupnames');
            geo = parseLatLon($groupList.data('geolocation'));
            $groupItems = $('.vd-group-item', $groupList);
            $items = $();
            subGrpCnts = {};
            allCnt = 0;

            $groupItems.each(function () {
                var $item = $(this), itemGeo, itemDsp, itemFmt,
                    imgs, imgcnt, imgndx,
                    subgroups;

                $items = $items.add($item);

                /*
                 * geo-ref stuff and displacement calculations
                 * ---------------------------------------------------------------
                 */
                itemGeo = parseLatLon($item.data('location'));
                itemFmt = $item.data('format') || "full";
                if (!isEmpty(itemGeo)) {
                    itemDsp = calculateDisplacement(geo, itemGeo, itemFmt);
                }

                $item.data('geo', itemGeo);
                if (itemDsp) {
                    $item.data('distance', itemDsp.distance);
                    // find "route" link and replace by displacement tostring
                    $(".vd-location", $item).append(" <span>" + itemDsp.label + "</span>");
                }

                /*
                 * image rotation stuff
                 * ---------------------------------------------------------------
                 */
                imgs   = $item.data('images');
                imgcnt = imgs.length;
                imgndx = imgs.length;

                function loaded() {
                    imgndx -= 1;
                    if (imgndx === 0) {
                        setInterval(function () {
                            imgndx = (imgndx + 1) % imgcnt;
                            $('div.vd-group-item-inner', $item).css('background-image', "url('" + imgs[imgndx] + "')");
                        }, 5000 * (1 + Math.random(5000)));
                    }
                }

                if (imgcnt > 1) {
                    imgs.forEach(function (img) {
                        $('<img src=' + img + '>').load(loaded);
                    });
                }

                /*
                 * assemble facet-counts information
                 * ---------------------------------------------------------------
                 */

                subgroups = $item.data('subgroups');
                subgroups.forEach(function (subgrp) {
                    $item.addClass('vd-subgrp-' + subgrp);
                    $item.addClass('vd-subgrp-ALL');
                    if (!subGrpCnts[subgrp]) {
                        subGrpCnts[subgrp] = 0;
                    }
                    subGrpCnts[subgrp] += 1;
                });
            });
            allCnt = $items.length;

            /*
             * facet-counts, facet-filtering, fragment-identifier-facets
             * ---------------------------------------------------------------
             */

            $btnGrp = $('<ul class="vd-group-filter-nav nav nav-pills nav-justified"></ul>');
            $btns = $();
            activeSubGrp = null;

            (function () {
                function toggleActive(newActiveGrp, $btn) {
                    if (isEmpty(newActiveGrp)) {
                        newActiveGrp = 'ALL';
                    }
                    $btn = $btn || $("#vd-subgrp-" + newActiveGrp);

                    var subgrpSelector = '.vd-subgrp-' + newActiveGrp,
                        $hideItems = $items.not(subgrpSelector);
                    // set on --> all others off
                    $btns.removeClass('active');
                    (function () {
                        function fadeIn() {
                            $(subgrpSelector, $groupList).fadeIn(500);
                        }
                        function fadeOutThenIn() {
                            $hideItems.fadeOut(500, fadeIn);
                        }
                        if ($hideItems.length > 0) {
                            fadeOutThenIn();
                        } else {
                            fadeIn();
                        }
                        $btn.addClass('active');
                        activeSubGrp = newActiveGrp;
                        window.location.hash = newActiveGrp;
                    }());

                    return false;
                }

                function addBtn(subgrp, label, cnt) {
                    var $btn = $('<li id="vd-subgrp-' + subgrp +
                                 '"><a href="#' + subgrp + '">' + label + ' [' + cnt + ']</a></li>');

                    $btns = $btns.add($btn);

                    $btn.click(function () { return toggleActive(subgrp, $btn); });
                    $btnGrp.append($btn);
                }

                addBtn('ALL', TRANSL.dict.all, allCnt);
                Object.keys(subGrpCnts).forEach(function (subgrp) {
                    var cnt = subGrpCnts[subgrp];
                    addBtn(subgrp, subgrpNames[subgrp], cnt);
                });

                $groupList.before(
                    $('<div class="container vd-group-filter">').append(
                        $('<div class="vd-group-filter-inner hidden-xs"></div').append($btnGrp)
                    )
                );
                //read the fragment-identifier and call the toggleActive(grp)
                function followHash() {
                    if (location.hash && location.hash.length > 1) {
                        toggleActive(location.hash.slice(1));
                    } else {
                        toggleActive();
                    }
                }
                $(window).on('hashchange', followHash);
                followHash();
            }());
        }
    });

    /*
     * Enable share buttons
     * =======================================================================
     */
    $(function () {
        var $shareGrp = $('#vd-share-group'),
            shareData,
            $shareToggle,
            toggleIsOpen = false,
            $shareBtns,
            applicatorFor;

        function close() {
            $shareBtns.animate({"left": "-100%", "opacity": 0}, 500, "swing", function () {
                $shareToggle.css('border-bottom-right-radius', '6px');
                $shareToggle.css('border-top-right-radius', '6px');
                toggleIsOpen = false;
            });
        }
        function open() {
            $shareToggle.css('border-bottom-right-radius', '0');
            $shareToggle.css('border-top-right-radius', '0');
            $shareBtns.animate({"left": "0", "opacity": 1}, 500, "swing", function () {
                toggleIsOpen = true;
            });
        }
        function toggle() {
            if (toggleIsOpen) { close(); } else { open(); }
        }

        if ($shareGrp && $shareGrp.length > 0) {
            shareData = $shareGrp.data('share');
            $shareToggle = $('button[data-toggle="tooltip"]', $shareGrp);
            $shareBtns = $('button[role]', $shareGrp);
            /*
            $shareToggle.click(toggle);
            close();
            */

            applicatorFor = {};
            applicatorFor.fb = function ($btn) {
                $btn.click(function (e) {
                    window.open('https://www.facebook.com/dialog/share?app_id=' + encodeURIComponent(shareData['fb-app-id']) +
                                '&display=popup&href=' + encodeURIComponent(shareData.url) +
                                '&redirect_uri=' + encodeURIComponent(shareData['fb-redir']) + '&',
                                'facebook share',
                                'height=450, width=550, top=' + ($(window).height() / 2 - 225) + ', left=' + $(window).width() / 2 +
                                ', toolbar=no, location=0, menubar=no, directories=no, scrollbars=no, resizeable=yes'
                               );
                    /* close(); */
                });
                return true;
            };
            applicatorFor.tw = function ($btn) {
                $btn.click(function (e) {
                    window.open('http://twitter.com/share?url=' + encodeURIComponent(shareData.url) +
                                '&text=' + encodeURIComponent(shareData.title) + '&',
                                'twitter share',
                                'height=450, width=550, top=' + ($(window).height() / 2 - 225) + ', left=' + $(window).width() / 2 +
                                ', toolbar=no, location=0, menubar=no, directories=no, scrollbars=no, resizeable=yes'
                               );
                    /* close(); */
                });
                return true;
            };
            applicatorFor.gp = function ($btn) {
                $btn.click(function () {
                    window.open('https://plus.google.com/share?url=' + encodeURIComponent(shareData.url) + '&',
                                'google+ share',
                                'height=600, width=600, top=' + ($(window).height() / 2 - 300) + ', left=' + $(window).width() / 2 +
                                ', toolbar=no, location=0, menubar=no, directories=no, scrollbars=no, resizeable=yes'
                               );
                    /* close(); */
                });
                return true;
            };

            applicatorFor.pi = function ($btn) {
                $btn.click(function () {
                    window.open('https://www.pinterest.com/pin/create/button/?url=' + encodeURIComponent(shareData.url) +
                                '&media=' + encodeURIComponent(shareData['pi-media']) +
                                '&description=' + encodeURIComponent(shareData.title) + '&',
                                'pinterest share',
                                'height=600, width=600, top=' + ($(window).height() / 2 - 300) + ', left=' + $(window).width() / 2 +
                                ', toolbar=no, location=0, menubar=no, directories=no, scrollbars=no, resizeable=yes'
                               );
                    /* close(); */
                });
                return true;
            };

            $shareBtns.each(function () {
                var $btn = $(this),
                    role = $btn.attr('role').split('-'),
                    applicator,
                    applied = false;

                if (role.length === 2 && role[0] === 'share') {
                    role = role[1];
                    applicator = applicatorFor[role];
                    if (applicator) {
                        applied = applicator($btn);
                    }
                }
                if (!applied) {
                    $btn.attr('disabled', 'disabled');
                }
            });
        }
    });

    /*
     * Style Content elements using bootstrap
     * =======================================================================
     */
    $(function () {
        var $content = $('#content'),
            $tbls = $content.find('table');

        $tbls.addClass('table table-hovered');
    });

    /*
     * Enable album viewer
     * =======================================================================
     */
    $(function () {

        $('.vd-album').each(function () {
            var data, gpid, albumspec, render, vwr, dims,
                $album = $(this);

            data = $album.data('album');
            gpid = data['gp-id'];
            albumspec = data['album-spec'];
            render = data.render || "play";
            dims = data.dimensions;

            vwr = $album.gpAlbum({"account": gpid, "albumspec": albumspec, "render": render, "dimensions": dims})[0];
        });
    });
}(window.jQuery));
