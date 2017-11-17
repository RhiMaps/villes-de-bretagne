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
    "Cities":{layer: new L.geoJson(), isAdded: true},
    "Towns":{layer: new L.geoJson(), isAdded: true},
    "Villages":{layer: new L.geoJson(), isAdded: true},
    "Lycees":{layer: new L.geoJson(), isAdded: true},
    "LyceesG":{layer: new L.geoJson(), isAdded: true}
};


function showLayers(popMin){

    console.log(popMin);

    var wasAdded={};

    for (var layerName in allLayers)
    {
        layerData = allLayers[layerName].layer;

        // record layer state
        wasAdded[layerName]=mymap.hasLayer(layerData);

        // remove from map if added
        if(mymap.hasLayer(layerData)){
            mymap.removeLayer(layerData);
        }


        // remove from control however
        layersControl.removeLayer(layerData);
    }



    allLayers["Towns"].layer=  new L.geoJson(town, {
        pointToLayer: pointToLayer,
        filter: filterCity(popMin),
        onEachFeature: onEachFeature
    });

    allLayers["Villages"].layer=  new L.geoJson(village, {
        pointToLayer: pointToLayer,
        filter: filterCity(popMin),
        onEachFeature: onEachFeature
    });

    allLayers["Cities"].layer=  new L.geoJson(city, {
        pointToLayer: pointToLayer,
        filter: filterCity(popMin),
        onEachFeature: onEachFeature
    });

    allLayers["Lycees"].layer=  new L.geoJson(lycees, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    });

    allLayers["LyceesG"].layer=  new L.geoJson(LycGen, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    });


    for (var layerName in allLayers)
    {
        layerData = allLayers[layerName].layer;
        // add to control however
        layersControl.addOverlay(layerData, layerName);

        // add to map if was added before
        if(wasAdded[layerName]){
            mymap.addLayer(layerData);
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
