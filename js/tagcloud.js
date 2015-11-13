/*jslint browser: true bitwise: true */
/*global d3 */
(function ($) {
    "use strict";

    /*
     * Build up the group page 'tagcloud'
     * =======================================================================
     */
    $(function () {
        function vd_kleur_fill(n) {
            var pallet = ["#569F98", "#e8B64F", "#4F5137", "#8B9448", "#8FB742", "#B8BA8A", "#cb2027"];
            return pallet[n % pallet.length];
        }

        var $groupList = $('#vd-group-troeven'),
            $container = $groupList.parent(),
            $items = $('.vd-group-tag-item', $groupList),
            troeven = [],
            num_angles = 2,
            fill = vd_kleur_fill, //TODO category colors in veld-duin scheme
            // TODO sizing automatically to max width and height (like done in jqalbum stuff)
            // TODO resize and redraw upon event
            cw = 1600,
            ch = 400;

        $items.each(function () {
            troeven.push($(this).data('title'));
        });

        $groupList.hide(); // best to cover hiding by css, but for sure we hide here again
        function draw(words) {
            d3.select($container.get(0)).append("svg")
                .attr("width", cw)
                .attr("height", ch)
                .append("g")
                .attr("transform", "translate(" + (cw / 2) + "," + (ch / 2) + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function (d) { return d.size + "px"; })
                .style("font-family", "Impact")
                .style("fill", function (d, i) { return fill(i); })
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function (d) { return d.text; });
        }

        d3.layout.cloud().size([cw, ch])
            .words(troeven.map(function (d) {
                return {text: d, size: 10 + Math.random() * 50};
            }))
            .rotate(function () { return Math.floor((Math.random() - 0.5) * num_angles) * (180 / num_angles); })
            .font("Impact")
            .fontSize(function (d) { return d.size; })
            .on("end", draw)
            .start();
    });

    //TODO make it dynamic refresh after X time

}(window.jQuery));
