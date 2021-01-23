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
            var lang = "nl", paths = window.location.pathname.split('/'), text = document.title;
            if (document.title.indexOf("404") === 0) {
                if (paths.length > 2 && paths[1].length === 2) {
                    lang = paths[1];
                }
                $("a.navbar-brand").attr("href", "/" + lang + "/");
                text = "404 - " + TRANSL.lost[lang];
                $("h1").html(text);
                document.title = text;
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

                $btnGrp = $('<ul id="submenu" class="vd-group-filter-nav nav nav-pills nav-justified"></ul>');
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
                        $('<div class="subnav row">').append(
                            $('<div class="col-sm-12 hidden-xs">').append(
                                $('<div class="vd-group-filter">').append(
                                    $('<div class="vd-group-filter-inner hidden-xs"></div').append($btnGrp)
                                )
                            )
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

    /**
     * make vdctrl links work ok
     * =======================================================================
     */
    (function () {
        $("*[role='vctrl']").each(function () {
            var $grp, $lst, $scroll, $items, $prev, $next, lstCount,
                itemOff, itemWidth, itemHeight = 0, pos = 0, currentpos = 0;
            $grp  = $(this);
            $lst  = $("*[role='vctrl-list']", $grp);
            $scroll = $lst.parent();
            $items = $("*[role='vctrl-item']", $lst);
            
            
            if ($items.length <= 1) {
                return; // when in embargo all items got removed, we can skip here...
            }
            $prev = $("*[role='vctrl-prev']", $grp);
            $next = $("*[role='vctrl-next']", $grp);
            lstCount  = $items.length;
            itemOff = Math.ceil($items.eq(0).position().left);
            itemWidth = Math.ceil($items.eq(1).position().left - itemOff);


            function scrollPos() {
                // scroll to left side of this desired position
                $scroll.scrollLeft(pos * itemWidth);
                // recalibrate position to actual scroll position
                pos = Math.floor(($scroll.scrollLeft() - itemOff) / itemWidth);
                // scroll to left of actual calibrated position
                $scroll.scrollLeft(pos * itemWidth);
            }
            function nav(offset) {
                pos = Math.min(Math.max((pos + offset), 0), (lstCount - 1));
                scrollPos();
                return -1;
            }
            $prev.click(function () {nav(-1); });
            $next.click(function () {nav(+1); });

            currentpos = $items.index($items.filter(".vctrl-current")) - 1;
            nav(currentpos);
            
            function repos() {
                //align heights
                $items.each(function () { $(this).css('height', 'auto'); });
                itemHeight = 0;
                $items.each(function () { itemHeight = Math.max(itemHeight, $(this).height()); });
                $items.each(function () { $(this).height(itemHeight); });
                //soft jump to leftmost to recalibrate
                $scroll.scrollLeft($items.eq(0).position().left);
                itemOff = Math.ceil($items.eq(0).position().left);
                itemWidth = Math.ceil($items.eq(1).position().left - itemOff);
                scrollPos();
            }

            $(window).resize(function () {repos(); });
            $(window).on('load', function () {repos(); });
            repos();
        });
    }());
    
    /*
     * Build up the slider effect of the horizontal accordeon
     * =======================================================================
     */
    $(function () {
        var $horacc = $("#vd-horacc-list"),
            $sections = $horacc.find(".vd-horacc-section");

        $sections.click(function () {
            var $section = $(this), link = $section.find(".vd-horacc-caption a").attr("href");
            if ($section.hasClass("on")) {
                // already selected --> navigate
                if (link) {
                    window.location = link;
                    return;
                }
                return true; // allow bubble up to caption click
            } //else
            $sections.removeClass("on");
            $section.addClass("on");
            return false; // prevent click-link on nested caption
        });
        /*
        $captions.click(function () {
            return $(this).parent().hasClass("on");
        });
        */

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
     * Enable Zooming into images
     * =======================================================================
     */
    $(function () {
        const browser_id_regex = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];

        let isMobile = browser_id_regex.some((re) => {
                return navigator.userAgent.match(re);
        });
        
        if (isMobile) {
            return; // no zoom features on smartphone
        }
        //else
        
        let $strip = $(".vd-img-strip");
        let $content = $(".vd-layout-page");
        let $imgs = $.merge($("img", $strip), $("img", $content));
        let $display = $("#display");
        let $viewer = $("img", $display);
        let $prev= $(".vd-prev", $display);
        let $next= $(".vd-next", $display);
        $('body').append($display);
        let showingIndex = undefined;
        function closeit() {
            $display.hide();
            showingIndex = undefined;
        }
        function showit(ndx) {
            if (isNaN(ndx)) {
                return closeit();
            } //else
            ndx = ndx % $imgs.length;
            let $img = $imgs.eq(ndx)
            let imgsrc = $img.attr('src');
            showingIndex = ndx;
            $viewer.attr('src', imgsrc);
            $display.show();
        }
        $imgs.each(function(index) {
            $(this).click(() => { showit(index); })
        });
        $viewer.click(closeit);
        $prev.click(() => { showit(showingIndex -1)})
        $next.click(() => { showit(showingIndex +1)})
    });
    
    
    /*
     * Enable banner rotation
     * =======================================================================
     */
    $(function () {
        let $banner = $("#vd-banner");
        //console.log("$banner.length", $banner.length)
        if ($banner.length == 0) {
            return;
        } // else
        let imgs = $banner.data('banners');
        //console.log("imgs", imgs)
        if (imgs.length == 0) {
            return;
        } // else
        
        
        //randomize
        imgs = imgs
            .map((el) => ({sort: Math.random(), element: el}))
            .sort((a,b) => a.sort - b.sort)
            .map((wrap) => wrap.element);
        
        //preload images
        imgs.forEach((imgurl) => {
            let img = new Image();
            img.src = imgurl;
        });
        
        //regularly rotate
        let showNdx = 0;
        function showNext() {
            showNdx = (showNdx +1) % imgs.length;
            let url = imgs[showNdx];
            $banner.css('background-image', `url('${url}')`);
        }
        setInterval(showNext, 7000);
        
        // allow forced interaction
        $banner.click(showNext);
    });
    
}(window.jQuery));
