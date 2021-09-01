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
        positions.push({
            leafletObject: location,
            name: locations[i].locationID,
            coords: locations[i].GeoJson.features[0].geometry.coordinates
        });
        location.addTo(locationsLayer);
        location.bindPopup(
            '<b>' + "Name: " + '</b>' + locations[i].locationID + 
            '<br><br>' + '<b>' + "URL: " + '</b>' + locations[i].GeoJson.features[0].properties.url + 
            '<br><br>' + '<b>' +  "Description: " + '</b>' + locations[i].GeoJson.features[0].properties.description
        );
    }

    //Layer Control
    var baseLayer = {
        "Open Street Map": osm,
    };
    
    var featureLayer = {
        "Sehenwürdigkeiten": locationsLayer,
        "Touren": toursLayer
    };

    L.control.layers(baseLayer, featureLayer).addTo(map);
}

function zoomToFeature(name) {
    map.removeLayer(toursLayer);
    map.addLayer(locationsLayer);
    for(var i = 0; i < positions.length; i++) {
        if(positions[i].name == name) {
            map.fitBounds(positions[i].leafletObject.getBounds());
            positions[i].leafletObject.openPopup();
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
        location.addTo(toursLayer);
    }
    map.fitBounds(toursLayer.getBounds());
}

// --------------- API Bushaltestellen --------------- 
var busAPI = "https://rest.busradar.conterra.de/prod/haltestellen";
var stopps = [];

function getAllBusstopps(){
    {$.ajax({
        url: busAPI,
        method: "GET",
        })
        .done(function(res){
            for(var i=0; i<res.features.length; i++){
                var name = res.features[i].properties.lbez;
                var position = res.features[i].geometry.coordinates;
                stopps[i] = [name, position];
            }
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
