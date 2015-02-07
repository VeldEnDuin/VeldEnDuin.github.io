;
(function($) {
var TRANSL = {}
;

function parseLatLon(geom) {
    if (!geom) return null;
    var parts = geom.replace(/\s+/gi,'').split(',')
    ;
    return {
        "lat" : parts[0]
      , "lon" : parts[1]
    }
};


function calculateDisplacement(from, to) {
/* assumes
    <script src="http://maps.google.com/maps/api/js?sensor=true&libraries=geometry"
            type="text/javascript" charset="utf-8"></script>
*/
    if (!google.maps) return null;

    var geoFrom = new google.maps.LatLng(from.lat, from.lon)
      , geoTo   = new google.maps.LatLng(to.lat  , to.lon)
      , dist = Math.round(
          google.maps.geometry.spherical.computeDistanceBetween(geoFrom, geoTo)
        )
      , degr
      , crdn
      , cardinalDirections = TRANSL.directions
      , numParts = cardinalDirections.length
      , partSize = 360/numParts
    ;

    if (isNaN(dist) || dist == 0) return null;

    dist = Math.round(dist/100)/10;
    degr = google.maps.geometry.spherical.computeHeading(geoFrom, geoTo);
    crdn = cardinalDirections[Math.floor((degr+360 +partSize/2)/45)%8];

    return {
        "distance": dist
      , "degree"  : degr
      , "cardinal": crdn
      , "label"   : dist + " km " + crdn
    }
}


// when the page is ready...
$(function(){
    TRANSL = $('body').data('translations')

    var $groupList = $('#vd-group-list')
      , geo = parseLatLon($groupList.data('geolocation'))
      , $groupItems = $('.vd-group-item', $groupList)
    ;

    $groupItems.each(function() {
        var $item = $(this)
          , itemGeo = parseLatLon($item.data('location'))
          , itemDsp = calculateDisplacement(geo, itemGeo)
        ;

        $item.data('geo', itemGeo);
        $item.data('distance', itemDsp.distance);
        // find "route" link and replace by displacement tostring
        $(".vd-location",$item).append(" <span>(" + itemDsp.label + ")</span>");

        // build up facet-counts and lists...
    });


});
})(jQuery);
