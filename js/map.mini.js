var map = L.map("map", {
    maxZoom: 10,
    minZoom: 5,
    zoomSnap: 0.25,
    zoomControl: false,
    zoomAnimation: false
});

L.control.zoom({ position: 'bottomright' }).addTo(map);

map.fitBounds([  // fit to boundary of UK: https://gist.github.com/UsabilityEtc/6d2059bd4f0181a98d76
    [59.478568831926395, -10.8544921875],
    [49.82380908513249, 2.021484375]
]);

var tiles_url = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';  // Open Street Map
//var tiles_url = 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png';  // Open Street Map black and white
//var tiles_url = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';  // CartoDB light  //CartoDB layer names: light_all / dark_all / light_nonames / dark_nonames

L.tileLayer(tiles_url, {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    edgeBufferTiles: 2
}).addTo(map);

map.addSource('zones', {'type': 'vector','url': "mapbox://jamestrimble.dz_scotland_2011_SIMD2016" });

map.addLayer({
    id: 'zone-borders',
    type: 'line',
    source: 'zones',
    'source-layer': "DZ_2011_scotland_with_ranksgeojson",
    paint: {
        'line-color': 'white',
        'line-opacity': {stops: [[7, 0], [9,.1], [11, .5], [14,.7]]}
    }
}, 'place-neighbourhood');

