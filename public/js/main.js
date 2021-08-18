//----------------->Map<-----------------
//Map Object
var map = L.map('mapdiv'); 
map.setView([51.975, 7.61], 13);

//Basemap Layer
var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}).addTo(map); 

//Locations Layer Group
var locationsLayerGroup = L.featureGroup().addTo(map);

//Feature Group Layers for the Input Features
var locationLayer = L.featureGroup().addTo(map);

//Draw Control
var drawControl = new L.Control.Draw({
    draw: {
        //disable all draw functions but the rectangle
        polyline: false, 
        polygon: true,
        circle: false,
        circlemarker: false,
        marker: true,
        rectangle: false,
    },
    edit: {
        //drawn features will be stored in the locationsLayerGroup
        featureGroup: locationsLayerGroup,
        remove: false,
        edit: false
    }
}); 
map.addControl(drawControl); //add the control to the map

