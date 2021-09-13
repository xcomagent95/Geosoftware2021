"use strict"

//global variables 
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

var map = L.map('mapdiv'); //create the map
var locationsLayer = L.featureGroup().addTo(map); //layerGroup for the locations
var toursLayer = L.featureGroup().addTo(map); //layerGroup for the tours
var featureLayer; //"layer" for minsc objects

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

            if(locations == []) { //if no locations are returned
                map.setView([51.975, 7.61], 13); ///set view to münster
                return;
            }
            
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
getAllfromDB(); //retrieve data

/**
 * @function fillTables - This function fills the tables to present the locations and the tours on the website
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
        //initialize table row as variable
        var row =  `<tr scope="row">
                        <td>${locationsTableData[i][0]}</td>
                        <td><a href="${locationsTableData[i][1]}">Link</a></td>
                        <td><button type="button" class="btn btn-secondary" onclick="zoomToFeature('${locationsTableData[i][0]}')">zur Sehenswürdigkeit</button></td>
                    </tr>`
        locationsTable.innerHTML += row; //pass row into given table
    }

    //fill the table with the paths
    for(var i = 0; i < toursTableData.length; i++) { //iterate over table data
        //get all locations from a tour
        var locationsInTour = "<ul>";
        for(var j = 0; j < tours[i].locations.length; j++){ //iterate over locations
            locationsInTour += "<li>" + tours[i].locations[j]; //add locations to list
        }
        locationsInTour += "</ul>";
        
        //initialize table row as variable
        var row =  `<tr>
                        <td>${toursTableData[i]}</td>
                        <td><button type="button" class="btn btn-secondary" onclick="zoomToTour('${toursTableData[i]}')">zur Tour</button></td>
                        <td>${locationsInTour}</td>
                    </tr>`
        toursTable.innerHTML += row; //pass row to given table
    }
}

//----------------->Map & and Map related Functions<-----------------
/**
 * @function populateMap - 
 */
function populateMap() {
    //Map Object
    map.setView([51.975, 7.61], 13);

    //Basemap Layer
    var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {}).addTo(map); //OpenStreetMap

    for(var i = 0; i < locations.length; i++) { //iterate over locations
        var location = L.geoJson(locations[i].GeoJson); //build geoJson leaflet object
        var position; //initialize variable for the position
        if(locations[i].GeoJson.features[0].geometry.type == "Polygon") { //if the location is a polygon
            location.addTo(locationsLayer); //add the polygon to the locationsLayer
            var polygon = []; //array for the "polygon"
            var coordinates = []; //array for the coordinates
            for(var j = 0; j < locations[i].GeoJson.features[0].geometry.coordinates[0].length; j++) { //iterate over the coordinates
                coordinates.push([ //push the coordinates into the coordinates array
                    locations[i].GeoJson.features[0].geometry.coordinates[0][j][0],
                    locations[i].GeoJson.features[0].geometry.coordinates[0][j][1] 
                ]);
            }
            polygon.push(coordinates); //push the coordinates array into the polygon array
            position = turf.centroid(turf.polygon(polygon)).geometry.coordinates; //build a turf polygon and calculate its centroid
        }
        else {
            position = locations[i].GeoJson.features[0].geometry.coordinates; //store the position when the location is point
        }
        var mapObject = L.marker([position[1], position[0]], {icon: locationIcon}); //create marker from current position
        mapObject.addTo(locationsLayer); //add the marker to the map 
        mapObject.addTo(map).bindPopup( //bind a popup
            '<p style="font-size: 18px;"><b>' + "Name der Sehenswürdigkeit: " + '</b>' + locations[i].locationID + "</p>" +
            '<br>' + '<b>' + "URL: " + '</b>' + locations[i].GeoJson.features[0].properties.URL + 
            '<br>' + '<b>' + "Beschreibung: " + '</b>' + locations[i].GeoJson.features[0].properties.Description +
            '<br>' + '<b>' + "Koordinaten: " + '</b>' + position[1] + ", " + position[0] + "<br><br>" + 
            '<br><button type="button" class="btn btn-secondary" onclick="getNearestBusstopp([' + position + '])">Nächste Bushaltestelle</button>'
        );
        positions.push({ //push an object into positions
            leafletObject: location, //location
            name: locations[i].locationID, //locationID
            coords: locations[i].GeoJson.features[0].geometry.coordinates, //geometry
            popup: mapObject //map object -> a marker
        });
    }

    //Layer Control
    var baseLayer = {
        "Open Street Map": osm, //OpenStreetMap
    };
    
    featureLayer = {
        "Sehenwürdigkeiten": locationsLayer, //locations
        "Touren": toursLayer //tours
    };

    L.control.layers(baseLayer, featureLayer).addTo(map); //add layer control to map
}

var currentMarker;
/**
 * @function zoomToFeature - This function changes the bounds of the window of the map the way that a given feature gets focussed.
 * @param {String} name - The name of the feature which should be focussed
 */
function zoomToFeature(name) {
    toursLayer.clearLayers(); //clear the tours
    map.removeLayer(toursLayer); //remove the tours (deactivate the layer)
    map.addLayer(locationsLayer); //add the locations (aktivate the layer)
    for(var i = 0; i < positions.length; i++) { //iterate over positions
        if(positions[i].name == name) { //if the correspondig locationID is found
            map.fitBounds(positions[i].leafletObject.getBounds()); //get bounds of correcponding object
            positions[i].popup.openPopup(); //open the popup
            currentMarker = positions[i]; //set curret marker
        }
    }
}
/**
 * @function zoomToTour - The function changes the shown part of the map the way that a specific and given tour gets focussed.
 * @param {String} name - The name of the tour which should be focussed
 */
function zoomToTour(name) {
    toursLayer.clearLayers(); //clear the toursLayer
    map.removeLayer(locationsLayer); //deactivate locationsLayer
    map.addLayer(toursLayer); //activate toursLayer
    var tour; //initialize tour
    for(var l = 0; l < tours.length; l++) { //iterate over the tours
        if(name == tours[l].tourID) { //if the coreect tour is found
            tour = tours[l]; //store in teh tour variable
        }
    }

    var locationsInTour = []; //initialize locationsInTour array
    for(var i = 0; i < tour.locations.length; i++) { //iterate over tours
        for(var j = 0; j < locations.length; j ++) { //iterate over locations in tour
            if(locations[j].locationID == tour.locations[i]) { //if contained location is found
                locationsInTour.push(locations[j]); //push the location into the locationsInTour array
            }
        }
    }

    map.removeLayer(locationsLayer); //deactivate locations layer
    for(var i = 0; i < locationsInTour.length; i++) { //iterate over locationsInTour
        var position; //initialize position
        if(locationsInTour[i].GeoJson.features[0].geometry.type == "Polygon") { //if the location is a polygon
            var location = L.geoJson(locationsInTour[i].GeoJson); //build geoJson leaflet object
            location.addTo(toursLayer); //add the polygon to the locationsLayer
            var polygon = []; //array for the "polygon"
            var coordinates = []; //array for the coordinates
            for(var j = 0; j < locationsInTour[i].GeoJson.features[0].geometry.coordinates[0].length; j++) { //iterate over the coordinates
                coordinates.push([ //push the coordinates into the coordinates array
                    locationsInTour[i].GeoJson.features[0].geometry.coordinates[0][j][0],
                    locationsInTour[i].GeoJson.features[0].geometry.coordinates[0][j][1] 
                ]);
            }
            polygon.push(coordinates); //push the coordinates array into the polygon array
            position = turf.centroid(turf.polygon(polygon)).geometry.coordinates; //build a turf polygon and calculate its centroid
        }
        else { 
            position = locationsInTour[i].GeoJson.features[0].geometry.coordinates; //store the position when the location is point
        }
        var mapObject = L.marker([position[1], position[0]], {icon: locationIcon});  //create marker from current position
        mapObject.addTo(toursLayer); //add the amrker to the tours layer
        mapObject.addTo(map).bindPopup( //bind a popup to the marker
            '<p style="font-size: 18px;"><b>' + "Name der Sehenswürdigkeit: " + '</b>' + locationsInTour[i].locationID + 
            '<br>' + '<b>' + "URL: " + '</b>' + locationsInTour[i].GeoJson.features[0].properties.URL + 
            '<br>' + '<b>' + "Beschreibung: " + '</b>' + locationsInTour[i].GeoJson.features[0].properties.Description +
            '<br>' + '<b>' + "Koordinaten: " + '</b></p>' + position + 
            '<br><button type="button" class="btn btn-dark" onclick="getNearestBusstopp([' + position + '])">Nächste Bushaltestelle</button>'
        );
    }
    map.fitBounds(toursLayer.getBounds()); //zoom to bounds of the selected tour
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
 * @function initializeAPI - This funtion builds up the whole api to use it afterwards.
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
* @function getAPIKey - reads the API-Key from Input-Field
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
 * @function getAllBusstopps - This function sends a request to the api server and calculates the distances of the current marker to all responded busstopps
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

var output; // This variable gets filled with the answer of the weather request
/**
 * @function getWeather - This function sends a request for the weather data at a given location and 
 * @param {float} lon 
 * @param {float} lat 
 * @param {String} name - The name gets used later on
 * @returns nothing but a popup with weather data in case the request succeeds.
 */
function getWeather(lon, lat, name){
    getAPIKey(); // The api key is needed for the api request and has to be entered on the website by a user
    if(clientAPIKey == ''){ // In case there is no entered api key...
        console.log('You have to enter an api key!');
        alert('You have to enter an api key!');
        return;
    } else {
        iniatializeAPI([lon,lat], clientAPIKey); // Now the api has the be constructed with the given data about coordinates and apikey
        {$.ajax({
            url: weatherApi,
            method: "GET",
            })
            .done(function(res){
                output = res; // Here the output variable gets filled with the answer.
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
                    ).openPopup(); // a popup gets configurated
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
getAllBusstopps();

// Used variables in the following function 
var sortedStopps = [];
var nearestStopp = {};
var markerNearestStopp;
 
/**
 * @function getNearestBusstopp - This function uses the data from the getAllBusstopps() function in the stopps array the find the nearest busstopp and bind a popup at this position.
 * @param {[lat,lon]]} locationsPosition - This method needs the position of the location which gets analyzed as a parameter
 */
function getNearestBusstopp(locationsPosition){ 
    for(var i=0; i<stopps.features.length; i++){ // This loop will calculate the distance between the current position and all bus stopps
        var name = stopps.features[i].properties.lbez;
        var busStopp = switchCoords(stopps.features[i].geometry.coordinates); // [lat, lon]
        var location = switchCoords(locationsPosition);
        var distance = calculateDistance(location, busStopp); 
        sortedStopps[i] = [name, distance, busStopp];
    }
    sortedStopps.sort(function([a,b,c],[d,e,f]){ return b-e }); // Sorts the stopps ascending by the distance to the current location
    nearestStopp.name = sortedStopps[0][0]; // GeoJson filled up with information about the name,
    nearestStopp.distance = sortedStopps[0][1]; // the distance between current location and busstopp,
    nearestStopp.lat = sortedStopps[0][2][0]; // latitude and
    nearestStopp.lon = sortedStopps[0][2][1]; // longitude
    markerNearestStopp = L.marker([nearestStopp.lat, nearestStopp.lon], {icon: busstoppIcon}).addTo(map); // A marker gets added to the map at the coordinates of the nearest busstopp

    markerNearestStopp.bindPopup( // A popup gets constructed and filled with data 
        '<p style="font-size: 18px;"><b>Name der nächsten Haltestelle: </b>' + nearestStopp.name + '<br></p>' + 
        '<b>Koordinaten: </b>' + nearestStopp.lat + ', ' + nearestStopp.lon + '<br><br><br>' +
        '<button class="btn btn-dark" onclick="getWeather(' + nearestStopp.lon + ', ' + nearestStopp.lat + ',' + '\'' + nearestStopp.name + '\')">Wetter</button>'
        ).openPopup();
}

/**
 * @function autocomplete - This function is the autofunction for the search function. 
 * @param {String} inp - This parameter is the input entered to the input field which should be autocompleted.
 * @param {[String]} arr - This parameter is a String-array which includes all possible option for autocompletion. 
 * source: https://www.w3schools.com/howto/howto_js_autocomplete.asp
 */
function autocomplete(inp, arr) {
    // The autocomplete function takes two arguments,
    // the text field element and an array of possible autocompleted values:
    var currentFocus;
    // execute a function when someone writes in the text field:
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        // close any already open lists of autocompleted values
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        // create a DIV element that will contain the items (values):
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        // append the DIV element as a child of the autocomplete container:
        this.parentNode.appendChild(a);
        // for each item in the array...
        for (i = 0; i < arr.length; i++) {
          // check if the item starts with the same letters as the text field value:
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            // create a DIV element for each matching element:
            b = document.createElement("DIV");
            // make the matching letters bold:
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            // insert a input field that will hold the current array item's value:
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            // execute a function when someone clicks on the item value (DIV element):
                b.addEventListener("click", function(e) {
                // insert the value for the autocomplete text field:
                inp.value = this.getElementsByTagName("input")[0].value;
                // close the list of autocompleted values, or any other open lists of autocompleted values:
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    // execute a function presses a key on the keyboard:
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          // If the arrow DOWN key is pressed, increase the currentFocus variable:
          currentFocus++;
          // and and make the current item more visible:
          addActive(x);
        } else if (e.keyCode == 38) { //up
          // If the arrow UP key is pressed, decrease the currentFocus variable:
          currentFocus--;
          // and and make the current item more visible:
          addActive(x);
        } else if (e.keyCode == 13) {
          // If the ENTER key is pressed, prevent the form from being submitted,
          e.preventDefault();
          if (currentFocus > -1) {
            // and simulate a click on the "active" item:
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      // a function to classify an item as "active":
      if (!x) return false;
      // start by removing the "active" class on all items:
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      // add class "autocomplete-active":
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      // a function to remove the "active" class from all autocomplete items:
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      // close all autocomplete lists in the document, except the one passed as an argument:
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  // execute a function when someone clicks in the document:
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

// These variables and the two for-loops build up the String-array which is needed for he autocomplete function. It contains 
// all possible input values.
var searchElem;
var found;
var searchResults = [];
var counter = 0;
for(var i=0; i<locations.length; i++){
    searchResults[counter] = locations[i].locationID;
    counter++;
}
for(var i=0; i<tours.length; i++){
    searchResults[counter] = tours[i].tourID;
    counter++;
}
autocomplete(document.getElementById("suche"), searchResults);

/**
 * @function searchFunction - This function is responsible for the search function on the webpage. It also contains an error message for ipnut values, which are not found.
 */
function searchFunction(){
    found = "false"; // The default-value of the variable "found" is false. It will change to "true", in case the entered value is a known location or route
    document.getElementById("searchError").className = ""; // Initially the error message is not existant and includes no value.
    document.getElementById("searchError").innerHTML = "";
    searchElem = document.getElementById("suche").value;
    for(var i=0; i<locations.length; i++){ // The first for-loop of two checks, whether the given input is identical to one of the known locations.
        if(locations[i].locationID == searchElem){
            zoomToFeature(searchElem);
            found = "true";
        }
    }
    if(found == "false"){ // The second for loop will check, whether it is one of the tours.
        for(var i=0; i<tours.length; i++){
            if(tours[i].tourID == searchElem){
                zoomToTour(searchElem);
                found = "true";
            }
        }
    }
    if(found == "false"){ // In case the inout is not conform to any of the known possibilities an error gets printed.
        document.getElementById("searchError").className = "alert alert-danger";
        document.getElementById("searchError").innerHTML = "Das Element <b>" + searchElem + '</b> ist weder eine eingetragene Tour noch eine Sehenswürdigkeit!';
    }
}
