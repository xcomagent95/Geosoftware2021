//run javaScript in strict mode
"use strict"

//set ajax to run in asychronous mode only
$.ajaxSetup({
    async: false
});
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
        //disable all draw functions but Points and Polygons
        polyline: false, 
        polygon: true,
        circle: false,
        circlemarker: false,
        marker: true,
        rectangle: false
    },
    edit: {
        //drawn features will be stored in the locationLayer
        featureGroup: locationLayer,
        remove: false,
        edit: false 
    }
}); 
map.addControl(drawControl); //add the control to the map

var newGeoJSON; //initialize new GeoJson for new Locations
var currentLayer;

map.on('draw:created', function(e) {
    //check if input is Array or Object
    if (e.layer._latlngs instanceof Array) { //Object is a Polygon
    //add object to map
    currentLayer = e.layer;
    locationLayer.addLayer(e.layer); //add new Object to the locationLayer
    e.layer.bindPopup( //bind a popup to the newly created "location"
            '<h5><b>Hinzufügen einer neuen Location</b></h5>'
            + '<label for="pname">Name</label><br>'
            + '<input type="text" id="pname" name="pname"><br>' 
            + '<label for="purl">URL</label><br>'
            + '<input type="text" id="purl" name="purl"><br><br>'
            + '<button type="button" class="btn btn-secondary" onclick="passLocationToAddForm()">Location hinzufügen</button><br><br>' 
            + '<button type="button" class="btn btn-secondary" onclick="useGeometryForUpdate(newGeoJSON)">Geometrie für Update nutzen</button> '
        ).openPopup([e.layer._latlngs[0][0].lat, e.layer._latlngs[0][0].lng]); //open the popup

        var geometry = []; //initinalize Array for the Verticies of the Polygon
        //get the Verticies
        for(var i = 0; i < e.layer._latlngs[0].length; i++) {
            geometry.push([e.layer._latlngs[0][i].lng, e.layer._latlngs[0][i].lat]);
        }
        //push the first Vertex again since first and last Vertex must be the same to conform to the choosen Format
        geometry.push([e.layer._latlngs[0][0].lng, e.layer._latlngs[0][0].lat]); 
        //parse the GeoJson as String
        newGeoJSON = '{' + '"type": "Polygon"' + ',' + '"coordinates":'  + '[' + JSON.stringify(geometry) + ']' + '}';
        document.getElementById("geometry").value = newGeoJSON; //set Geometry-String when creating new Object
    } 
    else { //Object is a Point
        //add object to map
        currentLayer = e.layer;
        locationLayer.addLayer(e.layer); //add new Object to the locationLayer
        e.layer.bindPopup( //bind a popup to the newly created "location"
            '<h5><b>Hinzufügen einer neuen Location</b></h5>'
            + '<label for="pname">Name</label><br>'
            + '<input type="text" id="pname" name="pname"><br>'
            + '<label for="purl">URL</label><br>'
            + '<input type="text" id="purl" name="purl"><br><br>'
            + '<button type="button" class="btn btn-secondary" onclick="passLocationToAddForm()">Location hinzufügen</button><br><br>'
            + '<button type="button" class="btn btn-secondary" onclick="useGeometryForUpdate(newGeoJSON)">Geometrie für Update nutzen</button> '
        ).openPopup([e.layer._latlng.lat, e.layer._latlng.lng]); //open the popup
        var geometry; //initinalize Point
        //get the Point
        geometry = [e.layer._latlng.lat, e.layer._latlng.lng];
        //parse the GeoJson as String
        newGeoJSON = '{' + '"type": "Point"' + ',' + '"coordinates":' +  '[' + geometry[1] + ',' + geometry[0] + ']' + '}';
        document.getElementById("geometry").value = newGeoJSON; //set Geometry-String when creating new Object
    }
});

let locations; //Array to store Locations
let tours; //Array to store Tours
var locationsInTour = []; //Array to store the location in a specific tour

/** // MISSING CCOMENT
 * @function useGeometryForUpdate - instructs the webpage to use the geometry for an update instead of a new location
 * @param {json} geoJson - the newly created geometry to be used for updating the selected location
 * @param {layer} layer - the "event"-layer which can be deleted from the canvas if the geometry is used to update a location
 */
 function useGeometryForUpdate(geoJson, layer) {
    document.getElementById("newGeometry").value = geoJson; //set Geometry-String when updating existing Object
    map.closePopup(); //close popup
    locationLayer.removeLayer(currentLayer);
    document.getElementById("newGeometryInfo").className = "alert alert-success";
    document.getElementById("geometryInfo").innerHTML = "Neue Geometrie erzeugt! <br><b>Bestätigung über 'Location aktualisieren'</b>"
 }

/**
 * @function passLocationToAddForm - pass the information of a location to the corresponding form
 */
function passLocationToAddForm() {
    document.getElementById("locationID").value = document.getElementById("pname").value; //get locationID
    document.getElementById("url").value = document.getElementById("purl").value; //get URL
    getDescription('url', 'description'); //retrive the article snippet
    document.getElementById("addLocationForm").submit(); //submit the form
}

/**
 * @function passLocationToDeleteForm - pass the information of a location to the corresponding form
 */
function passLocationToDeleteForm() {
    document.getElementById("locationIDToDelete").value = document.getElementById("selectedLocationID").value; //get locationID
    document.getElementById("deleteLocationForm").submit(); //submit the form
}

/**
 * @function getAllfromDB - retrieve all data (locations and tours) from mongoDB
 */
function getAllfromDB() { 
    {$.ajax({ //handle request via ajax
        url: "/search/getCollections", //request url is the prebuild request
        method: "GET", //method is GET since we want to get data not post or update it
        async: false
        })
        .done(function(res) { //if the request is done -> successful
            locations = res[0]; //store locations in locations array
            tours = res[1]; //store tours in tours array

            for(var i = 0; i < locations.length; i++) { //iterate over the locations
                var layer = L.geoJSON(locations[i].GeoJson); //create a layer
                locationLayer.addLayer(layer); //add the layer to the locationLayer group
                layer.bindPopup('<b>' + "Name: " + '</b>' + locations[i].locationID + '<br><br>' 
                                + '<b>' + "URL: " + '</b>' + locations[i].GeoJson.features[0].properties.URL + '<br><br>' 
                                + '<b>' +  "Beschreibung: " + '</b>' + locations[i].GeoJson.features[0].properties.Description
                + '<input type="hidden" id="selectedLocationID" name="selectedLocationID" value= "' + locations[i].locationID + '">' 
                + '<br></br><button class="btn btn-secondary" onclick="passLocationToDeleteForm()">Location löschen</button>');
            }
            if(locations = []) { //if no locations are returned
                map.setView([51.975, 7.61], 13); ///set view to münster
            }
            else {
                map.fitBounds(locationLayer.getBounds()); //fit bounds to locations layer
            }

            buildCheckboxDynamically(locations); //build checkboxes for the addLocationToTour form

            //fill the toggler for the selection of the location to be updated with data
            const togglerLocationUpdate = document.getElementById("selectLocationToUpdate"); //define the toggler
            for(i = 0; i < locations.length; i++) { //iterate over the Locations
                const elem = document.createElement("option"); //create options
                elem.href = "#";
                const elemText = document.createTextNode(locations[i].locationID); 
                elem.setAttribute("value", locations[i].locationID) 
                elem.appendChild(elemText);
                togglerLocationUpdate.appendChild(elem); //append the options
                var value = document.getElementById("selectLocationToUpdate").value; 
                //add Information to the Update-Location-Form
                if(locations[i].locationID == value) {
                    document.getElementById('existingLocationID').value = locations[i].locationID;
                    document.getElementById('newLocationID').value = locations[i].locationID;
                    document.getElementById('newURL').value = locations[i].GeoJson.features[0].properties.URL;
                    document.getElementById('newDescription').value = locations[i].GeoJson.features[0].properties.Description;
                    document.getElementById('newGeometry').value = JSON.stringify(locations[i].GeoJson.features[0].geometry);
                }
            } 

            //fill the toggler for the selection of tours to be deleted with data
            const togglerTourDelete = document.getElementById("selectTourToDelete");
            for(var i = 0; i < tours.length; i++) {
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(tours[i].tourID);
                elem.setAttribute("value", tours[i].tourID) 
                elem.appendChild(elemText);
                togglerTourDelete.appendChild(elem);
                document.getElementById('tourIDToDelete').value = tours[i].tourID;
            } 

            //fill the toggler for the selection of tours to be updated with data
            const togglerTourUpdate = document.getElementById("selectTourToUpdate");
            for(var i = 0; i < tours.length; i++) {
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(tours[i].tourID);
                elem.setAttribute("value", tours[i].tourID) 
                elem.appendChild(elemText);
                togglerTourUpdate.appendChild(elem);
                document.getElementById('tourIDToDelete').value = tours[i].tourID;
            }

            //Fill Forms
            selectLocationForUpdate();
            selectTourForDelete();
            selectTourForUpdate();   
        })
        .fail(function(xhr, status, errorThrown) { //if the request fails (for some reason)
            console.log("Request has failed :(", '/n', "Status: " + status, '/n', "Error: " + errorThrown); //a message si logged on the console
            return;
        })
        .always(function(xhr, status) { //if the request is "closed", either successful or not 
            console.log("Request completed - Data retrieved from DB..."); //a short message is logged
            return; 
        })
    }
}  
getAllfromDB();


/**
 * @function buildCheckboxDynamically - function which builds the chekcboxes for the updateLocationForm from the given data
 * @param {location[]} listOfLocations - The list of locations is needed to build the content 
 */
function buildCheckboxDynamically(listOfLocations){
    // Dynamische Checkbox:
    for(var i=0; i<listOfLocations.length; i++){
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = listOfLocations[i].locationID;
        checkbox.value = listOfLocations[i].locationID;

        var label = document.createElement('label');
        label.id = listOfLocations[i].locationID;
        label.htmlFor = listOfLocations[i].locationID;
        label.appendChild(document.createTextNode(listOfLocations[i].locationID));

        var br = document.createElement('br');
        var container = document.getElementById('checkboxContainer');
        container.appendChild(checkbox);
        container.appendChild(label);
        container.appendChild(br);
    }
}

/**
 * @function getAllChecked - function retrieves all checked locations from the checkboxes
 */
function getAllChecked(){
    var checked = []; //initialize result array
    var counter = 0; //initialize counter
    for(var i=0; i < locations.length; i++){ //iterate over locations
        if(document.getElementById(locations[i].locationID).checked == true){ //if the corresponding checkbox is checked
            checked[counter] = locations[i].locationID; //fill the result array
            counter++; //increment counter
        }
    }
    return checked; //return the result
}

/**
 * @function selectLocationForUpdate - function pupulates the selectLocationToUpdate toggler
 */
function selectLocationForUpdate() {
    var value = document.getElementById("selectLocationToUpdate").value; //define toggler
    for(var i = 0; i < locations.length; i++) { //iterate over the locations
        if(locations[i].locationID == value) { //fill form if criteria are met
            document.getElementById('existingLocationID').value = locations[i].locationID; //"old" locationID
            document.getElementById('newLocationID').value = locations[i].locationID; //"new" locationID
            document.getElementById('newURL').value = locations[i].GeoJson.features[0].properties.URL; //new URL
            document.getElementById('newDescription').value = locations[i].GeoJson.features[0].properties.Description; //new Description
            document.getElementById('newGeometry').value = JSON.stringify(locations[i].GeoJson.features[0].geometry); //newGeometry
        }
    }
    document.getElementById("newGeometryInfo").className = "alert alert-warning";
    document.getElementById("geometryInfo").innerHTML = "Keine neue Geometrie erzeugt!"
}

/**
 * @function clearLocations - function resets the update loactions in tours form
 */
function clearLocations() {
    //clear the input field when creating updating a tour and an error occured
    document.getElementById("selectLocationToAddToTour").options.length = 0; //reset the toggler
    const togglerAddToTour = document.getElementById("selectLocationToAddToTour"); //define toggler
            for(i = 0; i < locations.length; i++) { //iterate over the locations
                const elem = document.createElement("option"); //create options
                elem.href = "#";
                const elemText = document.createTextNode(locations[i].locationID);
                elem.setAttribute("value", locations[i].locationID) 
                elem.appendChild(elemText);
                togglerAddToTour.appendChild(elem); //append options
    }   
    document.getElementById('locations').value = ""; //reset locations in form
}

/**
 * @function addTour - function adds a location to a locations array of a tour
 */
function addTour() {
    var locations = getAllChecked(); //get all checkd locations
    document.getElementById("locations").value = locations; //store locations in form
    document.getElementById("addTourForm").submit(); //submit the form
}

/**
 * @function selectTourForDelete - function adds a tour to be deleted to the the deleteTour form
 */
function selectTourForDelete() {
    var value = document.getElementById("selectTourToDelete").value; //get value from toggler
    for(var i = 0; i < tours.length; i++) { //iterate over forms 
        if(tours[i].tourID == value) { //if criteria are met
            document.getElementById('tourIDToDelete').value = tours[i].tourID; //add tourID to form
        }
    }
}

/**
 * @function selectTourForUpdate - function pupulates the updateTour form 
 */
function selectTourForUpdate() {
    document.getElementById("newLocations").value = ""; //reset locations
    document.getElementById("selectLocationsToDeleteFromTour").options.length = 0; //reset options in selectLocationsToDeleteFromTour
    document.getElementById("selectLocationsToAddToTour").options.length = 0; //reset options in selectLocationsToAddToTour
    var value = document.getElementById("selectTourToUpdate").value; //get tour to be updated
    for(var i = 0; i < tours.length; i++) { //iterate over tours
        if(tours[i].tourID == value) { //if criteria are met
            document.getElementById('existingTourID').value = tours[i].tourID; //"old" tourID
            document.getElementById('newTourID').value = tours[i].tourID; //"new" tourID
            locationsInTour = tours[i].locations; //new location
        }
    }

    //fill new locations
    for(var i = 0; i < locationsInTour.length; i++) {
        document.getElementById("newLocations").value = document.getElementById("newLocations").value + locationsInTour[i] + ',';
    }

    //add location toggler
    const togglerAddLocation = document.getElementById("selectLocationsToAddToTour"); //define toggler
    for(var i = 0; i < locations.length; i++) { //iterate over locations
        var location = locations[i].locationID; 
        if (locationsInTour.includes(location) == false) { //if criteria are met
            const elem = document.createElement("option"); //create option
            elem.href = "#";
            const elemText = document.createTextNode(location);
            elem.setAttribute("value", location) 
            elem.appendChild(elemText);
            togglerAddLocation.appendChild(elem); //append option
        }
    }

    //delete location toggler
    const togglerDeleteLocation = document.getElementById("selectLocationsToDeleteFromTour"); //define toggler
    for(var i = 0; i < locationsInTour.length; i++) { //iterate over locations
        const elem = document.createElement("option"); //create option
        elem.href = "#";
        const elemText = document.createTextNode(locationsInTour[i]);
        elem.setAttribute("value", locationsInTour[i]) 
        elem.appendChild(elemText);
        togglerDeleteLocation.appendChild(elem); //append option
    } 
}

/**
 * @function addLocationsToTour - function is responseable for adding locations to a tour
 */
function addLocationsToTour() {
    var locationToAdd = document.getElementById("selectLocationsToAddToTour").value; //get the location to add
    var newlocationsInTour = locationsInTour; 
    newlocationsInTour.push(locationToAdd);
    document.getElementById("newLocations").value = newlocationsInTour;
    locationsInTour = newlocationsInTour;
    document.getElementById("selectLocationsToAddToTour").remove(document.getElementById("selectLocationsToAddToTour").selectedIndex); //remove added location from selectLocationsToAddToTour toggler

    const elem = document.createElement("option");
    elem.href = "#";
    const elemText = document.createTextNode(locationToAdd);
    elem.setAttribute("value", locationToAdd) 
    elem.appendChild(elemText);
    document.getElementById("selectLocationsToDeleteFromTour").appendChild(elem); //add added location to selectLocationsToDeleteFromTour toggler
}

/**
 * @function deleteLocationsFromTour - function is responseable for deleting a location from a tour
 */
function deleteLocationsFromTour() {
    var locationToDelete = document.getElementById("selectLocationsToDeleteFromTour").value; //get the location to delete
    var newlocationsInTour = []; //initialize new locations
    for(var i = 0; i < locationsInTour.length; i++) { //iterate over locationsInTour
        if(locationsInTour[i] != locationToDelete) { //if current location is not in locationToDelete
            newlocationsInTour.push(locationsInTour[i]); //push to the newlocationsInTour array
        }
    }
    document.getElementById("newLocations").value = newlocationsInTour; //pass the new locations to the element
    locationsInTour = newlocationsInTour; //set the locationsInTour to the new array
    document.getElementById("selectLocationsToDeleteFromTour").remove(document.getElementById("selectLocationsToDeleteFromTour").selectedIndex); //remove deleted location from selectLocationsToDeleteFromTour toggler
    
    const elem = document.createElement("option");
    elem.href = "#";
    const elemText = document.createTextNode(locationToDelete);
    elem.setAttribute("value", locationToDelete) 
    elem.appendChild(elemText);
    document.getElementById("selectLocationsToAddToTour").appendChild(elem); //add deleted location to selectLocationsToAddToTour toggler
}

/**
 * @function getDescription - Get a snippet from a wikipaedia article for a specified object
 * @param {String} sourceID - gets the id from which the wikipaedia link can be obtained
 * @param {String} targetID - gets the id of the object in which to store the snipped
 */
function getDescription(sourceID, targetID) {
    //get Wikipaedia Snippets for valid Article-URL
    var url = document.getElementById(sourceID).value; //get the url from sourceID
    var keyword = getTitle(url); //get keyword via getTitle()
    if(url.includes("wikipedia.org")) { //if the url is a wikipaedia article
        $.getJSON('http://de.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=true&exsentences=3&explaintext=true&titles=' + keyword + '&origin=*', function(data) {
            //get the article as json
            var key = Object.keys(data.query.pages)[0]; //get articleID 
            var article = JSON.stringify(data.query.pages.valueOf(key)); //get the article
            if (key == -1) { //if no matching artcile is found
                document.getElementById(targetID).value = "keine Information vorhanden"; //store a short info in the target-object
            }
            else { //if a matching article is found
                //cut the artcile to length
                article = article.substring(article.indexOf('"extract":"')); 
                article = article.replace('extract":"', "");
                article = article.substring(0, article.length - 3);
                article = article.substring(1);
                document.getElementById(targetID).value = article; //store the cut article in the target-object
            }
        });
    }
    else{ //if the url is not a wikipaedia article
        document.getElementById(targetID).value = "keine Information vorhanden"; //store a short info in the target-object
    }
}

/**
 * @function getTitle - Get title of article from wikipaedia-URL
 * @param {String} url - gets an url in form of a string 
 * @returns {String} - returns the keyword with which an wikipaedia article can be found
 */
function getTitle(url) {
    var chars = Array.from(url); //transform the url into an array of chars
    var counter = 0; //counter which stores the numer of / in chars array
    var keyword = ''; //initialize keyword
    for(var i = 0; i < chars.length; i++) { //iterate over the chars
        if(chars[i] == '/') { //if char is a /
            counter ++; //increment counter
        }
        if(counter == 4) { //if four / are registered
            keyword = keyword + chars[i]; //the keyword is reached an written in to keyword variable
        }
    }
    return keyword.substring(1); //return the keyword
}

/**
 *@function isvalid - Function checks whether the given string is a valid stringified JSON
 *@param {string} str - stringified JSON
 *@throws Will throw an error if the entered string is not a stringified JSON
 */
 function isValid(str){
	try{
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

var jsonInput;
/**
 * @function getInputValue - Reads the inpute from textarea and saves it as "linestring".
 * Then it the main-method gets called with the new route.
 */
 function getInputValue(){
    document.getElementById("errorMessage").className = "" // First the error message gets cleared and the colour reseted
    document.getElementById("errorMessage").innerHTML = ""
    if(document.getElementById("geoJsonInput").value[0] == "\"" || document.getElementById("geoJsonInput").value[document.getElementById("geoJsonInput").value.length - 1] == "\""){ // Checks whether the input is not a stringified json.
        document.getElementById("errorMessage").className = "alert alert-warning";
        document.getElementById("errorMessage").innerHTML = 'ERROR: Der Input ist kein JSON.';
    } else {
        if(isValid(document.getElementById("geoJsonInput").value) == true) { // Checks whether the input is valid
            jsonInput = JSON.parse(document.getElementById("geoJsonInput").value);
            if(jsonInput.type != "FeatureCollection") { // Checks whether the type is a FeatureCollection
                document.getElementById("errorMessage").className = "alert alert-warning"
                document.getElementById("errorMessage").innerHTML = 'ERROR: Dies ist keine FeatureCollection. Die erwartete Form sieht folgendermaßen aus: {"type":"FeatureCollection","features":[...]}'
            } else {
                if(jsonInput.features.length != 1) { // Checks whether the type includes only one feature
                    document.getElementById("errorMessage").className = "alert alert-warning"
                    document.getElementById("errorMessage").innerHTML = 'ERROR: Die FeatureCollection darf nur ein einzelnes Feature enthalten.'
                } else {
                    if(jsonInput.features[0].type != "Feature") { // // Checks whether the of the only Feature is a feature
                        document.getElementById("errorMessage").className = "alert alert-warning"
                        document.getElementById("errorMessage").innerHTML = 'ERROR: Die FeatureCollection muss ein Feature enthalten.'
                    } else {
                        if(jsonInput.features[0].geometry.type != "Point" && jsonInput.features[0].geometry.type != "Polygon") {// Checks whether the input is a Point or a Polygon
                            document.getElementById("errorMessage").className = "alert alert-warning"
                            document.getElementById("errorMessage").innerHTML = 'ERROR: Das Feature in der FeatureCollection muss einen einzelnen Punkt oder ein Polygon als Geometrie enthalten.'
                        } else {
                            if(jsonInput.features[0].geometry.type == "Point") { // If the given input is a point the function checks whether it contains a pari of coordinates
                                if(jsonInput.features[0].geometry.coordinates.length != 2){
                                    document.getElementById("errorMessage").className = "alert alert-warning"
                                    document.getElementById("errorMessage").innerHTML = 'ERROR: Das Punkt-Feature in der FeatureCollection muss ein Paar an Koordinaten enthalten.'
                                } else { // If it is a point and contains a pair of coordinates the given input gets pushed into the db
                                    document.getElementById("locationID").value = jsonInput.features[0].properties.Name;
                                    document.getElementById("url").value = jsonInput.features[0].properties.URL;
                                    document.getElementById("description").value = jsonInput.features[0].properties.description; 
                                    document.getElementById("geometry").value = JSON.stringify(jsonInput.features[0].geometry); 
                                    getDescription('url', 'description');
                                    document.getElementById("addLocationForm").submit();
                                }
                            } else if(jsonInput.features[0].geometry.type == "Polygon") { // If the given input is a polygon ... 
                                if(jsonInput.features[0].geometry.coordinates.length != 1) { // and contains an array of arrays with the length of 1. The one array of coordinates can be arbitrarily long, but it can be only of of the arrays... Otherwise it's not a polygon.
                                    document.getElementById("errorMessage").className = "alert alert-warning"
                                    document.getElementById("errorMessage").innerHTML = 'ERROR: Das Polygon-Feature in der FeatureCollection muss ein Array an Koordinaten enthalten.'
                                } else { // If everything got checked and the input gets classified as valid is gets pushed into the db 
                                    document.getElementById("locationID").value = jsonInput.features[0].properties.Name;
                                    document.getElementById("url").value = jsonInput.features[0].properties.URL;
                                    document.getElementById("description").value = jsonInput.features[0].properties.description; 
                                    document.getElementById("geometry").value = JSON.stringify(jsonInput.features[0].geometry); 
                                    getDescription('url', 'description');
                                    document.getElementById("addLocationForm").submit();
                                }
                            } 
                        }
                    }
                }
            }
        }
    }
}


