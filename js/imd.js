var idlayer = null;
var thisDomain = 'IMDDEC5';

function hideIMDLayer() {
    if (map.hasLayer(idlayer)) { map.removeLayer(idlayer); };
}

function addIMDLayer( ) {
    if (map.hasLayer(idlayer)) { map.removeLayer(idlayer); };
    idlayer = new L.TileLayer.WMS(
        "http://maps.communities.gov.uk/geoserver/wms",
        {
            layers: 'imd:IDL,admingeo:WD_2014_WGS84,admingeo:LAD_2014_WGS84',
            format: 'image/png',
            transparent: true,
            styles: thisDomain + ',,',
            version:'1.1.0',
            zIndex: 2
        }
    ).addTo(map);
    var mapLegendURL = "http://maps.communities.gov.uk/geoserver/wms" +
        '?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20' +
        '&LAYER=imd:IDL' +
        '&STYLE=' + thisDomain +
        '&TRANSPARENT=true&legend_options=fontName:Times%20New%20Roman;fontAntiAliasing:true;fontColor:0x000033;fontSize:8;dpi:120';

    $('#mapLegend').empty();
    $('<p class="text-highlight">Map legend</p><p style="font-size:11px;">Deciles of deprivation</p><img src="' + mapLegendURL + '"/>').appendTo('#mapLegend');
} // addIMDLayer( )
