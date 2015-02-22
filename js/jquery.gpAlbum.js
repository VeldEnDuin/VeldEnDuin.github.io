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
 * Name:   gpAlbum
 * Copyright (c) 2015
 * Author: Marc Portier <marc.portier@gmail.com>
 **************************************************************************
 * Small thingy to load images from a (public) google-album and show those
 * on your site. Uses HTML5 cache to speed up things and avoid load.
 */

/*
 *  TODO
 *  - cache check on album -- when was it changed? -- avoid updating local cache if it is recent enough!
 *  - cache synchronisation issues
 *  -
*/

(function ($) {
    "use strict";

    /*
     * jquery stuff I like to use
     * =======================================================================
     */

    function jqExtendor(name, fn) {
        var ext = {};
        ext[name] = function (pass) {
            return $(this).map(function () {
                return fn($(this), pass);
            });
        };
        $.fn.extend(ext);
    }

    function jqDefine(name, Cstr) {
        jqExtendor(name, function ($e, p) {return new Cstr($e, p); });
    }

    function jqBuild(name, fn) {
        jqExtendor(name, fn);
    }

    function jqMerge(defs, vals) {
        return $.extend($.extend({}, defs), vals);
    }

    function jqEnableEvent(obj, name, bubble) {
        bubble = bubble || false;
        if (name === null || name === undefined) {return; }
        name = String(name);

        if (obj.hasOwnProperty(name)) {
            throw "Can't initialise eventing for " + name + ". Associated property already exists.";
        }

        var $obj = $(obj);
        obj[name] = function (fn) {
            return (fn && $.isFunction(fn)) ? $obj.bind(name, null, fn, bubble) : $obj.triggerHandler(name, [fn]);
        };
    }

    /*
     * standard cache stuff
     * =======================================================================
     */

    function hasLocalStorage() {
        try {
            return window.hasOwnProperty('localStorage') && window.localStorage !== null;
        } catch (e) {
            return false;
        }
    }
    function getCache(key, empty) {
        var result = empty,
            json;
        if (hasLocalStorage()) {
            json = window.localStorage.getItem(key);
            if (json && json.length > 0) {
                try {
                    result = JSON.parse(json);
                } catch (e) { }  // bad object that can't be parsed, so just ignore
            }
        }
        return result;
    }
    function putCache(key, data) {
        var json;
        if (hasLocalStorage()) {
            json = JSON.stringify(data);
            window.localStorage.setItem(key, json);
        }
        return data;
    }


    /*
     * The real stuff
     * =======================================================================
     */
    function GpAlbum($elm, config) {

        this.config = jqMerge(GpAlbum.config, config);

                      //account, albums) {
        if ($elm === null || $elm === undefined || $elm.length !== 1) {
            throw "this will not work without a non-empty single-element jquery wrapper";
        }
        if (this.config.account === null || this.config.account === undefined) {
            throw "this will not work without the gp account-id";
        }
        //https://developers.google.com/picasa-web/docs/2.0/developers_guide_protocol



        this.cacheKey = this.config.cacheKeyPrefix + this.config.account;

        /*
         * TODO - eventing and concurrency
         * http://stackoverflow.com/questions/4671852/how-to-bind-to-localstorage-change-event-using-jquery-for-all-browsers
         * only other windows will get updates
         * --> this suggests multiple windows could use the event!
         * --> this also suggest we have to handle multiple windows working on the central localStorage (locking?)
         *     see http://balpha.de/2012/03/javascript-concurrency-and-locking-the-html5-localstorage/
         *     and https://bitbucket.org/balpha/lockablestorage/src/96b7ddb1962334cde9c647663d0053ab640ec5a1/lockablestorage.js?at=default
         * anyway: least we do is create a jquery event like this to both handle the originating and the listening windows!
         *
         *       $(window).bind('storage', function (e) {
         *            window.console.log(e.originalEvent.key, e.originalEvent.newValue);
         *            if (e.originalEvent.key === ALBUMCACHEKEY) {
         *                cb(e.originalEvent.newValue);
         *            }
         *        });
         */

        this.$album = $elm;
        $elm.data('gpAlbum', this);
        // load information
        this.load();
    }


    GpAlbum.prototype.getAlbumCache = function () {
        var EMPTYCACHE = { "albums": {}, "albumList": [], "lastmodified": null };
        return getCache(this.cacheKey, EMPTYCACHE);
    };

    GpAlbum.prototype.putAlbumCache = function (data) {
        return putCache(this.cacheKey, data);
    };

    GpAlbum.prototype.getMaxImgSize = function () {
        //TODO adapt this to use the real window size available in $elm --> so to dynamically load the correct images for the platform
        // be sure to try and grab device-sreen-size not just browser-window-size!
        // top off at 1600! and do so in increments of 200, 400, 800, 1600 --> use tis.config.imgsizes

        return 1600;
    };

    GpAlbum.prototype.load = function () {

        var uri = this.config.serviceUri,
            imgmax = this.getMaxImgSize(),
            thumbsize = this.config.thumbsize,
            me = this;

        function getAPIUri(type, user, album) {
            if (type) {
                if (user) {
                    uri += '/user/' + user;
                    if (album) {
                        uri += '/albumid/' + album;
                    }
                }
                uri += '?kind=' + type + '&access=visible';
                if (type === "photo") {
                    uri += '&imgmax=' + imgmax;
                }
                uri += '&alt=json-in-script&thumbsize=' + thumbsize + 'c';
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

                // TODO find info about lastmodification to be able to check caching better!

                end();
            };
        }
        function doUpdate() {
            //TODO -- check albumId and/or multiple ones...
            var albumId = me.config.albums[0];
            photoList(me.config.account, albumId, photoListProcessor(albumId, done));
        }

        //TODO create a jquery-update or 'loaded' event on this viewer object
        // then listen to the local-cache update and when that arrives - used it to trigger the event
        // when that is ready - don't doUpdate inline but setImmediate and return
        // window.setImmediate(doUpdate); return;
        doUpdate();
    };



    GpAlbum.prototype.render = function () {
        this.$album.html('js active... account=' + this.config.account + ' -- albumId=' + this.config.albums[0]);

        // TODO allow for multiple rendition systems
        // TODO page turn effect  -- http://www.turnjs.com/#
    };

    GpAlbum.config = {
        "account"        : "NONE",
        "albums"         : "*",
        "cacheKeyPrefix" : "gp.album.",
        "serviceUri"     : "http://picasaweb.google.com/data/feed/api",
        "thumbsize"      : 100,
        "imgsizes"       : [200, 400, 800, 1600]
    };


    /*
     * jquery registration
     * =======================================================================
     */
    jqDefine("gpAlbum", GpAlbum);


}(window.jQuery));
