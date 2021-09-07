"use strict"

var locations;
var tours;
var positions;

//Markers
var locationIcon = L.icon({
    iconUrl: './gfx/museum.png',
    iconSize:     [32, 32], // size of the icon
    iconAnchor:   [15, 32], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -28] // point from which the popup should open relative to the iconAnchor
});

var busstoppIcon = L.icon({
    iconUrl: './gfx/busstop.png',
    iconSize:     [32, 32], // size of the icon
    iconAnchor:   [15, 32], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -28] // point from which the popup should open relative to the iconAnchor
});

var map = L.map('mapdiv'); 
var locationsLayer = L.featureGroup().addTo(map); //layerGroup for the locations
var toursLayer = L.featureGroup().addTo(map); //layerGroup for the tours
function getAllfromDB() { 
    {$.ajax({ //handle request via ajax
        url: "/search/getCollections", //request url is the prebuilt request
        method: "GET", //method is GET since we want to get data not post or update it
        async: false //function does not return immediately 
        })
        .done(function(res) { //if the request is done -> successful
            locations = res[0]; //retrieve locations from response
            tours = res[1]; //retrieve tours from response
            positions = []; //initialize positions
            fillTables(); //fill alles tables
            populateMap(); //populate the map with the locations
            return;
        })
        .fail(function(xhr, status, errorThrown) { //if the request fails (for some reason)
            console.log("Request has failed :(", '/n', "Status: " + status, '/n', "Error: " + errorThrown); //log a message on the console
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
 * @function {fillTables} - 
 */
function fillTables() {
    var locationsTable = document.getElementById('locationsTableBody'); //get the the table containing the locations
    var toursTable = document.getElementById('toursTableBody'); //get the the table containing the tours
    var locationsTableData = []; //initialise tabledata as array
    var toursTableData = []; //initialise tabledata as array
    for(var i = 0; i < locations.length; i++) { //iterate over the paths
        locationsTableData.push([locations[i].locationID, locations[i].GeoJson.features[0].properties.URL]); //push aggregated paths into table data array
    }
    for(var i = 0; i < tours.length; i++) { //iterate over the paths
        toursTableData.push(tours[i].tourID); //push aggregated paths into table data array
    }

    //fill the table with the paths
    for(var i = 0; i < locationsTableData.length; i++) { //iterate over table data
        //initialise table row as variable
        var row =  `<tr scope="row">
                        <td>${locationsTableData[i][0]}</td>
                        <td><a href="${locationsTableData[i][1]}">Link</a></td>
                        <td><button type="button" class="btn btn-secondary" onclick="zoomToFeature('${locationsTableData[i][0]}')">Zoom to Feature</button></td>
                    </tr>`
        locationsTable.innerHTML += row; //pass row into given table
    }

    //fill the table with the paths
    for(var i = 0; i < toursTableData.length; i++) { //iterate over table data
        //get all locations from a tour
        var locationsInTour = "<ul>";
        for(var j = 0; j < tours[i].locations.length; j++){
            locationsInTour += "<li>" + tours[i].locations[j];
        }
        locationsInTour += "</ul>";
        
        //initialise table row as variable
        var row =  `<tr>
                        <td>${toursTableData[i]}</td>
                        <td><button type="button" class="btn btn-secondary" onclick="zoomToTour('${toursTableData[i]}')">Zoom to Tour</button></td>
                        <td>${locationsInTour}</td>
                    </tr>`
        toursTable.innerHTML += row; //pass row to given table
    }
}

//----------------->Map & and Map related Functions<-----------------
/**
 * @function {populateMap} - 
 */
function populateMap() {
    //Map Object
    map.setView([51.975, 7.61], 13);

    //Basemap Layer
    var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}).addTo(map); //OpenStreetMap

    for(var i = 0; i < locations.length; i++) {
        var location = L.geoJson(locations[i].GeoJson);
        var position;
        if(locations[i].GeoJson.features[0].geometry.type == "Polygon") {
            location.addTo(locationsLayer);
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
        var mapObject = L.marker([position[1], position[0]], {icon: locationIcon});
        mapObject.addTo(locationsLayer);
        mapObject.addTo(map).bindPopup(
            '<p style="font-size: 18px;"><b>' + "Name der Sehenswürdigkeit: " + '</b>' + locations[i].locationID + "</p>" +
            '<br>' + '<b>' + "URL: " + '</b>' + locations[i].GeoJson.features[0].properties.URL + 
            '<br>' + '<b>' + "Beschreibung: " + '</b>' + locations[i].GeoJson.features[0].properties.Description +
            '<br>' + '<b>' + "Koordinaten: " + '</b>' + position[1] + ", " + position[0] + "<br><br>" + 
            '<br><button type="button" class="btn btn-secondary" onclick="getNearestBusstopp([' + position + '])">Nächste Bushaltestelle</button>'
        );
        positions.push({
            leafletObject: location,
            name: locations[i].locationID,
            coords: locations[i].GeoJson.features[0].geometry.coordinates,
            popup: mapObject
        });
    }

    //Layer Control
    var baseLayer = {
        "Open Street Map": osm,
    };
    
    featureLayer = {
        "Sehenwürdigkeiten": locationsLayer,
        "Touren": toursLayer
    };

    L.control.layers(baseLayer, featureLayer).addTo(map); //add layer control to map
}

var currentMarker;
function zoomToFeature(name) {
    toursLayer.clearLayers()
    map.removeLayer(toursLayer);
    map.addLayer(locationsLayer);
    for(var i = 0; i < positions.length; i++) {
        if(positions[i].name == name) {
            map.fitBounds(positions[i].leafletObject.getBounds());
            positions[i].popup.openPopup();
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
    for(var i = 0; i < locationsInTour.length; i++) {
    var location = L.geoJson(locations[i].GeoJson);
    var position;
    if(locationsInTour[i].GeoJson.features[0].geometry.type == "Polygon") {
        location.addTo(toursLayer);
        var polygon = [];
        var coordinates = [];
        for(var j = 0; j < locations[i].GeoJson.features[0].geometry.coordinates[0].length; j++) {
            coordinates.push([
                locationsInTour[i].GeoJson.features[0].geometry.coordinates[0][j][0],
                locationsInTour[i].GeoJson.features[0].geometry.coordinates[0][j][1] 
            ]);
        }
        polygon.push(coordinates);
        position = turf.centroid(turf.polygon(polygon)).geometry.coordinates;
    }
    else {
        position = locationsInTour[i].GeoJson.features[0].geometry.coordinates;
    }
    var mapObject = L.marker([position[1], position[0]], {icon: locationIcon});
    mapObject.addTo(toursLayer);
    mapObject.addTo(map).bindPopup(
        '<p style="font-size: 18px;"><b>' + "Name der Sehenswürdigkeit: " + '</b>' + locationsInTour[i].locationID + 
        '<br>' + '<b>' + "URL: " + '</b>' + locationsInTour[i].GeoJson.features[0].properties.URL + 
        '<br>' + '<b>' + "Beschreibung: " + '</b>' + locationsInTour[i].GeoJson.features[0].properties.Description +
        '<br>' + '<b>' + "Koordinaten: " + '</b></p>' + position + 
        '<br><button type="button" class="btn btn-dark" onclick="getNearestBusstopp([' + position + '])">Nächste Bushaltestelle</button>'
    );
    }
    map.fitBounds(toursLayer.getBounds());
}


// --------------- API Bushaltestellen --------------- 

// distance calculation: 
// This constant is the mean earth radius
const R = 6371;

/**
*@function deg2rad - Function to convert degree to radian
*@param {double} degree
*@returns {double} radian
*/
function deg2rad(deg) 
{
    return deg * (Math.PI/180);
}

/**
*@function rad2deg - Function to convert from radian to degree
*@param {double} radian
*@returns {double} degree 
*/
function rad2deg(rad)
{
    return rad * (180/Math.PI);
}

/**
* @function calculateDistance - Function to calculat the distance between two coordinates
* @param {double} coord1 - is the first coordinate [lat, lon]
* @param {double} coord2 - is the second coordinate [lat, lon]
* @returns {double} dist - returns the distance in km 
*/
function calculateDistance(coord1, coord2) // works
{
    var lat1 = deg2rad(coord1[0]);
    var lon1 = deg2rad(coord1[1]);
    var lat2 = deg2rad(coord2[0]);
    var lon2 = deg2rad(coord2[1]);
 
    var dLat = lat2-lat1;
    var dLon = lon2-lon1;
    var a = Math.sin(dLon/2) * Math.sin(dLon/2) +
            Math.cos(lon1) * Math.cos(lon2) * 
            Math.sin(dLat/2) * Math.sin(dLat/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var dist = R * c; // Distance in km
    return dist;
}

/**
 * This function switches lon lat in a pair of coordinates
 * @param {[double,double]} coords - Gets coordinates (usually in format lon|lat)
 */
function switchCoords(coords){
    var lat = coords[1];
    var lon = coords[0];
    return [lat, lon];
}

// ---- Needed for whether request -------
// The API gets stored in this variable.
var weatherApi;

/**
 * @function {initializeAPI} - This funtion builds up the whole api to use it afterwards.
 * @param {String} key - This key is user-dependent and has to be entered by the user himself.
 * @param {[double, double]} coordinates - These are the requested coordinates. Either the
 * browser location or the standard coordinates (GEO1).
 */
function iniatializeAPI(coordinates,key){
    weatherApi = "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat="
    weatherApi += coordinates[0]+"&lon="+coordinates[1]+"&exclude="+"hourly"+"&appid="+key;
}

//variable to store the API-Key
var clientAPIKey;
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

var output;
function getWeather(lon, lat, name){
    getAPIKey();
    console.log('l.316: lon: '+lon);
    console.log('lat: '+lat);
    if(clientAPIKey == ''){
        console.log('You have to enter an api key!');
        alert('You have to enter an api key!');
        return;
    } else {
        //console.log("'coords:' "+coordinates);
        iniatializeAPI([lon,lat], clientAPIKey);
        {$.ajax({
            url: weatherApi,
            method: "GET",
            })
            .done(function(res){
                output = res;
                markerNearestStopp.bindPopup( 
                    '<p></p>' + 
                    '<p  style="font-size: 18px;"><b>Wetter an der Haltestelle ' + name + '</p></b>' +
                    '<p>Ort: <em>' +  res.lon + ', ' + res.lat + '</em><br>' + //position
                    'Zeitzone: <em>' + res.timezone + '</em><br>' + //timezone
                    'Temperatur: <em>' + res.current.temp + ' °C</em><br>' + //temperature
                    'Luftfeuchte: <em>' + res.current.humidity + '%</em><br>' + //humidity
                    'Luftdruck: <em>' + res.current.pressure + ' hPa</em><br>' + //pressure
                    'Wolkenbedeckung: <em>' + res.current.clouds + '%</em><br>' + //cloud cover
                    'Wetter: <em>' + res.current.weather[0].description + '</em></p>' //openWeather short classification
                    ).openPopup();
            })
            .fail(function(xhr, status, errorThrown){
                console.log("Request has failed :(", '/n', "Status: " + status, '/n', "Error: " + errorThrown); //we log a message on the console
                return;
            })
            .always(function(xhr, status) {
                console.log("Request completed"); //a short message is logged
                return; 
            })
        }
    }
}
 /**
  * Ergänzt werden muss noch, dass beim klicken von mehr als 1 mal auf 'mächste haltestelle' nicht die darauffolgend nächste kommt'
  * mittelpunkt von polygon funktionert nicht.
  */

//var nearestStoppLayer = L.featureGroup().addTo(map);

getAllBusstopps();
var sortedStopps = [];
var test;
var nearestStopp = {};
var markerNearestStopp;

function getNearestBusstopp(locationsPosition){ 
    console.log(locationsPosition);
    console.log("stopps.features.length: "+stopps.features.length);
    for(var i=0; i<stopps.features.length; i++){
        var name = stopps.features[i].properties.lbez;
        var busStopp = switchCoords(stopps.features[i].geometry.coordinates); // [lat, lon]
        var location = switchCoords(locationsPosition);
        var distance = calculateDistance(location, busStopp); 
        sortedStopps[i] = [name, distance, busStopp];
    }
    sortedStopps.sort(function([a,b,c],[d,e,f]){ return b-e }); // Sorts the stopps ascending by the distance to the current location
    nearestStopp.name = sortedStopps[0][0]; // GeoJson filled up with information about the name,
    console.log("nearestStopp.name: "+nearestStopp.name);
    nearestStopp.distance = sortedStopps[0][1]; // the distance between current location and busstopp,
    nearestStopp.lat = sortedStopps[0][2][0]; // latitude and
    nearestStopp.lon = sortedStopps[0][2][1]; // longitude
    console.log(nearestStopp.lat + ', ' + nearestStopp.lon);
    markerNearestStopp = L.marker([nearestStopp.lat, nearestStopp.lon], {icon: busstoppIcon}).addTo(map);

    markerNearestStopp.bindPopup(
        '<p style="font-size: 18px;"><b>Name der nächsten Haltestelle: </b>' + nearestStopp.name + '<br></p>' + 
        '<b>Koordinaten: </b>' + nearestStopp.lat + ', ' + nearestStopp.lon + '<br><br><br>' +
        '<button class="btn btn-dark" onclick="getWeather(' + nearestStopp.lon + ', ' + nearestStopp.lat + ',' + '\'' + nearestStopp.name + '\')">Wetter</button>'
        ).openPopup();

}

