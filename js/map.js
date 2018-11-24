/*
 * IE8 doesn't have the Array.includes() function, so add one manually
 * source: https://stackoverflow.com/a/31221374
 *
if (!Array.prototype.includes) {
    Array.prototype.includes = function(search, start) {
        'use strict';
        if (typeof start !== 'number') {
            start = 0;
        }

        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}
*/

/*
 * https://stackoverflow.com/a/2901298
 */

/**************    Local Variables    ******************/

const UI_MAP_URL = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";

/*******************************************************/

/**************   Async data pulling  ******************/
// let cucu
// function pullDataAsync(url, callerFunction) {
//     $.ajax({
//         type: "GET",
//         url: url.toString(),
//         dataType: "JSON",
//         error: (err) => {
//             console.log(err.responseText);
//
//         },
//         success: (data) => {
//             //console.log(`Error: ${e.status}: ${e.statusText}`);
//             //console.log(e);
//             console.log(data);
//             cucu = JSON.parse(data);
//         }
//     });
// }

/*******************************************************/
/*****************  URL data source obj  ***************/

//TODO: make sure you really need <this>
const dataUrl = {
    "destitution_url": "./data/destitution.json",
    "destitution_mig_url": "",
    "IMD_url": "../data/imdconfig.json"
}

/*******************************************************/

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/*
 * Set up UI elements
 */
$('.division-select ').select2({
    data: divisionsOptions,
    placeholder: "Select services/divisions...",
    //allowClear: true,
    width: "style"
});

$("#staff_level").slider({
    min: 1,
    max: 9,
    step: 1,
    value: 1,
    range: true,
    tooltip: "show",
    ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    ticks_labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
});

$("#radius").slider({
    min: 5000,
    max: 100000,
    step: 5000,
    value: 25000,
    tooltip: "show"
});

$("#opacityVols").slider({
    min: 0,
    max: 1,
    step: 0.05,
    value: 0.3,
    tooltip: "show"
});

$("#opacityStaff").slider({
    min: 0,
    max: 1,
    step: 0.05,
    value: 0.3,
    tooltip: "show"
});

var filterDivision = [];  // array to hold which services/divisions the user has selected

// initialise checked list box of services
// source: https://bootsnipp.com/snippets/featured/checked-list-group
$('.list-group.checked-list-box .list-group-item-check').each(function () {

    // Settings
    var $widget = $(this),
        $checkbox = $('<input type="checkbox" class="hidden" style="display: none" />'),
        //color = ($widget.data('color') ? $widget.data('color') : "success"),
        color = "success",
        style = ($widget.data('style') === "button" ? "btn-" : "list-group-item-"),
        settings = {
            on: {
                icon: 'fas fa-check-circle'
            },
            off: {
                icon: 'far fa-circle'
            }
        };

    $widget.css('cursor', 'pointer')
    $widget.append($checkbox);

    // Event Handlers
    $widget.on('click', function () {
        $checkbox.prop('checked', !$checkbox.is(':checked'));
        $checkbox.triggerHandler('change');
        updateDisplay();
    });
    $checkbox.on('change', function () {
        updateDisplay();
    });


    // Actions
    function updateDisplay() {
        var isChecked = $checkbox.is(':checked');

        // Set the button's state
        $widget.data('state', (isChecked) ? "on" : "off");

        // Set the button's icon
        $widget.find('.state-icon')
            .removeClass()
            .addClass('state-icon ' + settings[$widget.data('state')].icon);

        // Update the button's color
        if (isChecked) {
            $widget.addClass(style + color + ' selected');  // + ' active');
        } else {
            $widget.removeClass(style + color + ' selected');  // + ' active');
        }
    }

    // Initialization
    function init() {

        if ($widget.data('checked') === true) {
            $checkbox.prop('checked', !$checkbox.is(':checked'));
        }

        updateDisplay();

        // Inject the icon if applicable
        if ($widget.find('.state-icon').length === 0) {
            $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span>');
        }
    }
    init();
});

$("#check-list-box").on("click", function (e) {
    e.preventDefault();
    filterDivision = [];
    var counter = 0;
    $("#check-list-box li.selected").each(function (idx, li) {
        filterDivision[counter] = $(li).text();
        counter++;
    });
    //console.log("Currently selected:", filterDivision);

    // update heatmaps
    addVolsHeatmap();
    addStaffHeatmap();
    addServices();
})

/*
 * Create the base map
 */
var map = L.map("map", {
    maxZoom: 10,
    minZoom: 5,
    zoomSnap: 0.25,
    zoomControl: false,
    zoomAnimation: false
});

/* var gl = L.mapboxGL({
    accessToken: "pk.eyJ1IjoiYnJjbWFwcyIsImEiOiJRZklIbXY0In0.SeDBAb72saeEJhTVDrVusg",
    style: "mapbox://styles/mapbox/bright-v8"
}).addTo(map);
 */

// "cjo9yl6qa0tvs2sn0tsw462i1"
// "mapbox://styles/brcmaps/cjo9zbafk0ufs2snv0ogclf7b"

// "https://api.mapbox.com/styles/v1/brcmaps.8j731yn3/cjo9zbafk0ufs2snv0ogclf7b/wmts?access_token=pk.eyJ1IjoiYnJjbWFwcyIsImEiOiJRZklIbXY0In0.SeDBAb72saeEJhTVDrVusg"

// L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
//     attribution: '',
//     maxZoom: 10,
//     minZoom: 5,
//     id: 'brcmaps.8j731yn3',
//     accessToken: 'pk.eyJ1IjoiYnJjbWFwcyIsImEiOiJRZklIbXY0In0.SeDBAb72saeEJhTVDrVusg'
// }).addTo(map);

// lonelylayer = new L.TileLayer.WMS(
//     "https://api.mapbox.com/styles/v1/brcmaps.8j731yn3/cjo9zbafk0ufs2snv0ogclf7b/wmts?access_token=pk.eyJ1IjoiYnJjbWFwcyIsImEiOiJRZklIbXY0In0.SeDBAb72saeEJhTVDrVusg",
// ).addTo(map);

//gl._glMap.addSource({...})

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

var sidebar = L.control.sidebar('sidebar').addTo(map);

// create a map pane for external data layers and set their z-index low so they appear under the heatmaps
map.createPane("external");
map.getPane("external").style.zIndex = 200;

/*
 * Volunteers heatmap
 */
var filterVolsBasis = document.getElementById("vol_options").value;  // for storing which volunteers to show
var filterVolsType = document.getElementById("show_vols").value;  // for storing whether to show vols heatmap

// var filterDivision = $("#division").val();  // for storing which services/divisions to filter by

// preload heatmap gradient image to stop the "WebGL warning: drawArrays: This operation requires zeroing texture data. This is slow." warnings
var textureGreen = new Image();
textureGreen.src = "js/webgl-heatmap/green.png";

var volsHeatmap = L.webGLHeatmap({
    size: 25000,
    opacity: 0.7,
    gradientTexture: textureGreen
});

map.addLayer(volsHeatmap);

function addVolsHeatmap() {
    if (map.hasLayer(volsHeatmap)) {
        map.removeLayer(volsHeatmap);
    }

    if (filterVolsType === "None") {
        return;
    }

    var volsFiltered = vols;

    // show volunteer roles or individual people?
    if (filterVolsType === "People") {
        volsFiltered = _.uniqBy(volsFiltered, function (e) { return e.id; });  // keep only unique people IDs
    }

    // filter volunteers by basis
    if (filterVolsBasis !== "All") {
        //volsFiltered = volsFiltered.filter(v => v.Basis === filterVolsBasis);
        volsFiltered = _.filter(volsFiltered, function (v) { return v.Basis === filterVolsBasis })
    }

    // filter volunteers by service/division
    if (filterDivision != null && filterDivision.length > 0) {
        //volsFiltered = volsFiltered.filter(v => filterDivision.includes(v.Division));
        volsFiltered = _.filter(volsFiltered, function (v) { return filterDivision.includes(v.Division) })
    }

    // FEATURES NOT IMPLEMENTED:
    // 1. not enough info to see whether volunteers are based at UKO/SSC/RCT
    // 2. volunteers don't have levels, so ignore that too

    // extract only latitude/longitude from vols array
    var vols_coords = _.map(volsFiltered, function (v) { return _.pick(v, "Latitude", "Longitude"); });
    var vols_coords_arr = vols_coords.map(Object.values);  // convert to array of arrays rather than array of objects
    //var vols_coords_arr = Object.keys(vols_coords).map(function(i) { return vols_coords[i] });

    // update radius
    /*volsHeatmap = L.webGLHeatmap({
        size: 25000,
        opacity: 0.7,
        gradientTexture: "js/webgl-heatmap/green.png"
    });*/

    volsHeatmap.options.size = $("#radius").slider("getValue");
    volsHeatmap.options.opacity = 1 - $("#opacityVols").slider("getValue");

    volsHeatmap.setData(vols_coords_arr);
    map.addLayer(volsHeatmap);
    //volsHeatmap.resize();
}

/*
 * Staff heatmap
 */
var filterStaff = document.getElementById("show_staff").value;  // for storing which staff to show
// var filterStaffLevelsMin = document.getElementById("staff_level_min").value;  // for storing which staff levels to show
// var filterStaffLevelsMax = document.getElementById("staff_level_max").value;  // for storing which staff levels to show
var filterStaffLevels = $("#staff_level").slider("getValue");

// preload heatmap gradient image to stop the "WebGL warning: drawArrays: This operation requires zeroing texture data. This is slow." warnings
var textureBlue = new Image();
textureBlue.src = "js/webgl-heatmap/deep-sea-gradient.png";

var staffHeatmap = L.webGLHeatmap({
    size: 25000,
    opacity: 0.7,
    gradientTexture: textureBlue
});

function addStaffHeatmap() {
    if (map.hasLayer(staffHeatmap)) {
        map.removeLayer(staffHeatmap);
    }

    if (filterStaff === "none") {
        return;
    }

    var staffFiltered = staff;

    // show staff between particular levels
    if ($('input[name=show_staff]:checked').val() === "levels") {
        var staffLevels = $("#staff_level").slider("getValue");

        //staffFiltered = staffFiltered.filter(s => s.Level >= staffLevels[0] & s.Level <= staffLevels[1]);

        staffFiltered = staffFiltered.filter(function (s) {
            return s.Level >= staffLevels[0] & s.Level <= staffLevels[1];
        });
    }

    // filter volunteers by service/division
    if (filterDivision != null && filterDivision.length > 0) {
        //staffFiltered = staffFiltered.filter(s => filterDivision.includes(s.Division));
        staffFiltered = _.filter(staffFiltered, function (s) { return filterDivision.includes(s.Division) });
    }

    // filter staff based in UKO
    if (!$("#show_uko").prop("checked")) {
        staffFiltered = _.filter(staffFiltered, function (s) { return s.UKO == 0 });
    }

    // filter staff based in SSC
    if (!$("#show_ssc").prop("checked")) {
        staffFiltered = _.filter(staffFiltered, function (s) { return s.SSC == 0 });
    }

    // filter staff based in RCT
    if (!$("#show_rct").prop("checked")) {
        staffFiltered = _.filter(staffFiltered, function (s) { return s.RCT == 0 });
    }

    // extract only latitude/longitude from vols array
    var staff_coords = _.map(staffFiltered, function (v) { return _.pick(v, "Latitude", "Longitude"); });
    var staff_coords_arr = staff_coords.map(Object.values);  // convert to array of arrays rather than array of objects
    //var staff_coords_arr = Object.keys(staff_coords).map(function(i) { return staff_coords[i] });

    // change radius
    staffHeatmap.options.size = $("#radius").slider("getValue");
    staffHeatmap.options.opacity = 1 - $("#opacityStaff").slider("getValue");

    staffHeatmap.setData(staff_coords_arr);
    map.addLayer(staffHeatmap);
    //staffHeatmap.resize();
}

/*
 * Services
 */
var iconService = L.divIcon({
    //html: "<i class='fa fa-plus' style='color: red'></i>",
    html: '<i class="fa fa-plus" style="color: #D0021B"></i>',
    iconSize: [20, 20],
    className: 'awesomeIcon'
});

var servicesLayer;  // stores all markers for services

// create popups HTML text for each service
function initServices() {
    /*
     * popup for services from old website
    services = services.map(function(s) {
       s.popup = "<b>" + s.Service + "</b><br/><br/>" +
           "<b>Service:</b> " + s.ServiceType + "<br/>" +
           "<b>UK area:</b> " + s.Area + "<br/>" +
           "<b>Counties:</b> " + s.Counties + "<br/><br/>" +
           "<b>Postcode:</b> " + s.Postcode + "<br/>" +
           "<b>Phone number:</b> " + s.Phone + "<br/><br/>" +
           "<a href='" + s.URL + "'>View on BRC website</a>";
        return s;
    });*/

    // popup for services from new website
    services = services.map(function (s) {
        s.popup = "<b>" + s.ServiceName + "</b><br/><br/>" +
            "<b>Services:</b><ul>" + s.Services + "</ul>" +
            "<b>Address:</b> " + s.Address + "<br/><br/>" +
            "<b>Phone number:</b> " + s.Telephone;
        return s;
    });
}

function addServices() {
    if (map.hasLayer(servicesLayer)) {
        map.removeLayer(servicesLayer);
    }

    if (!$("#show_servs").prop("checked")) {
        return;
    }

    var servicesFiltered = services;

    // filter services/divisions
    if (filterDivision != null && filterDivision.length > 0) {
        //staffFiltered = staffFiltered.filter(s => filterDivision.includes(s.Division));
        servicesFiltered = _.filter(servicesFiltered, function (s) { return filterDivision.includes(s.ServiceType) });
    }

    // extract only latitude/longitude from vols array
    var svc_coords = _.map(servicesFiltered, function (v) { return _.pick(v, "Latitude", "Longitude", "popup"); });
    var svc_coords_arr = svc_coords.map(Object.values);  // convert to array of arrays rather than array of objects

    // add to map
    var markers = new Array(svc_coords_arr.length);

    for (var i = 0; i < svc_coords_arr.length; i++) {
        markers[i] = new L.marker([svc_coords_arr[i][0], svc_coords_arr[i][1]], { icon: iconService })
            .bindPopup(svc_coords_arr[i][2]);
    }

    // add layer to map
    servicesLayer = L.layerGroup(markers);
    servicesLayer.addTo(map);
}

/*
 * Properties
 */
var iconProperty = L.divIcon({
    html: '<i class="fa fa-building" style="color: #D0021B"></i>',
    iconSize: [20, 20],
    className: 'awesomeIcon'
});

var propertiesLayer;  // stores all markers for properties

// create popups HTML text for each service
function initProperties() {
    props = props.map(function (s) {
        s.popup = "<b>" + s.Description + "</b><br/><br/>" +
            "<b>UPC:</b> " + s.UPC + "<br/>" +
            "<b>Type:</b> " + s.Type + "<br/><br/>" +
            "<b>Address:</b> " + s.Address;

        return s;
    });
}

function addProperties() {
    if (map.hasLayer(propertiesLayer)) {
        map.removeLayer(propertiesLayer);
    }

    if (!$("#show_props").prop("checked")) {
        return;
    }

    var propsFiltered = props;

    // filter services/divisions
    if (filterDivision != null && filterDivision.length > 0) {
        propsFiltered = _.filter(propsFiltered, function (s) { return filterDivision.includes(s.Division) });
    }

    // extract only latitude/longitude from vols array
    var prop_coords = _.map(propsFiltered, function (v) { return _.pick(v, "Latitude", "Longitude", "popup"); });
    var prop_coords_arr = prop_coords.map(Object.values);  // convert to array of arrays rather than array of objects

    // add to map
    var markers = new Array(prop_coords_arr.length);

    for (var i = 0; i < prop_coords_arr.length; i++) {
        markers[i] = new L.marker([prop_coords_arr[i][0], prop_coords_arr[i][1]], { icon: iconProperty })
            .bindPopup(prop_coords_arr[i][2]);
    }

    // add layer to map
    propertiesLayer = L.layerGroup(markers);
    propertiesLayer.addTo(map);
}

/*
 * Shops
 */
var iconShop = L.divIcon({
    html: '<i class="fa fa-shopping-basket" style="color: #D0021B"></i>',
    iconSize: [20, 20],
    className: 'awesomeIcon'
});

var shopsLayer;  // stores all markers for properties

// create popups HTML text for each service
function initShops() {
    shops = shops.map(function (s) {
        s.popup = "<b>" + s.Description + "</b><br/><br/>" +
            "<b>UPC:</b> " + s.UPC + "<br/>" +
            "<b>Type:</b> " + s.Type + "<br/><br/>" +
            "<b>Address:</b> " + s.Address;

        return s;
    });
}

function addShops() {
    if (map.hasLayer(shopsLayer)) {
        map.removeLayer(shopsLayer);
    }

    if (!$("#show_shops").prop("checked")) {
        return;
    }

    var shopsFiltered = shops;

    // filter services/divisions
    // if (filterDivision != null && filterDivision.length > 0) {
    //     shopsFiltered = _.filter(shopsFiltered, function(s) { return filterDivision.includes(s.Division) });
    // }

    // extract only latitude/longitude from vols array
    var shop_coords = _.map(shopsFiltered, function (v) { return _.pick(v, "Latitude", "Longitude", "popup"); });
    var shop_coords_arr = shop_coords.map(Object.values);  // convert to array of arrays rather than array of objects

    // add to map
    var markers = new Array(shop_coords_arr.length);

    for (var i = 0; i < shop_coords_arr.length; i++) {
        markers[i] = new L.marker([shop_coords_arr[i][0], shop_coords_arr[i][1]], { icon: iconShop })
            .bindPopup(shop_coords_arr[i][2]);
    }

    // add layer to map
    shopsLayer = L.layerGroup(markers);
    shopsLayer.addTo(map);
}

/*
 * Destitution layer
 */
// colours for destitution
function getDestitutionColour(d) {
    return d == 1 ? "#F7FBFF" :
        d == 2 ? "#E1EDF8" :
            d == 3 ? "#CBDFF1" :
                d == 4 ? "#ACD0E6" :
                    d == 5 ? "#83BADB" :
                        d == 6 ? "#5AA1CF" :
                            d == 7 ? "#3987C0" :
                                d == 8 ? "#1D6AAF" :
                                    d == 9 ? "#084D96" :
                                        "#08306B"
}

// style for destitution polygons
function destitutionStyle(feature) {
    return {
        fillColor: getDestitutionColour(feature.properties.destitute),
        weight: 2,
        opacity: 1,
        color: "white",
        fillOpacity: 0.7
    };
}

function destitutionMigrantStyle(feature) {
    return {
        fillColor: getDestitutionColour(feature.properties.migrant),
        weight: 2,
        opacity: 1,
        color: "white",
        fillOpacity: 0.7
    };
}



// var destitutionMigrantLayer = L.geoJSON(cucu, {
//     style: destitutionMigrantStyle,
//     pane: "external"
// });

// legend for destitution
//TODO: use legend creation for a loader
var destitutionLegend = L.control({ position: "topright" });

destitutionLegend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        labels = [];

    div.innerHTML = "<h4>Destitution index</h4>" +
        "Destitution within local authorities,<br/>" +
        "from the <a href='https://www.jrf.org.uk/report/destitution-uk-2018' target='_blank'>Destitution in the UK 2018 report</a>.<br/><br/>" +
        "1 = lowest; 10 = highest destitution<br/>";

    // loop through our destitution intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getDestitutionColour(grades[i] + 1) + '"></i> ' +
            grades[i] + '<br>';
    }

    return div;
};

// add the legend but hide it to begin with
destitutionLegend.addTo(map);
$('.legend').hide();

// functions to show and hide the destitution layer (including the legend)
function addDestitutionLayer(destitutionLayer) {
    destitutionLayer.layer_name = "destituation";
    destitutionLayer.addTo(map);
    $('.legend').show();
}

function hideDestitutionLayer() {
    if (map.hasLayer(destitutionLayer)) { map.removeLayer(destitutionLayer); };
    $('.legend').hide();
}

function addDestitutionMigrantsLayer() {
    destitutionMigrantLayer.addTo(map);
    $('.legend').show();
}

function hideDestitutionMigrantsLayer() {
    if (map.hasLayer(destitutionMigrantLayer)) { map.removeLayer(destitutionMigrantLayer); };
    $('.legend').hide();
}

/*
 * Community Connectors
 */
function commconnectStyle(feature) {
    return {
        fillColor: "#41B6E6",
        weight: 2,
        opacity: 1,
        color: "white",
        fillOpacity: 0.7
    };
}

var commconnectLayer = L.geoJSON(cc, {
    style: commconnectStyle,
    pane: "external"
});

// functions to show and hide the commconnect layer (including the legend)
function addcommconnectLayer() {
    if (map.hasLayer(commconnectLayer)) {
        map.removeLayer(commconnectLayer);
    }

    if (!$("#show_cc").prop("checked")) {
        return;
    }

    commconnectLayer.addTo(map);
}

/*
 * Loneliness in England
 *
var lonelinessLayer = L.vectorGrid.slicer(loneliness, {
    //rendererFactory: L.svg.tile,
    vectorTileLayerStyles: {
        sliced: function(properties, zoom) {
            var p = properties.loneliness;
            return {
                fillColor: p === 1 ? '#E1EDF8' :
                           p === 2 ? '#ACD0E6' :
                           p === 3 ? '#5AA1CF' :
                           p === 4 ? '#1D6AAF' : '#08306B',
                fillOpacity: 0.7,
                stroke: true,
                fill: true,
                color: 'white',
                //opacity: 0.2,
                weight: 0,
            }
        }
    },
    interactive: false,
    getFeatureId: function(f) {
        return f.properties.id;
    }
});

lonelinessLayer.addTo(map);
*/

/*
 * Function to hide all external map layers from the map
 */
function hideExternalLayers() {
    map.eachLayer((layer) => {
        if(layer._url != UI_MAP_URL) {
            if(layer.layer_name != "destituation") {
                $('.legend').hide();
            }
            map.removeLayer(layer);
            console.log(layer);
        }
    });
}

/*
 * Event listeners for form elements
 */
// listener for the volunteer filter dropdown (all, regular, occasional, skills gap)
$('#vol_options').change(function () {
    //filterVolsBasis = $('input[name=vol_options]:checked').val();
    filterVolsBasis = $(this).val();
    // console.log("Filter changed to ", filterVolsBasis);

    addVolsHeatmap();
    addStaffHeatmap();
});

// listener for whether to show volunteer roles or people (or hide the heatmap)
$('input[name=show_vols]').change(function () {
    filterVolsType = $('input[name=show_vols]:checked').val();
    // console.log("Filter changed to ", filterVolsType);

    addVolsHeatmap();
    addStaffHeatmap();
});

// listener for services/division select box
/*$("#division").change(function() {
    filterDivision = $(this).val();
    //console.log("Filter changed to ", filterDivision);
    addVolsHeatmap();
    addStaffHeatmap();
    addServices();
});*/

// listener for whether to show staff or hide the heatmap
//$("#show_staff").on("input", function() {
$('input[name=show_staff]').change(function () {
    filterStaff = $('input[name=show_staff]:checked').val();
    //console.log("Filter changed to ", filterStaff);
    addStaffHeatmap();
});

$("#staff_level").change(function () {
    console.log("Slider values: ", $("#staff_level").slider("getValue"));
    addStaffHeatmap();
})

$("#show_uko").change(function () {
    addStaffHeatmap();
});

$("#show_ssc").change(function () {
    addStaffHeatmap();
});

$("#show_rct").change(function () {
    addStaffHeatmap();
});

$("#show_servs").change(function () {
    addServices();
});

$("#show_props").change(function () {
    addProperties();
});

$("#show_shops").change(function () {
    addShops();
});

$("#show_cc").change(function () {
    addcommconnectLayer();
});

// when user clicks on the 'people' tab, relayout the slider (otherwise marker text doesn't get displayed properly)
$("#tabpeople").on("click", function () {
    $("#staff_level").slider("relayout");
});

// update the radius slider text when the user drags it...
$("#radius").on("slide", function (r) {
    $("#radiusVal").text(r.value / 1000);
});

//... but only update the heatmaps when they have finished sliding the slider
$("#radius").on("change", function (r) {
    $("#radiusVal").text(r.value / 1000);

    addVolsHeatmap();
    addStaffHeatmap();
});

// update the volunteer heatmap opacity slider text when the user drags it...
$("#opacityVols").on("slide", function (r) {
    $("#opacityVolsVal").text(r.value * 100);
});

//... but only update the heatmaps when they have finished sliding the slider
$("#opacityVols").on("change", function (r) {
    $("#opacityVolsVal").text(r.value * 100);

    addVolsHeatmap();
});

// update the opacity slider text when the user drags it...
$("#opacityStaff").on("slide", function (r) {
    $("#opacityStaffVal").text(r.value * 100);
});

//... but only update the heatmaps when they have finished sliding the slider
$("#opacityStaff").on("change", function (r) {
    $("#opacityStaffVal").text(r.value * 100);

    addStaffHeatmap();
});

// external map layers
//$("#externalradios").on("input", function() {
$('input[name=externalradios]').change(function () {
    var extLayer = $('input[name=externalradios]:checked').val();
    console.log("Filter changed to ", extLayer);

    switch (extLayer) {
        case "none":
            hideExternalLayers();
            break;
        case "destitution":
            hideExternalLayers();

            $.ajax({
                type: "GET",
                url: dataUrl.destitution_url,
                dataType: "JSON",
                error: (err) => {
                    console.log(`Error: ${err}`);
                },
                success: (data) => {
                    // Get the geo-data and dump it into a variable
                    let destitutionLayer = L.geoJSON(data, {
                        style: destitutionStyle,
                        pane: "external"
                    });
                    if ((destitutionLayer != undefined) || (destitutionLayer != null)) {
                        addDestitutionLayer(destitutionLayer);
                    }
                }
            });

            break;
        case "migrants":
            hideExternalLayers();
            //TODO: use same structure as destitution
            addDestitutionMigrantsLayer();
            break;
        case "imd":
            hideExternalLayers();
            //TODO: use same structure as destitution-migrant
            addIMDLayer();
            break;
    }
});

$(document).ready(function () {
    $('[data-toggle="popover"]').popover();
    $("#tabhome").popover('show');
});

$(window).load(function () {
    addVolsHeatmap();
    addStaffHeatmap();

    initServices();
    addServices();

    initProperties();
    addProperties();

    initShops();
    addShops();
});
