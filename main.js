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
            show = feature.properties.population > popMin;
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


    //mymap.removeControl(layersControl);

    for (var [layerName, layerLayer] of allLayers)
    {
        console.log(layerName + " goes removing" );
        if(mymap.hasLayer(layerLayer)){
            console.log("map has layer"+layerName+" removing");
            layersControl.removeLayer(layerLayer);
        }else{
            console.log("not removing unknown layer "+layerName);
        }
    }



    allLayers["Towns"] = new L.geoJson(town, {
        pointToLayer: pointToLayer,
        filter: filterCity(popMin),
        onEachFeature: onEachFeature
    }).addTo(mymap)

    allLayers["Villages"] = new L.geoJson(village, {
        pointToLayer: pointToLayer,
        filter: filterCity(popMin),
        onEachFeature: onEachFeature
    }).addTo(mymap)

    allLayers["Cities"] = new L.geoJson(city, {
        pointToLayer: pointToLayer,
        filter: filterCity(popMin),
        onEachFeature: onEachFeature
    }).addTo(mymap)

    allLayers["Lycees"] = new L.geoJson(lycees, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    }).addTo(mymap)

    allLayers["LyceesG"] = new L.geoJson(LycGen, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    }).addTo(mymap)


    for (var [layerName, layerLayer] of allLayers)
    {
        console.log(layerName + " goes adding " );
        if(! mymap.hasLayer(layerLayer)){
            console.log("map doesent have layer"+layerName+" ...adding");
            layersControl.addOverlay(layerLayer, layerName);
            console.log("added?");
        }else{
            console.log("not adding already known layer"+layerName);
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


var app = angular.module("app", []);


app.controller("myCtrl", function($scope){
    $scope.display=function() {
//        $scope.nameOut = $scope.nameIn;
//        $scope.nameOut = "you";
//        alert($scope.nameIn);
    showLayers($scope.popMin);
    }

});

