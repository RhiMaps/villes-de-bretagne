var mymap = L.map('mapid').setView([47.915,-2.815], 8);
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(mymap);


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
        radius = feature.properties.population/5000;
        switch(feature.properties.place){
            case 'city': 
                color= 'orange';
                break;
            case 'town':
                color= 'blue';
                radius *=2;
                break;
            case 'village':
                color='green';
                radius*=4;
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

var layerNames = ["Cities",
    "Villages",
    "Towns",
    "Lycees",
    "LyceesG"];

var allLayers = new Map();
for( var i=0; i<layerNames.length; i++)
{
    allLayers.set(layerNames[i], new L.geoJson());
}

var overlayMaps={};
var baseMaps={};

var layersControl = L.control.layers(baseMaps, overlayMaps).addTo(mymap);


function showLayers(popMin){

    console.log(popMin);


    for (var [layerName, layerData] of allLayers)
    {
        if(mymap.hasLayer(layerData)){
            mymap.removeLayer(layerData);
            layersControl.removeLayer(layerData);
        }
    }



    allLayers.set("Towns",  new L.geoJson(town, {
        pointToLayer: pointToLayer,
        filter: filterCity(popMin),
        onEachFeature: onEachFeature
    }));

    allLayers.set("Villages",  new L.geoJson(village, {
        pointToLayer: pointToLayer,
        filter: filterCity(popMin),
        onEachFeature: onEachFeature
    }));

    allLayers.set("Cities",  new L.geoJson(city, {
        pointToLayer: pointToLayer,
        filter: filterCity(popMin),
        onEachFeature: onEachFeature
    }));

    allLayers.set("Lycees",  new L.geoJson(lycees, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    }));

    allLayers.set("LyceesG",  new L.geoJson(LycGen, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    }));


    for (var [layerName, layerData] of allLayers)
    {
        if(! mymap.hasLayer(layerData)){
            mymap.addLayer(layerData);
            layersControl.addOverlay(layerData, layerName);
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


showLayers(10000);


$( "#populationBtn" ).click(function() {
    var pop = $("#populationInput").val();
    showLayers(pop);
});
