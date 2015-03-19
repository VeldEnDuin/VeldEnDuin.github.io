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
        if (isEmpty(name)) {return; }
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
     *
     * Seems a bit overkill maybe for what we should do:
     *   - first process in a given time-slot should load the data
     *     (all others should take what is there and listen for the change-event)
     *
     */


    /*
     * Check for dependency
     * =======================================================================
     */
    var moment = window.moment;
    if (isEmpty(moment)) {
        throw "this will not work without moment.js library! get it from http://momentjs.com";
    }

    /*
     * The real stuff
     * =======================================================================
     */
    function GpAlbum($elm, config) {

        var me = this;

        this.config = jqMerge(GpAlbum.config, config);

        if (isEmpty($elm) || $elm.length !== 1) {
            throw "this will not work without a non-empty single-element jquery wrapper";
        }
        if (isEmpty(this.config.account)) {
            throw "this will not work without the gp account-id";
        }

        this.albums = {};
        this.albumList = undefined;

        this.$album = $elm;
        $elm.data('gpAlbum', this);

        jqEnableEvent($elm, 'contentUpdated');
        $(window).bind('storage', function (e) {
            // for events coming from other windows that are open and could see the update
            window.console.log("local storage update from other window on key == " +
                               e.originalEvent.key);
            var matchResponse = me.matchCacheKey(e.originalEvent.key);
            if (matchResponse !== undefined) {
                me.updateContent(matchResponse.id, e.originalEvent.newValue); //propagate event
            }
        });

        this.$album.contentUpdated(function (evt, data) {
            me.render(data.id);
        });

        // load data
        this.load();
    }

    GpAlbum.prototype.updateContent = function (id, content) {
        if (isEmpty(id)) {
            this.albumList = content;
        } else {
            this.albums[id] = content;
        }
        this.$album.contentUpdated({"id": id, "content": content});
    };

    GpAlbum.prototype.getContent = function (id) {
        if (isEmpty(id)) {
            return this.albumList;
        } else {
            return this.albums[id];
        }
    };

    GpAlbum.prototype.cacheKey = function (albumId) {
        var keys = [this.config.cacheKeyPrefix, this.config.account];
        if (!isEmpty(albumId)) {
            albumId = String(albumId);
            if (albumId.length > 0) {
                keys.push(albumId);
            }
        }
        return keys.join('.');
    };

    GpAlbum.prototype.matchCacheKey = function (key) {
        var leadKey = this.cacheKey(),
            id = "";

        if (key.search(leadKey) !== 0) {
            return; //undefined match-response since no match key
        }

        if (key.length > leadKey.length) {
            id = key.slice(leadKey.length + 1); // albumId
        }

        return {"id": id};
    };

    GpAlbum.prototype.getCache = function (albumId) {
        var EMPTY = { "photoList": [], "lastmodified": null };
        if (isEmpty(albumId)) {
            EMPTY = { "albumList": [], "lastmodified": null };
        }
        return getCache(this.cacheKey(albumId), EMPTY);
    };

    GpAlbum.prototype.putCache = function (albumId, data) {
        var cached = putCache(this.cacheKey(albumId), data);
        this.updateContent(albumId, cached); // fire-event!
        return cached;
    };

    GpAlbum.prototype.getMaxImgSize = function () {
        var dim = Math.max(window.screen.width, window.screen.height),
            max = 0;
        this.config.imgsizes.forEach(function (size) {
            if (dim > size) {
                max = Math.max(max, size);
            }
        });
        return max;
    };

    GpAlbum.prototype.albumIdToShow = function () {
        // TODO -- check albumId as spec and maybe load multiple ones...
        var albumId = this.config.albums[0];  //for now only one expected
        return albumId;

    };


    GpAlbum.prototype.load = function () {

        var base = this.config.serviceUri,
            imgmax = this.getMaxImgSize(),
            thumbsize = this.config.thumbsize,
            account = this.config.account,
            albumId = this.albumIdToShow(), //for now only one expected
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
                data.albumSet = {};

                response.feed.entry.forEach(function (aItem) {
                    var id = aItem.gphoto$id.$t;
                    data.albumSet[id] = {
                        "updated"  : moment(aItem.updated.$t).valueOf(),
                        "title"    : aItem.title.$t,
                        "numpics"  : aItem.gphoto$numphotos.$t,
                        "thumbnail": aItem.media$group.media$thumbnail[0].url
                    };
                });

                data.lastmodified = (new Date()).valueOf();
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

                data.lastmodified = (new Date()).valueOf();
                cb(data);
            });
        }

        function loadFromCache(id) {
            var content = me.getCache(id);
            if (!isEmpty(content)) {
                me.updateContent(id, content);
            }
        }

        loadFromCache("");
        loadFromCache(albumId);

        function doLoad() {
            // TODO load albumList for account and process that
            albumList(account, function (aList) {
                me.putCache("", aList);

                if (me.albums[albumId].lastmodified < aList.albumSet[albumId].updated) {
                    // TODO compare lastmod-dates on album as obtained from account-album-list
                    //      with those in cache to avoid updating local cache if it is recent enough!
                    photoList(account, albumId, function (pList) {
                        me.putCache(albumId, pList);
                    });
                } // else no need to load this album
            });
        }


        window.setTimeout(doLoad, 0);
        return;
    };

    /*
     * Renderstrategies
     * ======================================================================
     */
    GpAlbum.RenderStrategy = {};
    GpAlbum.render = function (render, albumId) {
        var data = render.getContent(albumId);

        if (isEmpty(albumId)) {
            render.drawAlbumList(data);
        } else {
            render.drawPhotoList(data.photoList);
        }
    };

    /*
     *   render strategy 'echo' : for debugging
     *   ------------------------------------------------------------------
     */
    function EchoRenderStrategy(gpAlbum) {
        this.$elm = gpAlbum.$album;
        this.getContent = function (id) { return gpAlbum.getContent(id); };
    }
    EchoRenderStrategy.prototype.drawAlbumList = function (aListData) {
        this.$elm.html('<pre>albs ==> \n' + JSON.stringify(aListData) + '</pre>');
    };
    EchoRenderStrategy.prototype.drawPhotoList = function (pListData) {
        this.$elm.html('<pre>imgs ==> \n' + JSON.stringify(pListData) + '</pre>');
    };
    GpAlbum.RenderStrategy.echo = EchoRenderStrategy;

    /*
     *   render strategy 'play' : for debugging
     *   ------------------------------------------------------------------
     */
    function PlayControl($container, time, fnPrev, fnNext) {
        var $grp, me = this;

        this.fn = {"prev": fnPrev, "next": fnNext};
        this.time = time;
        this.playhandle = null;
        this.index = -1;
        this.$prev = $(PlayControl.BTN).html(PlayControl.BACKGLYPH).click(function () {me.prev(); });
        this.$play = $(PlayControl.BTN).html(PlayControl.PWSEGLYPH).click(function () {me.playtoggle(); });
        this.$next = $(PlayControl.BTN).html(PlayControl.FRWDGLYPH).click(function () {me.next(); });

        $grp = $(PlayControl.BTNGRP).append(this.$prev).append(this.$play).append(this.$next);

        $container.append($grp);
    }

    PlayControl.BTN = '<button class="btn btn-default"></button>';
    PlayControl.BTNGRP = '<div class="btn-grp btn-grp-lg"></div>';
    PlayControl.BACKGLYPH = '<span class="glyphicon glyphicon-step-backward"></span>';
    PlayControl.FRWDGLYPH = '<span class="glyphicon glyphicon-step-forward"></span>';
    PlayControl.PLAYGLYPH = '<span class="glyphicon glyphicon-play"></span>';
    PlayControl.PWSEGLYPH = '<span class="glyphicon glyphicon-pause"></span>';

    PlayControl.prototype.playtoggle = function () {
        if (isEmpty(this.playhandle)) {
            this.start();
        } else {
            this.stop();
        }
    };
    PlayControl.prototype.start = function () {
        var me = this;

        function player() {
            me.next();
            me.playhandle = window.setTimeout(player, me.time);
        }

        player();
        this.$play.html(PlayControl.PWSEGLYPH);
    };
    PlayControl.prototype.stop = function () {
        window.clearTimeout(this.playhandle);
        this.playhandle = null;
        this.$play.html(PlayControl.PLAYGLYPH);
    };
    PlayControl.prototype.restart = function () {
        this.stop();
        this.start();
    };
    PlayControl.prototype.prev = function () { this.fn.prev(); };
    PlayControl.prototype.next = function () { this.fn.next(); };


    function PlayRenderStrategy(gpAlbum) {
        var $ctrlContainer = $('<div></div>'),
            me = this;
        this.getContent = function (id) { return gpAlbum.getContent(id); };
        this.content = null;
        this.index = -1;
        this.ctrl = new PlayControl($ctrlContainer, 5000,
                                    function () {me.prev(); }, function () {me.next(); });
        this.$view = $('<div></div>');
        this.$album = gpAlbum.$album.html('').append($ctrlContainer).append(this.$view);

    }
    PlayRenderStrategy.prototype.drawAlbumList = function (aListData) {
        this.$elm.html('loading...');
    };
    PlayRenderStrategy.prototype.drawPhotoList = function (pListData) {
        if (isEmpty(pListData)) {
            return;
        }

        this.content = pListData;
        this.size = pListData.length;
        this.ctrl.restart();

    };
    PlayRenderStrategy.prototype.show = function () {
        if (isEmpty(this.content)) {return; }
        this.$view.html('<img src="' + this.content[this.index].content + '">');
    };

    PlayRenderStrategy.prototype.next = function () {
        if (isEmpty(this.content)) {return; }
        this.index = (this.index + 1) % this.size;
        this.show();
    };

    PlayRenderStrategy.prototype.prev = function () {
        if (isEmpty(this.content)) {return; }
        this.index = (this.index - 1) % this.size;
        this.show();
    };


    GpAlbum.RenderStrategy.play = PlayRenderStrategy;

    // TODO page turn effect  -- http://www.turnjs.com/#
    // TODO album-browser strategy


    GpAlbum.prototype.getRenderer = function () {
        if (isEmpty(this.renderer)) {
            this.renderer = new GpAlbum.RenderStrategy[this.config.render](this);
        }
        return this.renderer;
    };

    GpAlbum.prototype.render = function (updateId) {
        var me = this,
            albumId = this.config.albums[0],
            render = me.getRenderer();

        if (albumId === updateId) {
            GpAlbum.render(render, albumId);
        }
    };


    GpAlbum.config = {
        "account"        : "NONE",
        "albums"         : "*",
        "cacheKeyPrefix" : "gp.album",
        "serviceUri"     : "http://picasaweb.google.com/data/feed/api",
        "thumbsize"      : 100,
        "imgsizes"       : [200, 400, 800, 1600],
        "render"         : "play"
    };


    /*
     * jquery registration
     * =======================================================================
     */
    jqDefine("gpAlbum", GpAlbum);


}(window.jQuery));
