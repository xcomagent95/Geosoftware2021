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

map.on('draw:created', function(e) {
    //check if input is Array or Object
    if (e.layer._latlngs instanceof Array) { //Object is a Polygon
    //add object to map
    locationLayer.addLayer(e.layer); //add new Object to the locationLayer
    e.layer.bindPopup( //bind a popup to the newly created "location"
            '<label for="pname">Name</label><br>'
            + '<input type="text" id="pname" name="pname"><br>' 
            + '<label for="purl">URL</label><br>'
            + '<input type="text" id="purl" name="purl">'
            + '<button onclick="passLocationToAddForm()">Location hinzufügen</button> '
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
        document.getElementById("newGeometry").value = newGeoJSON; //set Geometry-String when updating existing Object
    } 
    else { //Object is a Point
        //add object to map
        locationLayer.addLayer(e.layer); //add new Object to the locationLayer
        e.layer.bindPopup( //bind a popup to the newly created "location"
            '<label for="pname">Name</label><br>'
            + '<input type="text" id="pname" name="pname"><br>'
            + '<label for="purl">URL</label><br>'
            + '<input type="text" id="purl" name="purl">'
            + '<button onclick="passLocationToAddForm()">Location hinzufügen</button> '
        ).openPopup([e.layer._latlng.lat, e.layer._latlng.lng]); //open the popup
        var geometry; //initinalize Point
        //get the Point
        geometry = [e.layer._latlng.lat, e.layer._latlng.lng];
        //parse the GeoJson as String
        newGeoJSON = '{' + '"type": "Point"' + ',' + '"coordinates":' +  '[' + geometry[1] + ',' + geometry[0] + ']' + '}';
        document.getElementById("geometry").value = newGeoJSON; //set Geometry-String when creating new Object
        document.getElementById("newGeometry").value = newGeoJSON; //set Geometry-String when updating existing Object
    }
});

let locations; //Array to store Locations
let tours; //Array to store Tours
var locationsInTour; //Array to store the location in a specific tour

/**
 * @function {passLocationToAddForm} - pass the information of a location to the corresponding form
 */
function passLocationToAddForm() {
    document.getElementById("locationID").value = document.getElementById("pname").value; //get locationID
    document.getElementById("url").value = document.getElementById("purl").value; //get URL
    getDescription('url', 'description'); //retrive the article snippet
    document.getElementById("addLocationForm").submit(); //submit the form
}

/**
 * @function {passLocationToDeleteForm} - pass the information of a location to the corresponding form
 */
function passLocationToDeleteForm() {
    document.getElementById("locationIDToDelete").value = document.getElementById("selectedLocationID").value; //get locationID
    document.getElementById("deleteLocationForm").submit(); //submit the form
}

/**
 * @function {getAllfromDB} - retrieve all data (locations and tours) from mongoDB
 */
function getAllfromDB() { 
    {$.ajax({ //handle request via ajax
        url: "/search/getCollections", //request url is the prebuild request
        method: "GET", //method is GET since we want to get data not post or update it
        async: false
        })
        .done(function(res) { //if the request is done -> successful
            locations = res[0];
            tours = res[1];
            for(i = 0; i < locations.length; i++) {
                var layer = L.geoJSON(locations[i].GeoJson);
                locationLayer.addLayer(layer);
                layer.bindPopup('<b>' + "Name: " + '</b>' + locations[i].locationID + '<br><br>' 
                                + '<b>' + "URL: " + '</b>' + locations[i].GeoJson.features[0].properties.URL + '<br><br>' 
                                + '<b>' +  "Beschreibung: " + '</b>' + locations[i].GeoJson.features[0].properties.Description
                + '<input type="hidden" id="selectedLocationID" name="selectedLocationID" value= "' + locations[i].locationID + '">' 
                + '<br></br><button onclick="passLocationToDeleteForm()">Location löschen</button>');
            }
            //Fit Bounds to the Objects
            map.fitBounds(locationLayer.getBounds());  

            buildCheckboxDynamically(locations);

            
            const togglerLocationUpdate = document.getElementById("selectLocationToUpdate");
            for(i = 0; i < locations.length; i++) { //iterate over the Locations
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(locations[i].locationID); 
                elem.setAttribute("value", locations[i].locationID) 
                elem.appendChild(elemText);
                togglerLocationUpdate.appendChild(elem);
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
 * @function {buildCheckboxDynamically} - 
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
 * @function {getAllChecked} - 
 */
function getAllChecked(){
    var checked = [];
    var counter = 0;
    for(var i=0; i<locations.length; i++){
        if(document.getElementById(locations[i].locationID).checked == true){
            checked[counter] = locations[i].locationID;
            counter++;
        }
    }
    return checked;
}

/**
 * @function {selectLocationForUpdate} - 
 */
function selectLocationForUpdate() {
    //Function for populating the Form which is used to select the Location to be Updated
    var value = document.getElementById("selectLocationToUpdate").value;
    for(var i = 0; i < locations.length; i++) {
        if(locations[i].locationID == value) {
            document.getElementById('existingLocationID').value = locations[i].locationID;
            document.getElementById('newLocationID').value = locations[i].locationID;
            document.getElementById('newURL').value = locations[i].GeoJson.features[0].properties.URL;
            document.getElementById('newDescription').value = locations[i].GeoJson.features[0].properties.Description;
            document.getElementById('newGeometry').value = JSON.stringify(locations[i].GeoJson.features[0].geometry);
        }
    }
}

/**
 * @function {clearLocations} - 
 */
function clearLocations() {
    //clear Input-Field when creating a new Tour
    document.getElementById("selectLocationToAddToTour").options.length = 0;
    const togglerAddToTour = document.getElementById("selectLocationToAddToTour");
            for(i = 0; i < locations.length; i++) {
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(locations[i].locationID);
                elem.setAttribute("value", locations[i].locationID) 
                elem.appendChild(elemText);
                togglerAddToTour.appendChild(elem);
    }   
    document.getElementById('locations').value = "";
}

/**
 * @function {addTour} - 
 */
function addTour() {
    var locations = getAllChecked();
    document.getElementById("locations").value = locations;
    document.getElementById("addTourForm").submit();
}

/**
 * @function {selectTourForDelete} - 
 */
function selectTourForDelete() {
    //Selector for the deletion of a Tour
    var value = document.getElementById("selectTourToDelete").value;
    for(var i = 0; i < tours.length; i++) {
        if(tours[i].tourID == value) {
            document.getElementById('tourIDToDelete').value = tours[i].tourID;
        }
    }
}

/**
 * @function {selectTourForUpdate} - 
 */
function selectTourForUpdate() {
    //Selector for updating an existing Tour
    document.getElementById("newLocations").value = "";
    document.getElementById("selectLocationsToDeleteFromTour").options.length = 0;
    document.getElementById("selectLocationsToAddToTour").options.length = 0;
    var value = document.getElementById("selectTourToUpdate").value;
    for(var i = 0; i < tours.length; i++) {
        if(tours[i].tourID == value) {
            document.getElementById('existingTourID').value = tours[i].tourID;
            document.getElementById('newTourID').value = tours[i].tourID;
            locationsInTour = tours[i].locations;
        }
    }

    for(var i = 0; i < locationsInTour.length; i++) {
        document.getElementById("newLocations").value = document.getElementById("newLocations").value + locationsInTour[i] + ',';
    }

    const togglerAddLocation = document.getElementById("selectLocationsToAddToTour");
    for(var i = 0; i < locations.length; i++) {
        var location = locations[i].locationID;
        if (locationsInTour.includes(location) == false) {
            const elem = document.createElement("option");
            elem.href = "#";
            const elemText = document.createTextNode(location);
            elem.setAttribute("value", location) 
            elem.appendChild(elemText);
            togglerAddLocation.appendChild(elem);
        }
    }

    const togglerDeleteLocation = document.getElementById("selectLocationsToDeleteFromTour");
    for(var i = 0; i < locationsInTour.length; i++) {
        const elem = document.createElement("option");
        elem.href = "#";
        const elemText = document.createTextNode(locationsInTour[i]);
        elem.setAttribute("value", locationsInTour[i]) 
        elem.appendChild(elemText);
        togglerDeleteLocation.appendChild(elem);
    } 
}

/**
 * @function {addLocationsToTour} - 
 */
function addLocationsToTour() {
    //Add a Location to an existing Tour
    var locationToAdd = document.getElementById("selectLocationsToAddToTour").value;
    var newlocationsInTour = locationsInTour;
    newlocationsInTour.push(locationToAdd);
    document.getElementById("newLocations").value = newlocationsInTour;
    locationsInTour = newlocationsInTour;
    document.getElementById("selectLocationsToAddToTour").remove(document.getElementById("selectLocationsToAddToTour").selectedIndex); 

    const elem = document.createElement("option");
    elem.href = "#";
    const elemText = document.createTextNode(locationToAdd);
    elem.setAttribute("value", locationToAdd) 
    elem.appendChild(elemText);
    document.getElementById("selectLocationsToDeleteFromTour").appendChild(elem);
}

/**
 * @function {deleteLocationsFromTour} - 
 */
function deleteLocationsFromTour() {
    //Delete a Location from an existing Tour
    var locationToDelete = document.getElementById("selectLocationsToDeleteFromTour").value; 
    var newlocationsInTour = [];
    for(var i = 0; i < locationsInTour.length; i++) {
        if(locationsInTour[i] != locationToDelete) {
            newlocationsInTour.push(locationsInTour[i]);
        }
    }
    document.getElementById("newLocations").value = newlocationsInTour;
    locationsInTour = newlocationsInTour;
    document.getElementById("selectLocationsToDeleteFromTour").remove(document.getElementById("selectLocationsToDeleteFromTour").selectedIndex);
    
    const elem = document.createElement("option");
    elem.href = "#";
    const elemText = document.createTextNode(locationToDelete);
    elem.setAttribute("value", locationToDelete) 
    elem.appendChild(elemText);
    document.getElementById("selectLocationsToAddToTour").appendChild(elem);
}

/**
 * @function {getDescription} - Get a snippet from a wikipaedia article for a specified object
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
 * @function {getTitle} - Get title of article from wikipaedia-URL
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
 *@function {isvalid} - Function checks whether the given string is a valid stringified JSON
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
 * @function {getInputValue} - Reads the inpute from textarea and saves it as "linestring".
 * Then it the main-method gets called with the new route.
 */
 function getInputValue(){
    document.getElementById("errorMessage").className = ""
    document.getElementById("errorMessage").innerHTML = ""
    if(document.getElementById("geoJsonInput").value[0] != "\"" || document.getElementById("geoJsonInput").value[document.getElementById("geoJsonInput").value.length - 1] != "\""){
        document.getElementById("errorMessage").className = "alert alert-warning";
        document.getElementById("errorMessage").innerHTML = 'ERROR: Der Input ist kein JSON.';
    } else {
        if(isValid(document.getElementById("geoJsonInput").value) == true) { // Checks whether the input is valid
            jsonInput = JSON.parse(document.getElementById("geoJsonInput").value);
            if(jsonInput.type != "FeatureCollection") {
                document.getElementById("errorMessage").className = "alert alert-warning"
                document.getElementById("errorMessage").innerHTML = 'ERROR: Dies ist keine FeatureCollection. Die erwartete Form sieht folgendermaßen aus: {"type":"FeatureCollection","features":[...]}'
            } else {
                if(jsonInput.features.length != 1) {
                    document.getElementById("errorMessage").className = "alert alert-warning"
                    document.getElementById("errorMessage").innerHTML = 'ERROR: Die FeatureCollection darf nur ein einzelnes Feature enthalten.'
                } else {
                    if(jsonInput.features[0].type != "Feature") {
                        document.getElementById("errorMessage").className = "alert alert-warning"
                        document.getElementById("errorMessage").innerHTML = 'ERROR: Die FeatureCollection muss ein Feature enthalten.'
                    } else {
                        if(jsonInput.features[0].geometry.type != "Point") {
                            document.getElementById("errorMessage").className = "alert alert-warning"
                            document.getElementById("errorMessage").innerHTML = 'ERROR: Das Feature in der FeatureCollection muss einen einzelnen Punkt als Geometrie enthalten.'
                        } else {
                            if(jsonInput.features[0].geometry.coordinates.length != 2) {
                                document.getElementById("errorMessage").className = "alert alert-warning"
                                document.getElementById("errorMessage").innerHTML = 'ERROR: Das Feature in der FeatureCollection muss ein Paar an Koordinaten enthalten.'
                            } else {
                                document.getElementById("name").value = jsonInput.features[0].properties.name;
                                document.getElementById("url").value = jsonInput.features[0].properties.url;
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


