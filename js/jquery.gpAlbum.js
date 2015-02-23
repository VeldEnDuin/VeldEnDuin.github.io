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

    function jqEnableEvent(obj, name, preventBubble) {
        preventBubble = preventBubble || false;
        if (name === null || name === undefined) {return; }
        name = String(name);

        if (obj.hasOwnProperty(name)) {
            throw "Can't initialise eventing for " + name + ". Associated property already exists.";
        }

        var $obj = $(obj);
        obj[name] = function (fn) {
            return (fn && $.isFunction(fn)) ? $obj.bind(name, null, fn, preventBubble) :  $obj.triggerHandler(name, fn);
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
     * TODO - concurrency
     * http://stackoverflow.com/questions/4671852/how-to-bind-to-localstorage-change-event-using-jquery-for-all-browsers
     * only other windows will get updates
     * --> this suggests multiple windows could use the event!
     * --> this also suggest we have to handle multiple windows working on the central localStorage (locking?)
     *     see http://balpha.de/2012/03/javascript-concurrency-and-locking-the-html5-localstorage/
     *     and https://bitbucket.org/balpha/lockablestorage/src/96b7ddb1962334cde9c647663d0053ab640ec5a1/lockablestorage.js?at=default
     * anyway: least we do is create a jquery event like this to both handle the originating and the listening windows!
     *
     */



    /*
     * The real stuff
     * =======================================================================
     */
    function GpAlbum($elm, config) {

        var me = this;

        this.config = jqMerge(GpAlbum.config, config);

                      //account, albums) {
        if ($elm === null || $elm === undefined || $elm.length !== 1) {
            throw "this will not work without a non-empty single-element jquery wrapper";
        }
        if (this.config.account === null || this.config.account === undefined) {
            throw "this will not work without the gp account-id";
        }




        this.$album = $elm;
        $elm.data('gpAlbum', this);

        jqEnableEvent($elm, 'albumUpdated');
        $(window).bind('storage', function (e) {
            // for events coming from other windows that are open and could see the update
            window.console.log("local storage update from other window on key == " +
                               e.originalEvent.key);
            var albumId = me.matchCacheKey(e.originalEvent.key);
            window.console.log("updated albumId == " + albumId);
            if (albumId !== undefined) {
                me.fireUpdated(albumId, e.originalEvent.newValue); //propagate event
            }
        });

        // load information
        this.load();
    }

    GpAlbum.prototype.fireUpdated = function (id, content) {
        this.$album.albumUpdated({"id": id, "content": content});
    };

    GpAlbum.prototype.albumReady = function (albumId, fn) {
        var $elm = this.$album,
            handler = function (evt, data) {
                if (data.id === albumId) {
                    $elm.unbind('albumUpdated', handler);
                    fn(data.content);
                }
            };
        $elm.bind('albumUpdated', handler);
    };

    GpAlbum.prototype.cacheKey = function (albumId) {
        var keys = [this.config.cacheKeyPrefix, this.config.account];
        if (albumId !== undefined && albumId !== null) {
            albumId = String(albumId);
            if (albumId.length > 0) {
                keys.push(albumId);
            }
        }
        return keys.join('.');
    };

    GpAlbum.prototype.matchCacheKey = function (key) {
        var leadKey = this.cacheKey();
        if (key.search(leadKey) === 0) {
            if (key.length === leadKey.length) {
                return ""; //empty string indicating match on account
            }
            return key.slice(leadKey.length + 1); // albumId
        }
    };

    GpAlbum.prototype.getCache = function (albumId) {
        var EMPTY = { "photoList": [], "lastmodified": null };
        if (albumId === null || albumId === undefined) {
            EMPTY = { "albumList": [], "lastmodified": null };
        }
        return getCache(this.cacheKey(albumId), EMPTY);
    };

    GpAlbum.prototype.putCache = function (albumId, data) {
        var cached = putCache(this.cacheKey(albumId), data);
        this.fireUpdated(albumId, cached); // fire-event!
        return cached;
    };



    //TODO some withCache() that claims a lock and then

    GpAlbum.prototype.getMaxImgSize = function () {
        //TODO adapt this to use the real window size available in $elm --> so to dynamically load the correct images for the platform
        // be sure to try and grab device-sreen-size not just browser-window-size!
        // top off at 1600! and do so in increments of 200, 400, 800, 1600 --> use tis.config.imgsizes

        return 1600;
    };

    GpAlbum.prototype.load = function () {

        var base = this.config.serviceUri,
            imgmax = this.getMaxImgSize(),
            thumbsize = this.config.thumbsize,
            account = this.config.account,
            me = this;

        //https://developers.google.com/picasa-web/docs/2.0/developers_guide_protocol
        function getAPIUri(type, user, album) {
            var uri = String(base);
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

        function albumList(user, cb) {
            $.getJSON(getAPIUri('album', user), function (response) {
                var data = {};
                data.albumList = [];

                response.feed.entry.forEach(function (aItem) {
                    data.albumList.push({
                        "updated"  : aItem.updated.$t,
                        "title"    : aItem.title.$t,
                        "numpics"  : aItem.gphoto$numphotos.$t,
                        "thumbnail": aItem.media$group.media$thumbnail[0].url
                    });
                });

                data.lastmodified = (new Date()).getTime();
                cb(data);
            });
        }

        function photoList(user, album, cb) {
            $.getJSON(getAPIUri('photo', user, album), function (response) {
                var data = {};
                data.photoList = [];

                response.feed.entry.forEach(function (pItem) {
                    data.photoList.push({
                        "content"  : pItem.media$group.media$content[0].url,
                        "thumbnail": pItem.media$group.media$thumbnail[0].url
                    });
                });

                data.lastmodified = (new Date()).getTime();
                cb(data);
            });
        }

        function doLoad() {
            // TODO load albumList for account and process that
            albumList(account, function (aList) {
                me.putCache("", aList);
                me.albums = {};

                // TODO -- check albumId as spec and maybe load multiple ones...
                var albumId = me.config.albums[0];  //for now only one expected
                me.albums[albumId] = me.getCache(albumId);
                // TODO compare lastmod-dates on album as obtained from account-album-list
                //      with those in cache to avoid updating local cache if it is recent enough!
                me.albumReady(albumId, function (content) {
                    me.albums[albumId] = content;
                });
                photoList(account, albumId, function (pList) {
                    me.putCache(albumId, pList);
                });
                me.render();
            });
        }

        window.setTimeout(doLoad, 0);
        return;
    };

    GpAlbum.prototype.render = function () {
        var albumId = this.config.albums[0],
            $elm = this.$album,
            account = this.config.account,
            me = this;

        function doEcho() {
            window.console.log("do echo");
            $elm.html('<pre>account=' + account + '\nalbumId=' + albumId + '\nimgs ==> \n' +
                      JSON.stringify(me.albums[albumId].photoList) + '</pre>');
        }

        if (this.albums && this.albums[albumId] && this.albums[albumId].photoList &&
                this.albums[albumId].photoList.length > 0) {
            window.console.log("immediate content");
            doEcho();
        } else {
            window.console.log("need to wait for items");
            this.albumReady(albumId, doEcho);
        }


        // TODO allow for multiple rendition systems
        // TODO page turn effect  -- http://www.turnjs.com/#
    };

    GpAlbum.config = {
        "account"        : "NONE",
        "albums"         : "*",
        "cacheKeyPrefix" : "gp.album",
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
