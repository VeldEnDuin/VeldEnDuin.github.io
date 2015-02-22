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

    function Viewer(account, albums) {
        //https://developers.google.com/picasa-web/docs/2.0/developers_guide_protocol
        var ALBUMCACHEKEY = "vd.album",
            EMPTY = { "albums": {}, "albumList": [] };

        function hasLocalStorage() {
            try {
                return window.hasOwnProperty('localStorage') && window.localStorage !== null;
            } catch (e) {
                return false;
            }
        }
        this.getAlbumCache = function () {
            var result = EMPTY,
                json;
            if (hasLocalStorage()) {
                json = window.localStorage.getItem(ALBUMCACHEKEY);
                if (json && json.length > 0) {
                    try {
                        result = JSON.parse(json);
                    } catch (e) { }  // bad object that can't be parsed, so just ignore
                }
            }
            return result;
        };
        this.putAlbumCache = function (data) {
            var json;
            if (hasLocalStorage()) {
                json = JSON.stringify(data);
                window.localStorage.setItem(ALBUMCACHEKEY, json);
            }
            return data;
        };
        this.onLoad = function (cb) {
    //TODO - this will not work!
    // http://stackoverflow.com/questions/4671852/how-to-bind-to-localstorage-change-event-using-jquery-for-all-browsers
    // only other windows will get updates
    // --> this suggests multiple windows could use the event!
    // --> this also suggest we have to handle multiple windows working on the central localStorage (locking?)
    //     see http://balpha.de/2012/03/javascript-concurrency-and-locking-the-html5-localstorage/
    //     and https://bitbucket.org/balpha/lockablestorage/src/96b7ddb1962334cde9c647663d0053ab640ec5a1/lockablestorage.js?at=default
    // anyway: least we do is create a jquery event like this to both handle the originating and the listening windows!

            $(window).bind('storage', function (e) {
                window.console.log(e.originalEvent.key, e.originalEvent.newValue);
                if (e.originalEvent.key === ALBUMCACHEKEY) {
                    cb(e.originalEvent.newValue);
                }
            });
        };


        this.account = account;
        this.albums = albums;
        // load information
        this.load();
    }

    Viewer.prototype.load = function () {

        var ALBUMAPIURI = "http://picasaweb.google.com/data/feed/api",
            THUMBSIZE = 100,
            me = this;

        function getMaxImgSize() {
            //TODO adapt this to use the real window size available --> so to dynamically load the correct images for the platform
            // be sure to try and grab device-sreen-size not just browser-window-size!
            // top off at 1600! and do so in increments of 200, 400, 800, 1600
            return 1600;
        }
        function getAPIUri(type, user, album) {
            var uri = ALBUMAPIURI;
            if (type) {
                if (user) {
                    uri += '/user/' + user;
                    if (album) {
                        uri += '/albumid/' + album;
                    }
                }
                uri += '?kind=' + type + '&access=visible';
                if (type === "photo") {
                    uri += '&imgmax=' + getMaxImgSize();
                }
                uri += '&alt=json-in-script&thumbsize=' + THUMBSIZE + 'c';
                uri += '&callback=?';
            }

            return uri;
        }

        function albumList(user, fn) {
            $.getJSON(getAPIUri('album', user), fn);
        }
        function photoList(user, album, fn) {
            window.console.log("get photList for user = " + user, ", album = " + album);
            $.getJSON(getAPIUri('photo', user, album), fn);
        }

        this.data = this.getAlbumCache();
        function done() {
            me.putAlbumCache(me.data); // this should fire the update event.
        }
        function photoListProcessor(albumId, end) {
            return function (pList) {
                var items = [];

                pList.feed.entry.forEach(function (pItem) {
                    items.push({
                        "content"  : pItem.media$group.media$content[0].url,
                        "thumbnail": pItem.media$group.media$thumbnail[0].url
                    });
                });
                me.data.albums[albumId] = items;

                // content we are looking for is in
                // pListData.feed.entry[] --> array for each image
                //     .media$group.media$content[0].url --> link to image
                //     .media$group.media$thumbnail[0].url --> link to thumbnail-image

                end();
            };
        }
        function doUpdate() {
            //TODO -- check albumId and/or multiple ones...
            var albumId = me.albums[0];
            photoList(me.account, albumId, photoListProcessor(albumId, done));
        }

        //TODO create a jquery-update or 'loaded' event on this viewer object
        // then listen to the local-cache update and when that arrives - used it to trigger the event
        // when that is ready - don't doUpdate inline but setImmediate and return
        // window.setImmediate(doUpdate); return;
        doUpdate();
    };



    Viewer.prototype.render = function ($album) {
        $album.html('js active... account=' + this.account + ' -- albumId=' + this.albums[0]);

        //TODO page turn effect  -- http://www.turnjs.com/#
    };

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

            vwr = new Viewer(gpid, albumspec);
            vwr.render($album);
        }

    });
}(window.jQuery));
