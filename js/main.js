(function ($) {
    "use strict";
    var TRANSL = {};

    function parseLatLon(geom) {
        if (!geom) { return null; }
        var parts = geom.replace(/\s+/gi, '').split(',');
        return {
            "lat" : parts[0],
            "lon" : parts[1]
        };
    }

    function calculateDisplacement(from, to) {
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

        return {
            "distance": dist,
            "degree"  : degr,
            "cardinal": crdn,
            "label"   : dist + " km " + crdn
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

    /*
     * Build up the group pages
     * =======================================================================
     */
    $(function () {
        var $groupList = $('#vd-group-list'),
            geo,
            $groupItems,
            $items,
            subGrpCnts,
            $btnGrp,
            activeSubGrp,
            $btns;

        if ($groupList && $groupList.length > 0) {
            geo = parseLatLon($groupList.data('geolocation'));
            $groupItems = $('.vd-group-item', $groupList);
            $items = $();
            subGrpCnts = {};

            $groupItems.each(function () {
                var $item = $(this),
                    itemGeo,
                    itemDsp,
                    imgs,
                    imgcnt,
                    imgndx,
                    subgroups;

                $items = $items.add($item);

                /*
                 * geo-ref stuff and displacement calculations
                 * ---------------------------------------------------------------
                 */
                itemGeo = parseLatLon($item.data('location'));
                itemDsp = calculateDisplacement(geo, itemGeo);

                $item.data('geo', itemGeo);
                if (itemDsp) {
                    $item.data('distance', itemDsp.distance);
                    // find "route" link and replace by displacement tostring
                    $(".vd-location", $item).append(" <span>(" + itemDsp.label + ")</span>");
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
                    if (!subGrpCnts[subgrp]) {
                        subGrpCnts[subgrp] = 0;
                    }
                    subGrpCnts[subgrp] += 1;
                });
            });

            /*
             * facet-counts, facet-filtering, fragment-identifier-facets
             * ---------------------------------------------------------------
             */
            $btnGrp = $("<div class='btn-group btn-group-lg btn-group-justified vd-subgrp-btns' " +
                            " role='group' data-toggle='buttons'>");
            $btns = $();
            activeSubGrp = null;

            (function () {
                function toggleActive(canReset, newActiveGrp, $btn) {
                    $btn = $btn || $("#vd-subgrp-btn-" + newActiveGrp);

                    if (activeSubGrp === newActiveGrp) {
                        if (canReset) {
                            // set off  --> all on
                            $btns.addClass('active');
                            // make all items visible
                            $items.fadeIn(1500);
                            activeSubGrp = null;
                            window.location.hash = '';
                        }
                    } else {
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
                    }
                    /*
                    $btns.each(function(){
                        var $btn = $(this)
                          , active = $btn.hasClass('active')
                          , label = $btn.data('label')
                        ;
                        $btn.html('<span></span> ' + label);
                    });
                    */
                    return false;
                }
                Object.keys(subGrpCnts).forEach(function (subgrp) {
                    var cnt = subGrpCnts[subgrp],
                        $check = $("<input type='checkbox' autocomplete='off' checked>"),
                        $btn = $("<label id='vd-subgrp-btn-" + subgrp + "' class='btn btn-default active' ></label>"),
                        label = "<span class='glyphicon'></span> " + subgrp + " (" + cnt + ")";

                    $btn.append($check).append(label).data('label', label);

                    $btns = $btns.add($btn);

                    $btn.click(function () { return toggleActive(true, subgrp, $btn); });
                    $btnGrp.append($btn);
                });

                $groupList.before($("<div class='row hidden-sm hidden-xs'>").append($btnGrp));
                //read the fragment-identifier and call the toggleActive(grp)
                function followHash() {
                    if (location.hash && location.hash.length > 1) { toggleActive(false, location.hash.slice(1));  }
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
            $shareBtns,
            applicatorFor;

        if ($shareGrp && $shareGrp.length > 0) {
            shareData = $shareGrp.data('share');
            $shareBtns = $('button', $shareGrp);
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

        var $album = $('#album'),
            data,
            gpid,
            albumspec,
            vwr;

        if ($album && $album.length === 1) {
            data = $album.data('album');
            gpid = data['gp-id'];
            albumspec = data['album-spec'];

            vwr = $album.gpAlbum({"account": gpid, "albums": albumspec})[0];
            vwr.render();
        }

    });
}(window.jQuery));
