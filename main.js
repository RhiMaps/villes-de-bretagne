var mymap = L.map('mapid').setView([47.915,-2.815], 8);

var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

var mapbox = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map Data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets'
});


var baseMaps = {
    "Mapbox": mapbox,
    "OpenStreetMap": osm
};


var overlayMaps={};

var layersControl = L.control.layers(baseMaps, overlayMaps).addTo(mymap);

var city_file = "./city-oc.geojson";
var town_file = "./town-oc.geojson";
var village_file = "./village-oc.geojson";
var lycees_file = "./lycees-oc.geojson";



// Popup for
// - cities with population
// - lycées
function onEachFeature(feature, layer) {
    // does this feature have a property named population?
    if (feature.properties && feature.properties.name
            && feature.properties.population) {
        layer.bindPopup(feature.properties.name+": "+feature.properties.population+" hab.");
    } else if ( feature.properties.amenity ) {
        layer.bindPopup(feature.properties.name);
    } else if ( feature.properties.appellation_officielle_uai ) {
        layer.bindPopup(feature.properties.appellation_officielle_uai);
    }
}

// How to draw the point
// - as a colored circle depending on population
// - or a colored point for lycees
function pointToLayer(feature, latlng) {
	var radius;
    var color;
    var opacity;
	var geojsonMarkerOptions;
    if( feature.properties.place && feature.properties.population)
    {
        radius = feature.properties.population/400;
        radius = Math.log(radius);
        radius = radius*radius;
        switch(feature.properties.place){
            case 'city': 
                color= 'orange';
                break;
            case 'town':
                color= 'blue';
                //radius *=2;
                break;
            case 'village':
                color='green';
                //radius*=4;
                break;
            }
        opacity=0.3;
    } else if ( feature.properties.amenity ) {
        radius = 5;
        color = "red";
        opacity=0.5;
    } else if ( feature.properties.numero_uai ) {
        radius = 3;
        color = "#000";
        opacity=0.8;
    }
    geojsonMarkerOptions = {
        radius: radius,
        fillColor: color,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: opacity
    };
	return L.circleMarker(latlng, geojsonMarkerOptions);
}

// Show city only if population above value
function filterCity(popMin){
    return function(feature, layer){
        var show=false;
        if( feature.properties && feature.properties.population)
        {
            show = parseInt(feature.properties.population) > parseInt(popMin);
        }
        return  show;
    };
}

var allLayers = {
    Cities:{layer: new L.geoJson().addTo(mymap), isAdded: true},
    Towns:{layer: new L.geoJson().addTo(mymap), isAdded: true},
    Villages:{layer: new L.geoJson().addTo(mymap), isAdded: true},
    Lycees:{layer: new L.geoJson().addTo(mymap), isAdded: true},
    LyceesG:{layer: new L.geoJson().addTo(mymap), isAdded: true}
};


function showLayers(popMin){


    // at first remove what has to
    for (var layerName in allLayers)
    {
        layer = allLayers[layerName].layer;

        // record layer state
        allLayers[layerName].isAdded=mymap.hasLayer(layer);

        // remove from map if was added
        if(mymap.hasLayer(layer)){
            mymap.removeLayer(layer);
        }


        // remove from control however
        layersControl.removeLayer(layer);
    }



    allLayers["Towns"].layer=  L.geoJson.ajax(town_file, {
        pointToLayer: pointToLayer,
        filter: filterCity(popMin),
        onEachFeature: onEachFeature
    });

    allLayers["Villages"].layer=  L.geoJson.ajax(village_file, {
        pointToLayer: pointToLayer,
        filter: filterCity(popMin),
        onEachFeature: onEachFeature
    });

    allLayers["Cities"].layer=  L.geoJson.ajax(city_file, {
        pointToLayer: pointToLayer,
        filter: filterCity(popMin),
        onEachFeature: onEachFeature
    });

    allLayers["Lycees"].layer=  L.geoJson.ajax(lycees_file, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    });

//    allLayers["LyceesG"].layer=  new L.geoJson(LycGen, {
//        pointToLayer: pointToLayer,
//        onEachFeature: onEachFeature
//    });


    for (var layerName in allLayers)
    {
        layer = allLayers[layerName].layer;
        // add to control however
        layersControl.addOverlay(layer, layerName);

        // add to map if was added before
        if(allLayers[layerName].isAdded){
            mymap.addLayer(layer);
        }
    }

}

/*
mymap.on('zoomend', function(){
    var zoom  = this.getZoom();
    console.log(zoom);
    cityLayer.eachLayer(function(layer){
        var radius = zoom*layer.feature.properties.population/50000;
        console.log(radius);
        layer.setStyle({radius: radius});
    });
});
*/


showLayers(100);


$( "#populationBtn" ).click(function() {
    var pop = $("#populationInput").val();
    showLayers(pop);
});
