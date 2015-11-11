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
 * Name:   gpAlbumViewer
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
     * Check for dependency
     * =======================================================================
     */
    var moment = window.moment;
    if (isEmpty(moment)) {
        throw "this will not work without moment.js library! get it from http://momentjs.com";
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

    /**
    SimpleCache is a simple memory mechanism to store objects. It follows the signatures of the LocalStorage so it can act as a replacement. This one doesn't remember stuff across sessions though.
    */
    function SimpleCache() {
        this.mem = {};
    }
    SimpleCache.prototype.getItem = function (key) {
        return this.mem[key];
    };
    SimpleCache.prototype.setItem = function (key, val) {
        this.mem[key] = val;
    };

    /** Helper function to decide which kind of cache we can use */
    function hasLocalStorage() {
        try {
            return window.hasOwnProperty('localStorage') && window.localStorage !== null;
        } catch (e) {
            return false;
        }
    }

    /**
    JSONCache decorates a simple cache to automatically store json-serialized versions.
    Also enhances the signature to allow for production-function to be passed in.
    */
    function JSONCache(original) {
        //TODO !IMPORTANT -- there is need for some cache invalidation mechanism!
        // --> passing in external validatefn seems most flexible

        this.original = original;
        if (this.original === undefined || this.original === null) {
            if (!hasLocalStorage) {
                this.original = new SimpleCache();
            }
            this.original = window.localStorage;
        }
    }
    JSONCache.prototype.getItem = function (key, cb, producer) {
        var result, json, me = this;
        json = this.original.getItem(key);
        if (!isEmpty(json)) {
            try {
                result = JSON.parse(json);
            } catch (e) {} // just ignore objects that can't be parsed
        }
        if (!isEmpty(result)) {
            return cb(result);
        } // else
        producer(function (data) {
            result = data;
            me.setItem(key, result);
            return cb(result);
        });
    };

    JSONCache.prototype.setItem = function (key, val) {
        var json = JSON.stringify(val);
        this.original.setItem(key, json);
    };

    function standardCache() {
        return new JSONCache();
    }


    /**
    ViewState holds what the viewer is currently displaying
    */
    function ViewState(albid, picid) {
        this.albid = albid;
        this.picid = picid;
    }
    ViewState.parts2hash = function (a, p) {
        return "#!" + [a, p].join(',');
    };
    ViewState.hash2parts = function (hash) {
        if (hash.indexOf("#!") !== 0) {
            throw "bad hash format";
        }
        hash = hash.slice(2);
        return hash.split(',');
    };
    ViewState.fromHash = function (hash) {
        var parts = ViewState.hash2parts(hash);
        return new ViewState(parts[0], parts[1]);
    };
    ViewState.prototype.asHash = function () {
        return ViewState.parts2hash(this.albid, this.picid);
    };

    function imageMaxSize(config) {
        var dim = Math.max(window.screen.width, window.screen.height),
            max = 0;
        config.imgsizes.forEach(function (size) {
            if (dim > size) {
                max = Math.max(max, size);
            }
        });
        return max;
    }

    /**
    Gallery is a service that organizes pictures in albums, two variants
    - GPGallery (GooglePlus-Gallery)
    - CachedGallery (Caching already retrieved sets)
    */
    function GPGallery(config) {
        this.base = config.serviceUri;
        this.owner = config.account;
        this.imgmax = imageMaxSize(config);
        this.thumbsize = config.thumbsize;
        this.cacheKeyPrefix = config.cacheKeyPrefix;
        if (isEmpty(this.base) || isEmpty(this.owner)) {
            throw "GPGallery needs base and owner";
        }
    }
    GPGallery.prototype.cacheKey = function (albid) {
        var keyparts = [this.cacheKeyPrefix, this.owner];
        if (albid !== undefined && albid !== null) {
            keyparts.push(albid);
        }
        return keyparts.join('.');
    };

    //https://developers.google.com/picasa-web/docs/2.0/developers_guide_protocol
    GPGallery.getAPIUri = function (type, albid) {
        var uri = String(this.base);
        if (type) {
            uri += '/user/' + this.owner;
            if (albid) {
                uri += '/albumid/' + albid;
            }
            uri += '?kind=' + type + '&access=visible';
            if (type === "photo") {
                uri += '&imgmax=' + this.imgmax;
            }
            uri += '&alt=json-in-script&thumbsize=' + this.thumbsize + 'c';
            uri += '&callback=?';
        }

        return uri;
    };

    GPGallery.prototype.getAlbumList = function (cb) {
        $.getJSON(this.getAPIUri('album'), function (response) {
            var data = {};
            data.albumSet = {};

            response.feed.entry.forEach(function (aItem) {
                var id = aItem.gphoto$id.$t,
                    name = aItem.title.$t;
                data.albumSet[id] = {
                    "updated"  : moment(aItem.updated.$t).valueOf(),
                    "title"    : name,
                    "numpics"  : aItem.gphoto$numphotos.$t,
                    "thumbnail": aItem.media$group.media$thumbnail[0].url,
                    "description": aItem.media$group.media$description.$t
                };
            });
            data.lastmodified = moment().valueOf();
            cb(data);
        });
    };

    GPGallery.prototype.getPictureList = function (albid, cb) {
        $.getJSON(this.getAPIUri('photo', albid), function (response) {
            var data = {};
            data.photoList = [];

            response.feed.entry.forEach(function (pItem) {
                data.photoList.push({
                    "content"  : pItem.media$group.media$content[0].url,
                    "thumbnail": pItem.media$group.media$thumbnail[0].url,
                    "caption"  : pItem.media$group.media$description.$t
                });
            });

            data.lastmodified = moment().valueOf();
            cb(data);
        });
    };


    function CachedGallery(gallery, cache) {
        if (isEmpty(gallery)) {
            throw "cached gallery needs a fallback real gallery!";
        }
        this.gallery = gallery;
        this.cache = cache || standardCache();
    }
    CachedGallery.prototype.getAlbumList = function (cb) {
        var key = this.gallery.cacheKey(), me = this;
        return this.cache.getItem(key, cb, function (icb) {
            me.gallery.getAlbumList(icb);
        });
    };
    CachedGallery.prototype.getPictureList = function (albid, cb) {
        var key = this.gallery.cacheKey(albid), me = this;
        return this.cache.getItem(key, cb, function (icb) {
            me.gallery.getPictureList(albid, icb);
        });
    };



    /*
     * make albumMatchers that can match for albumIds
     * =======================================================================
     */
    // use composite pattern to care for array of albumSpecs (ids)
    function compositeMatchFn(cms) {
        return function (id, name) {
            return cms.some(function (matchFn) {
                return matchFn(id, name);
            });
        };
    }
    // nested in that composite are regex or identity-mappers
    function simpleMatchFn(pattern) {
        return function (id, name) {
            return (!isEmpty(id) && String(id).match(pattern)) || (!isEmpty(name) && String(name).match(pattern));
        };
    }
    // flattenArray is a helper function that unwraps nested array-in-array elements into a single list
    function flattenArray(inArr, outArr) {
        outArr = outArr || [];
        inArr.forEach(function (elm) {
            if ($.isArray(elm)) {
                flattenArray(elm, outArr);
            } else {
                outArr.push(elm);
            }
        });

        return outArr;
    }
    // makeMatchFn is a factory-method that creates the structure out of an 'albumSpec'
    function makeMatchFn(spec) {
        var matchFn, cms;
        if ($.isArray(spec)) {
            spec = flattenArray(spec);
            cms = [];
            spec.forEach(function (childSpec) {
                cms.push(makeMatchFn(childSpec));
            });
            matchFn = compositeMatchFn(cms);
        } else {
            matchFn = simpleMatchFn(spec);
        }
        return matchFn;
    }

    // make sizeFunction to handle window resize
    function makeSizeAdaptFn(spec, $elm) {
        spec = spec.split(" ");
        var $w = $(window), scale, height = $elm.height();
        if (spec[0] === "scale") {
            scale = Number(spec[1]);
            return function () {
                var h = Math.floor(($w.height() * scale) - $elm.offset().top);
                $elm.height(h);
                $elm.trigger("heightUpdated");
            };

        } else if (spec[0] === "keep") {
            return function ($elm) {
                return; // don't do anything
            };
        }
    }

    /*
     * The real stuff
     * =======================================================================
     */
    function GpAlbumViewer($elm, config) {

        var $w = $(window), sizeUp,
            me = this;

        this.config = jqMerge(GpAlbumViewer.config, config);

        if (isEmpty($elm) || $elm.length !== 1) {
            throw "this will not work without a non-empty single-element jquery wrapper";
        }
        if (isEmpty(this.config.account)) {
            throw "this will not work without the gp Albumaccount-id";
        }

        this.gallery = new CachedGallery(new GPGallery(this.config));
        this.albListFull = {};
        this.matchingAlbumIds = [];
        this.picList = {};

        this.albMatchFn = makeMatchFn(this.config.albumspec);
        this.viewState = new ViewState(); // none --> full list!

        this.$album = $elm.css("overflow", "hidden");
        jqEnableEvent($elm, 'heightUpdated');

        //TODO don't do this for strip render ?
        //or more general - introduce a config height-formula 95% (default) or 105px --> for strip!
        sizeUp = makeSizeAdaptFn(this.config.dimensions, $elm);
        $w.resize(sizeUp).trigger("resize");

        $elm.data('gpAlbumViewer', this);

        // load data, and when it is there --> render
        this.init(function () {
            me.showAlbList();
        });
    }


    GpAlbumViewer.prototype.init = function (cb) {

        var me = this, albid;
        this.gallery.getAlbumList(function (alblist) {
            me.albListFull = alblist;

            if (!isEmpty(alblist.albumSet)) {
                me.matchingAlbumIds = [];
                Object.keys(alblist.albumSet).forEach(function (albid) {
                    var albname = alblist.albumSet[albid].title;
                    if (me.albMatchFn(albid, albname)) {
                        me.matchingAlbumIds.push(albid);
                    }
                });
            }

            // todo: check initial hash to decide what to do now
            /*

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


            */

            // else go into "normal" mode
            if (me.matchingAlbumIds.length === 1) {
                // if the filtered list has length 1
                // then go load that album --> go into view-single album --> and finally render that
                albid = me.matchingAlbumIds[0];
                me.loadAlbum(albid, function() {
                    me.showAlbum(albid);
                });

            } else {
                // do whatever the top level expected
                cb();
            }
        });
    };

    GpAlbumViewer.prototype.loadAlbum = function (albid, cb) {
        var me = this, alb = this.albListFull.albumSet[albid];
        if (isEmpty(alb)) {
            throw "unexpected album loaded should have metadata available already"
        }
        if (isEmpty(alb.photoList) {
            this.gallery.getPictureList(albid, function(piclist) {
                alb.photoList = piclist.photoList;
                cb();
            })
        } else {
            cb();
        }
    };

    GpAlbumViewer.prototype.showAlbList = function () {
        //set view state
        //update hash --> window.location.hash = !albid,picid
        //render
    };

    GpAlbumViewer.prototype.showAlbum = function (albid) {
        //set view state
        //update hash --> window.location.hash = !albid,
        //render
    };

    GpAlbumViewer.prototype.showPicture = function (albid, picid) {
        //setview state
        //update hash --> window.location.hash = !albid,picid
        //render
    };


    /*
     * Renderstrategies
     * ======================================================================
     */
    GpAlbumViewer.RenderStrategy = {};


    /*
     *   render strategy 'echo' : for debugging
     *   ------------------------------------------------------------------
     */
    (function () {
        function EchoRenderStrategy(gpAlbum) {
            this.$elm = gpAlbum.$album;
        }
        EchoRenderStrategy.prototype.drawAlbumList = function (aListData) {
            this.$elm.html('<pre>albs ==> \n' + JSON.stringify(aListData) + '</pre>');
        };
        EchoRenderStrategy.prototype.drawPhotoList = function (pListData) {
            var html = "";
            html += '<pre>imgs ==> \n';
            html += '\turl\t\t\t\t\t\t\t\t\t\t\t\t==>\tlbl\n';
            pListData.forEach(function (item, ndx) {
                var imgurl = item.content,
                    imglbl = (isEmpty(item.caption)) ? "" : item.caption;
                html += '\t' + imgurl + '"\t==>\t"' + imglbl + '"\n';
            });
            html += '</pre>';

            this.$elm.html(html);
        };
        GpAlbumViewer.RenderStrategy.echo = EchoRenderStrategy;
    }());

    /*
     *   render strategy 'play' : player with start-pause-next-prev control
     *   ------------------------------------------------------------------
     */
    (function () {
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

        PlayControl.BTN = '<button class="btn btn-primary"></button>';
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

        function div(cfg) {
            cfg = cfg || {};
            // default true even if missing
            if (!cfg.hasOwnProperty("fill")) { cfg.fill   = true; }
            if (!cfg.hasOwnProperty("center")) { cfg.center   = true; }
            if (!cfg.hasOwnProperty("border")) { cfg.border   = true; }

            var $div = $('<div></div>'),
                csses = cfg.csses || {},
                classes = cfg.classes || [];

            if (cfg["for"] === "label") {
                cfg.border = false;
                csses.position          = 'absolute';
                csses.bottom            = 0;
                csses["padding-bottom"] = "2em";
                csses['font-size']      = '2em';
                csses.color             = '#fff';
                csses['text-align']     = 'center';
                csses['text-shadow']    = '0 1px 2px rgba(0,0,0,.6)';
            } else if (cfg["for"] === "control") {
                cfg.border = false;
                csses.position = 'absolute';
                csses.top = 0;
            } else if (cfg["for"] === "view") {
                cfg.border = false;
//                csses.float = "left";
                csses.position = "absolute";
                csses["background-color"] = "rgb(255,255,255)";
                csses["background-repeat"] = "no-repeat";
                csses["background-attachment"] = "fixed";
                csses["background-position"] = "center center";
                csses["background-size"] = "contain";
            }

            if (cfg.clearfix === true) {
                classes.push("clearfix");
            }
            if (cfg.fill === true) {
                csses.width = "100%";
            }
            if (cfg.clip === true) {
                csses.overflow = "hidden";
            }
            if (cfg.center === true) {
                csses.display            = "inline-flex";
                csses["justify-content"] = "center";
            }
            if (cfg.border === true) {
                csses["border-radius"]    = "4px";
                csses.border              = "1px solid #ddd";
                csses.padding             = "4px";
                csses["background-color"] = "rgba(255,255,255,0.25)";
            }

            Object.keys(csses).forEach(function (prop) {
                var val = csses[prop];
                $div.css(prop, val);
            });
            $div.addClass(classes.join(" "));
            return $div;
        }

        function PlayRenderStrategy(gpAlbum) {
            var $vwWrap, $ctrlWrap, $lblWrap, me = this;

            this.$album = gpAlbum.$album;
            this.$viewTrans = div({"clearfix": true, "fill": false, "center": false, "border": false, "clip": true});
            this.$view = $();
            this.$album.heightUpdated(function () {
                var h = (me.$album.height() - 10), w = (me.$album.width() - 10);
                me.viewHeight = h;
                me.viewWidth = w;
                me.$view.width(w).height(h);
                me.$viewTrans.width(w).height(h);
            }).trigger("heightUpdated");

            this.interval = 5000;

            this.content = null;
            this.index = -1;
            $ctrlWrap = div({"for": "control"});
            this.ctrl = new PlayControl($ctrlWrap, this.interval,
                                        function () {me.prev(); },
                                        function () {me.next(); });

            $vwWrap = div({"center": false});
            this.$view = this.newView();
            this.$viewTrans.append(this.$view);
            $vwWrap.append(this.$viewTrans);

            $lblWrap = div({"for" : "label"});


            this.$lbl = $('<div></div>');
            $lblWrap.append(this.$lbl);

            this.$album.html('').append($vwWrap).append($ctrlWrap).append($lblWrap);
        }
        PlayRenderStrategy.prototype.newView = function (imgurl) {
            var $vw = div({"for" : "view"});
            $vw.width(this.viewWidth).height(this.viewHeight);
            if (!isEmpty(imgurl)) {
                $vw.css("background-image", "url('" + imgurl + "')");
            }
            return $vw;
        };
        PlayRenderStrategy.prototype.drawAlbumList = function (aListData) {
            this.$view.html('todo support albumlist drawing in play control...');
        };
        PlayRenderStrategy.prototype.drawPhotoList = function (pListData) {
            if (isEmpty(pListData)) {
                return;
            }

            this.$view.html('');
            this.content = pListData;
            this.size = pListData.length;
            this.ctrl.restart();
        };
        PlayRenderStrategy.prototype.show = function () {
            if (isEmpty(this.content)) {return; }
            var img = this.content[this.index],
                imgurl = img.content,
                imglbl = isEmpty(img.caption) ? "&nbsp;" : img.caption,
                me = this,
                $old = this.$view;
            this.$view = this.newView(imgurl);
            this.$view.insertBefore($old);
            $old.animate({"opacity": 0}, Math.floor(this.interval / 5) + 1, function () {
            //$old.animate({"margin-left": "-100%"}, Math.floor(this.interval / 5) + 1, function () {
                $old.remove();
                me.$lbl.html(imglbl);
            });
        };

        PlayRenderStrategy.prototype.next = function () {
            if (isEmpty(this.content)) {return; }
            this.index = (((this.index + 1) % this.size) + this.size) % this.size;
            this.show();
        };

        PlayRenderStrategy.prototype.prev = function () {
            if (isEmpty(this.content)) {return; }
            this.index = (((this.index - 1) % this.size) + this.size) % this.size;
            this.show();
        };

        GpAlbumViewer.RenderStrategy.play = PlayRenderStrategy;
    }());


    /*
     *   render strategy 'carousel' : using bootstrap - carousel
     *   ------------------------------------------------------------------
     */
    (function () {
        function CarouselRenderStrategy(gpAlbum) {
            this.$album = gpAlbum.$album;
            this.interval = 5000;

            var me = this;
            this.$album.heightUpdated(function () { me.sizeUp(); }).trigger("heightUpdated");
        }
        CarouselRenderStrategy.prototype.sizeUp = function () {
            $("div.item", this.$album).height(this.$album.height() - 10);
        };
        CarouselRenderStrategy.prototype.drawAlbumList = function (aListData) {
            this.$album.html('<pre>albs ==> \n' + JSON.stringify(aListData) + '</pre>');
        };
        CarouselRenderStrategy.prototype.drawPhotoList = function (pListData) {
            var $carousel, html = "",
                id = "album-carousel-" + Math.floor(Math.random() * 100000);
            html += '<div style="width: 100%" class="carousel slide" data-ride="carsousel" id="' + id + '">';
            html += '<div class="carousel-inner" role="listbox">';
            pListData.forEach(function (item, ndx) {
                var imgurl = item.content,
                    imglbl = (isEmpty(item.caption)) ? "" : item.caption;
                html += '<div class="item ' + (ndx === 0 ? 'active' : '') + '">';
                html += '<img style="margin: auto auto; max-width: 100%; max-height: 100%" src="' + imgurl + '" alt="' + imglbl + '">';
                html += '<div class="carousel-caption">' + imglbl + '</div>';
                html += '</div>';
            });
            html += '</div>';
            // controls
            html += '<a class="left  carousel-control" href="#' + id + '" role="button" data-slide="prev"><span class="glyphicon glyphicon-chevron-left " aria-hidden="true"></span></a>';
            html += '<a class="right carousel-control" href="#' + id + '" role="button" data-slide="next"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></a>';

            html += '</div>';

            $carousel = $(html).carousel({interval: this.interval});
            this.$album.html('').append($carousel);
            this.sizeUp();
        };
        GpAlbumViewer.RenderStrategy.carousel = CarouselRenderStrategy;
    }());

    /*
     *   render strategy 'strip' : making a strip/list of all thumbnails
     *   ------------------------------------------------------------------
     */
    (function () {
        function StripRenderStrategy(gpAlbum) {
            this.$album = gpAlbum.$album;
        }
        StripRenderStrategy.prototype.drawAlbumList = function (aListData) {
            this.$album.html('<pre>albs ==> \n' + JSON.stringify(aListData) + '</pre>');
        };
        StripRenderStrategy.prototype.drawPhotoList = function (pListData) {
            var item, imgurl, imglbl, ndx = 0, h = this.$album.height(),
                neededImgs = Math.ceil(window.screen.width * 2 / h), html = '';

            if (pListData.length > 0) {
                html += '<div style="width:200%;height:' + h + 'px">';
                for (ndx = 0; ndx < neededImgs; ndx += 1) {
                    item = pListData[ndx % pListData.length];
                    imgurl = item.content;
                    imglbl = (isEmpty(item.caption)) ? "" : item.caption;
                    html += '<img style="padding-right:2px;max-width:100%;max-height:100%;" src="' + imgurl + '" alt="' + imglbl + '">';
                }
                html += '</div>';
                this.$album.html(html);
            }
        };
        GpAlbumViewer.RenderStrategy.strip = StripRenderStrategy;
    }());



    /*
     *   render strategy 'browser' : for debugging
     *   ------------------------------------------------------------------
     */
    (function () {
        function BrowserRenderStrategy(gpAlbum) {
            this.$elm = gpAlbum.$album;
        }
        BrowserRenderStrategy.prototype.drawAlbumList = function (aListData) {
            this.$elm.html('<pre>albs ==> \n' + JSON.stringify(aListData) + '</pre>');
        };
        BrowserRenderStrategy.prototype.drawPhotoList = function (pListData) {
            var html = "";
            html += '<pre>imgs ==> \n';
            html += '\turl\t\t\t\t\t\t\t\t\t\t\t\t==>\tlbl\n';
            pListData.forEach(function (item, ndx) {
                var imgurl = item.content,
                    imglbl = (isEmpty(item.caption)) ? "" : item.caption;
                html += '\t' + imgurl + '"\t==>\t"' + imglbl + '"\n';
            });
            html += '</pre>';

            this.$elm.html(html);
        };
        GpAlbumViewer.RenderStrategy.browser = BrowserRenderStrategy;
    }());


    GpAlbumViewer.prototype.getRenderer = function () {
        if (isEmpty(this.renderer)) {
            this.renderer = new GpAlbumViewer.RenderStrategy[this.config.render](this);
        }
        return this.renderer;
    };

    GpAlbumViewer.prototype.render = function (updateId) {
        var me = this,
            albumId = this.matchingAlbumIds[0],
            render = me.getRenderer(),
            content = me.getContent(albumId);
console.log("RENDER // updateId = %s, albumId = %s, content ==>", updateId, albumId, content);
        // TODO support rendering more then only configured first album
        if (albumId === updateId && !isEmpty(content)) {
            if (isEmpty(albumId)) {
                render.drawAlbumList(content);
            } else {
                render.drawPhotoList(content.photoList);
            }
        }
    };

    GpAlbumViewer.config = {
        "account"        : "NONE",
        "albumspec"      : "*",
        "cacheKeyPrefix" : "gp.album",
        "serviceUri"     : "http://picasaweb.google.com/data/feed/api",
        "thumbsize"      : 100,
        "imgsizes"       : [200, 400, 800, 1600],
        "render"         : "play",
        "dimensions"     : "scale 0.95"
    };


    /*
     * jquery registration
     * =======================================================================
     */
    jqDefine("gpAlbumViewer", GpAlbumViewer);


}(window.jQuery));
