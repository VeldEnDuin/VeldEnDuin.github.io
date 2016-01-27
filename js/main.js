/*jslint browser: true */
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
     * image rotation stuff
     * ---------------------------------------------------------------
     */
    function imgLoadAndRotate(imgs, time, fn) {
        time = time || 5000 * (1 + Math.random(5000));
        if (imgs === null || imgs === undefined || !imgs.length) {
            return;
        }
        var imgcnt = imgs.length, imgndx = imgs.length;

        function loaded() {
            imgndx -= 1;
            if (imgndx === 0) {
                setInterval(function () {
                    imgndx = (imgndx + 1) % imgcnt;
                    fn(imgs[imgndx]);
                }, time);
            }
        }

        if (imgcnt > 1) {
            imgs.forEach(function (img) {
                $('<img src=' + img + '>').load(loaded);
            });
        }
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
         * Make external links go _blank
         * =======================================================================
         */
        $content.find("a[href^='http']").attr('target', '_blank');

        /*
         * Apply template-styled links to matching uri
         * =======================================================================
         */
        $(".template.link-style > a").each(function () {
            var $lnk = $(this), tgt;

            if ($lnk.length === 1) {
                tgt = $lnk.attr('href');
                $content.find("a[href='" + tgt + "']").each(function () {
                    var $a = $(this);
                    $lnk.clone().insertBefore($a);
                    $a.remove();
                });
            }
        });

        /*
         * give unstyled content-images a basic style
         * =======================================================================
         */
        $content.find("img:not([class])").addClass("img-responsive img-rounded");


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


        /*
         * make 404 adapt to language
         * =======================================================================
         */
        (function () {
            var lang = "nl", paths = window.location.pathname.split('/');
            if (document.title.indexOf("404") === 0) {
                if (paths.length > 2 && paths[1].length === 2) {
                    lang = paths[1];
                }
                $("a.navbar-brand").attr("href", "/" + lang + "/");
                $content.append("todo specific content for lang = " + lang);
            }
        }());
    });


    /*
     * Build up the group page 'doen'
     * =======================================================================
     */
    $(function () {
        var $groupList = $('#vd-group-doen'), $groupItems, subgrpNames, $items, geo,
            subGrpCnts, allCnt,
            $btnGrp, activeSubGrp, $btns, showSubNav = true;

        if ($groupList && $groupList.length > 0) {

            subgrpNames = $groupList.data('subgroupnames');
            geo = parseLatLon($groupList.data('geolocation'));
            $groupItems = $('.vd-group-item', $groupList);
            $items = $();
            subGrpCnts = {};
            allCnt = 0;

            $groupItems.each(function () {
                var $item = $(this), itemGeo, itemDsp, itemFmt,
                    imgs, subgroups;

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
                imgLoadAndRotate(imgs, 0, function (url) {
                    $('div.vd-group-item-inner', $item).css('background-image', "url('" + url + "')");
                });

                /*
                 * assemble facet-counts information
                 * ---------------------------------------------------------------
                 */

                subgroups = $item.data('subgroups');
                if (subgroups !== undefined && subgroups !== null && Array.isArray(subgroups)) {
                    subgroups.forEach(function (subgrp) {
                        $item.addClass('vd-subgrp-' + subgrp);
                        $item.addClass('vd-subgrp-ALL');
                        if (!subGrpCnts[subgrp]) {
                            subGrpCnts[subgrp] = 0;
                        }
                        subGrpCnts[subgrp] += 1;
                    });
                } else {
                    showSubNav = false;
                }
            });
            allCnt = $items.length;

            /*
             * facet-counts, facet-filtering, fragment-identifier-facets
             * ---------------------------------------------------------------
             */

            if (showSubNav) {

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
                                     '"><a href="#' + subgrp + '">' + label + '</a></li>');

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
                        $('<div class="vd-group-filter">').append(
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
        }
    });

    /*
     * Inject Spaces in the grids of .spacedlayout
     * =======================================================================
     */
    $(function () {
        var $spacegroups = $('.picto-grid.vd-select-list');

        function injArr(cnt, prd) {
            if (prd < 3) {
                return [];
            }
            var mod = cnt % prd, mdc = (prd - mod) % prd, tot = cnt + mdc,
                injprd = Math.ceil(tot / (mdc + 1)),
                injoff = mdc !== 0 ? Math.ceil(cnt / (2 * mdc)) : 0,
                injarr = [], n;

            // correction for insertion to be ignored if injection_period+1 would match the period
            injprd += (prd === (injprd + 1)) ? 0 : 1;
            for (n = 0; n < mdc; n += 1) {
                injarr.push(injoff + n * injprd);
            }
            return injarr;
        }

        function spaceit(ndx, elm) {
            $('.spacer', $(elm)).remove();
            var $spc = $(elm), $items = $('.vd-select-item', $spc), $insets = $items.parent('a'),
                count = $items.length, gridsize = 0, injarr, extra, n,
                $fst = $items.eq(0),
                top = $fst.offset().top,
                itemcls = $fst.attr('class');

            $items.each(function (ndx, elm) {
                var elmtop = $(elm).offset().top;
                top = top || elmtop;
                gridsize +=  elmtop === top ? 1 : 0;
            });
            extra = (gridsize - (count % gridsize)) % gridsize;
            for (n = 0; n < extra; n += 1) {
                $spc.append('<a href="#" class="spacer"><div class="' + itemcls + '"><div class="vd-select-item-inner"><div class="vd-select-item-dimmer"></div></div></div></a>');
            }
        }
        function spacethem() {
            $spacegroups.each(spaceit);
        }
        $(window).resize(spacethem);
        spacethem();
    });
    /*
     * Build up the group page 'history-timeline'
     * =======================================================================
     */
    $(function () {
        var $groupList = $('#vd-group-tijdslijn'),
            $items = $('.vd-group-timeline-item', $groupList),
            $grid,
            $tl = $("<div class='timeline'>");

        $tl.append($("<div class='timeline-line'>"));

        function allNonSpacerItems(fn) {
            $items.each(function () {
                var $it = $(this);
                if ($it.hasClass('vd-group-item-spacer')) {
                    return;
                } //else
                return fn($it, $it.data('tl-dot'));
            });
        }


        $groupList.prepend($tl);
        allNonSpacerItems(function ($it) {
            var $dot = $('<span class="timeline-dot"><span>&nbsp;</span></span>'), imgs;
            $tl.append($dot);
            $it.data('tl-dot', $dot);
        });

        function startMasonry() {
            $grid = $groupList.isotope({ // apply the masonry (default) layout.
                // options
                itemSelector: '.vd-group-timeline-item',
                columnWidth: '.vd-group-timeline-item',
                percentPosition: true
            });


            function postlayout(event, items) {
                var tlpos = $tl.position(), tloff = $tl.offset();
                allNonSpacerItems(function ($it, $dot) {
                    var itpos = $it.position(), itoff = $it.offset(), dh = Number($dot.css("height").replace(/\D/g, "")) || 0;
                    $it.removeClass('timeline-left').removeClass('timeline-right');
                    // note the extra -1 is required because the timeline is
                    // sometimes positione at fraction through 50%
                    if (itoff.left < (tloff.left - 1)) {
                        $it.addClass('timeline-left');
                    } else {
                        $it.addClass('timeline-right');
                    }
                    $dot.css("top", (itpos.top + dh) + "px");
                });
            }

            $grid.on('layoutComplete', postlayout);
            postlayout();
        }
        $(window).on("load", function () {
            setTimeout(startMasonry, 0);
        });
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
        $tbls.each(function () {
            var $tbl = $(this),
                $thd = $('thead', $tbl);

            if ($thd.text().trim() === "") {
                $thd.remove();
            }
        });
    });

    /*
     * Enable album viewer
     * =======================================================================
     */
    $(function () {

        $('.vd-album').each(function () {
            var data, gpid, albumspec, render, vwr, dims, thumbsize, uplink,
                $album = $(this);

            data = $album.data('album');
            gpid = data['gp-id'];
            albumspec = data['album-spec'];
            render = data.render || "play";
            dims = data.dimensions;
            thumbsize = data.thumbsize || 100;
            uplink = data.uplink || "/pics";

            vwr = $album.gpAlbumViewer({
                "account": gpid,
                "albumspec": albumspec,
                "render": render,
                "dimensions": dims,
                "thumbsize": thumbsize,
                "uplink": uplink,
                "labels": TRANSL
            })[0];
        });
    });
}(window.jQuery));
