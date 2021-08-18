//----------------->Map & and Map related Functions<-----------------
//Map Object
var map = L.map('mapdiv'); 
map.setView([51.975, 7.61], 13);

//Basemap Layer
var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}).addTo(map); 

//Feature Group Layers for the Input Features
var locationLayer = L.featureGroup().addTo(map);

//draw Features
var drawControl = new L.Control.Draw({
    draw: {
        //disable all draw functions but the polyline
        polyline: false, 
        polygon: true,
        circle: false,
        circlemarker: false,
        marker: true,
        rectangle: false
    },
    edit: {
        //drawn features will be stored in the polylineLayer
        featureGroup: locationLayer,
        remove: false,
        edit: false
    }
}); 
map.addControl(drawControl); //add the control to the map

var newGeoJSON;

map.on('draw:created', function(e) {
    //add object to map
    locationLayer.addLayer(e.layer); 
    console.log(e.layer);

    //check if input is Array or Object
    if (e.layer._latlngs instanceof Array) {
        var geometry = [];
        console.log(e.layer._latlngs[0].length);
        for(var i = 0; i < e.layer._latlngs[0].length; i++) {
            geometry.push([e.layer._latlngs[0][i].lng, e.layer._latlngs[0][i].lat]);
        }
        geometry.push([e.layer._latlngs[0][0].lng, e.layer._latlngs[0][0].lat]); 
        //console.log(geometry); 
        newGeoJSON = '{' + '"type": "Polygon"' + ',' + '"coordinates":'  + '[' + JSON.stringify(geometry) + ']' + '}';
        //console.log(newGeoJSON);
        document.getElementById("geometry").value = newGeoJSON;
    } 
    else {
        var geometry;
        geometry = [e.layer._latlng.lat, e.layer._latlng.lng];
        //console.log(geometry);
        newGeoJSON = '{' + '"type": "Point"' + ',' + '"coordinates":' +  '[' + geometry[1] + ',' + geometry[0] + ']' + '}';
        //console.log(newGeoJSON);
        document.getElementById("geometry").value = newGeoJSON;
    }
});

//display Features

//store Features