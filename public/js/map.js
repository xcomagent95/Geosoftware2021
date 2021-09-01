"use strict"
var locations;
var tours;
var positions;

var map = L.map('mapdiv'); 
var locationsLayer = L.featureGroup().addTo(map);
var toursLayer = L.featureGroup().addTo(map);
function getAllfromDB() { 
    {$.ajax({ //handle request via ajax
        url: "/search/getCollections", //request url is the prebuilt request
        method: "GET", //method is GET since we want to get data not post or update it
        })
        .done(function(res) { //if the request is done -> successful
            locations = res[0];
            tours = res[1];
            positions = [];
            fillTables();
            populateMap()
        })
        .fail(function(xhr, status, errorThrown) { //if the request fails (for some reason)
            console.log("Request has failed :(", '/n', "Status: " + status, '/n', "Error: " + errorThrown); //we log a message on the console
            return;
        })
        .always(function(xhr, status) { //if the request is "closed", either successful or not 
            console.log("Request completed"); //a short message is logged
            return; 
        })
    }
}  
getAllfromDB();
var featureLayer;

/**
 * @function {fillTable} - 
 * @param {} data - 
 * @param {Srtring} table - Gets the id of a table
 * @param {} field - 
 */
function fillTables() {
    var locationsTable = document.getElementById('locationsTableBody');
    var toursTable = document.getElementById('toursTableBody');
    var locationsTableData = []; //initialise tabledata as array
    var toursTableData = []; //initialise tabledata as array
    for(var i = 0; i < locations.length; i++) { //iterate over the paths
        locationsTableData.push([locations[i].locationID, locations[i].GeoJson.features[0].properties.url]); //push aggregated paths into table data array
    }
    for(var i = 0; i < tours.length; i++) { //iterate over the paths
        toursTableData.push(tours[i].tourID); //push aggregated paths into table data array
    }

    //fill the table with the paths
    for(var i = 0; i < locationsTableData.length; i++) { //iterate over table data
        //initialise table row as variable
        var row =  `<tr>
                        <td>${locationsTableData[i][0]}</td>
                        <td><a href="${locationsTableData[i][1]}">Link</a></td>
                        <td><button onclick="zoomToFeature('${locationsTableData[i][0]}')">Zoom to Feature</button><td>
                    </tr>`
        locationsTable.innerHTML += row; //pass row to given table
    }
    //fill the table with the paths
    for(var i = 0; i < toursTableData.length; i++) { //iterate over table data
        //initialise table row as variable
        var row =  `<tr>
                        <td>${toursTableData[i]}</td>
                        <td><button onclick="zoomToTour('${toursTableData[i]}')">Zoom to Tour</button><td>
                    </tr>`
        toursTable.innerHTML += row; //pass row to given table
    }
}

//----------------->Map & and Map related Functions<-----------------
function populateMap() {
    //Map Object
    map.setView([51.975, 7.61], 13);

    //Basemap Layer
    var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}).addTo(map); 
    

    for(var i = 0; i < locations.length; i++) {
        var location = L.geoJson(locations[i].GeoJson);
        var position;
        if(locations[i].GeoJson.features[0].geometry.type == "Polygon") {
            var polygon = [];
            var coordinates = [];
            for(var j = 0; j < locations[i].GeoJson.features[0].geometry.coordinates[0].length; j++) {
                coordinates.push([
                    locations[i].GeoJson.features[0].geometry.coordinates[0][j][0],
                    locations[i].GeoJson.features[0].geometry.coordinates[0][j][1] 
                ]);
            }
            polygon.push(coordinates);
            position = turf.centroid(turf.polygon(polygon)).geometry.coordinates;
        }
        else {
            position = locations[i].GeoJson.features[0].geometry.coordinates;
        }
        positions.push({
            leafletObject: location,
            name: locations[i].locationID,
            coords: locations[i].GeoJson.features[0].geometry.coordinates
        });
        console.log(position);
        location.addTo(locationsLayer);
        location.bindPopup(
            '<b>' + "Name: " + '</b>' + locations[i].locationID + 
            '<br><br>' + '<b>' + "URL: " + '</b>' + locations[i].GeoJson.features[0].properties.url + 
            '<br><br>' + '<b>' + "Beschreibung: " + '</b>' + locations[i].GeoJson.features[0].properties.description +
            '<br><br>' + '<b>' + "Koordinaten: " + '</b>' + position + 
            // '<button onclick="getNearestBusstopp(' + position + ')">Nächste Bushaltestelle</button>'
            '<button onclick="getNearestBusstopp(' + i + ')">Nächste Bushaltestelle</button>'
        );
    }

    //Layer Control
    var baseLayer = {
        "Open Street Map": osm,
    };
    
    featureLayer = {
        "Sehenwürdigkeiten": locationsLayer,
        "Touren": toursLayer
    };

    L.control.layers(baseLayer, featureLayer).addTo(map);
}

var currentMarker;

function zoomToFeature(name) {
    map.removeLayer(toursLayer);
    map.addLayer(locationsLayer);
    for(var i = 0; i < positions.length; i++) {
        if(positions[i].name == name) {
            map.fitBounds(positions[i].leafletObject.getBounds());
            positions[i].leafletObject.openPopup();
            currentMarker = positions[i];
        }
    }
}

function zoomToTour(name) {
    toursLayer.clearLayers()
    map.removeLayer(locationsLayer);
    map.addLayer(toursLayer);
    var tour;
    for(var l = 0; l < tours.length; l++) {
        if(name == tours[l].tourID) {
            tour = tours[l];
        }
    }
    var locationsInTour = [];
    for(var i = 0; i < tour.locations.length; i++) {
        for(var j = 0; j < locations.length; j ++) {
            if(locations[j].locationID == tour.locations[i]) {
                locationsInTour.push(locations[j]);
            }
        }
    }
    map.removeLayer(locationsLayer);
    for(var k = 0; k < locationsInTour.length; k++) {
        var location = L.geoJson(locationsInTour[k].GeoJson)
        var position;
        if(locations[i].GeoJson.features[0].geometry.type == "Polygon") {
            var polygon = [];
            var coordinates = [];
            for(var j = 0; j < locations[i].GeoJson.features[0].geometry.coordinates[0].length; j++) {
                coordinates.push([
                    locations[i].GeoJson.features[0].geometry.coordinates[0][j][0],
                    locations[i].GeoJson.features[0].geometry.coordinates[0][j][1] 
                ]);
            }
            polygon.push(coordinates);
            position = turf.centroid(turf.polygon(polygon)).geometry.coordinates;
        }
        else {
            position = locations[i].GeoJson.features[0].geometry.coordinates;
        }
        location.bindPopup(
            '<b>' + "Name: " + '</b>' + locations[i].locationID + 
            '<br><br>' + '<b>' + "URL: " + '</b>' + locations[i].GeoJson.features[0].properties.url + 
            '<br><br>' + '<b>' +  "Description: " + '</b>' + locations[i].GeoJson.features[0].properties.description +
            '<button onclick="getNearestBusstopp(' + position + ')">Nächste Bushaltestelle</button>'
        );
        location.addTo(toursLayer);
    }
    map.fitBounds(toursLayer.getBounds());
}

// --------------- API Bushaltestellen --------------- 

// distance calculation: 
// This constant is the mean earth radius
const R = 6371 

/**
*@function deg2rad - Function to convert degree to radian
*@param {double} degree
*@returns {double} radian
*/
function deg2rad(deg) 
{
    return deg * (Math.PI/180)
}

/**
*@function rad2deg - Function to convert from radian to degree
*@param {double} radian
*@returns {double} degree 
*/
function rad2deg(rad)
{
    return rad * (180/Math.PI)
}

/**
* @function calculateDistance - Function to calculat the distance between two coordinates
* @param {double} coord1 - is the first coordinate [lat, lon]
* @param {double} coord2 - is the second coordinate [lat, lon]
* @returns {double} dist - returns the distance in km 
*/
function calculateDistance(coord1, coord2) // works
{
    var lat1 = deg2rad(coord1[0])
    var lon1 = deg2rad(coord1[1])
    var lat2 = deg2rad(coord2[0])
    var lon2 = deg2rad(coord2[1])
 
    var dLat = lat2-lat1
    var dLon = lon2-lon1
    var a = Math.sin(dLon/2) * Math.sin(dLon/2) +
            Math.cos(lon1) * Math.cos(lon2) * 
            Math.sin(dLat/2) * Math.sin(dLat/2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    var dist = R * c // Distance in km
    return dist
}

/**
 * This function switches lon lat in a pair of coordinates
 * @param {[double,double]} coords - Gets coordinates (usually in format lon|lat)
 */
function switchCoords(coords){
    var temp = coords[0];
    coords[0] = coords[1];
    coords[1] = temp;
}

// ---- Needed for whether request -------
// The API gets stored in this variable.
var api;

/**
 * @function {initializeAPI} - This funtion builds up the whole api to use it afterwards.
 * @param {String} key - This key is user-dependent and has to be entered by the user himself.
 * @param {[double, double]} coordinates - These are the requested coordinates. Either the
 * browser location or the standard coordinates (GEO1).
 */
function iniatializeAPI(key, coordinates){
    api = "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat="
    api += coordinates[1]+"&lon="+coordinates[0]+"&exclude="+"hourly"+"&appid="+key
}

//variable to store the API-Key
var clientAPIKey
/**
* @function {} - reads the API-Key from Input-Field
* and the geolocatization is not possible.
*/
function getAPIKey(){
    clientAPIKey = document.getElementById("apiField").value //retrieve API-Key
}
// ------------------------------------------

// Bus Api
var busAPI = "https://rest.busradar.conterra.de/prod/haltestellen";
var stopps = [];
var nearestStopp;

/**
 * This function sends a request to the api server and calculates the distances of the current marker to all responded busstopps
 * 
 */
function getAllBusstopps(){
    {$.ajax({
        url: busAPI,
        method: "GET",
        })
        .done(function(res){
            stopps = res;
        })
        .fail(function(xhr, status, errorThrown) {
            console.log("Request has failed :(", '/n', "Status: " + status, '/n', "Error: " + errorThrown); //we log a message on the console
            return;
        })
        .always(function(xhr, status) {
            console.log("Request completed"); //a short message is logged
            return; 
        })
    }
} 

var nearestStoppLayer = L.featureGroup().addTo(map);

getAllBusstopps();
var sortedStopps = [];
var test;
function getNearestBusstopp(markerIndex){ // WARUM IST CURRENT MARKER UNDEFINED???????
    // console.log(markerIndex);
    // maconsole.log(positions[markerIndex]);
    // return markerIndex;
    //console.log(currentMarker[0]+', '+currentMarker[1]);
    for(var i=0; i<stopps.features.length; i++){
        var name = stopps.features[i].properties.lbez;
        var position = stopps.features[i].geometry.coordinates; // [lat, lon]
        var distance = calculateDistance(position, positions[markerIndex].coords);
        //console.log(distance);
        sortedStopps[i] = [name, distance, position];
    }
    sortedStopps.sort(function([a,b,c],[d,e,f]){ return b-e });
    nearestStopp = sortedStopps[0];
    // console.log(nearestStopp);
    switchCoords(nearestStopp[2]);
    var markerNearestStopp = L.marker(nearestStopp[2]).addTo(map);
    markerNearestStopp.bindPopup(nearestStopp[0]).openPopup();
    // positions[markerIndex].
    //var ns = L.marker(nearestStopp[2]);
    //nearestStoppLayer.addLayer(ns);
    //featureLayer.Busstopp = nearestStoppLayer;

}
