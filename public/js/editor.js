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
    //add object to map
    locationLayer.addLayer(e.layer); //add new Object to the locationLayer

    //check if input is Array or Object
    if (e.layer._latlngs instanceof Array) { //Object is a Polygon
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
var locationsInTour;

function getAllLocationsfromDB() { 
    {$.ajax({ //handle request via ajax
        url: "/search/getLocations", //request url is the prebuild request
        method: "GET", //method is GET since we want to get data not post or update it
        })
        .done(function(res) { //if the request is done -> successful
            //bind a popup to the given Object / the popupt is formatted in HTML and 
            locations = res;
            for(i = 0; i < res.length; i++) {
                var layer = L.geoJSON(locations[i].GeoJson);
                locationLayer.addLayer(layer);
                layer.bindPopup("Name: " + locations[i].nameID);
            }
            //Fit Bounds to the Objects
            map.fitBounds(locationLayer.getBounds());  

            //add Information to the Update-Location-Selector
            const togglerUpdate = document.getElementById("selectLocationToUpdate");
            for(i = 0; i < locations.length; i++) { //iterate over the Locations
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(locations[i].nameID); 
                elem.setAttribute("value", locations[i].nameID) 
                elem.appendChild(elemText);
                togglerUpdate.appendChild(elem);
                var value = document.getElementById("selectLocationToUpdate").value;
                //add Information to the Update-Location-Form
                if(locations[i].nameID == value) {
                    document.getElementById('oldNameID').value = locations[i].nameID;
                    document.getElementById('newName').value = locations[i].nameID;
                    document.getElementById('newURL').value = locations[i].GeoJson.features[0].properties.URL;
                    document.getElementById('newDescription').value = locations[i].GeoJson.features[0].properties.Description;
                    document.getElementById('newGeometry').value = JSON.stringify(locations[i].GeoJson.features[0].geometry);
                }
            } 

            //add Information to the Delete-Location-Selector
            const togglerDelete = document.getElementById("selectLocationToDelete");
            for(i = 0; i < locations.length; i++) { //iterate over the Locations
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(locations[i].nameID);
                elem.setAttribute("value", locations[i].nameID) 
                elem.appendChild(elemText);
                togglerDelete.appendChild(elem);
                document.getElementById('oldName').value = locations[i].nameID; //add Information to the Delete-Location-Form
            }  
            
             //add Information to the Add-Location-To-Tour-Selector
            const togglerAddToTour = document.getElementById("selectLocationToAddToTour");
            for(i = 0; i < locations.length; i++) {
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(locations[i].nameID);
                elem.setAttribute("value", locations[i].nameID) 
                elem.appendChild(elemText);
                togglerAddToTour.appendChild(elem);
            }
            //Fill Forms
            selectLocationForUpdate();
            selectLocationForDelete();   
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

function getAllToursfromDB() { 
    {$.ajax({ //handle request via ajax
        url: "/search/getTours", //request url is the prebuild request
        method: "GET", //method is GET since we want to get data not post or update it
        })
        .done(function(res) { //if the request is done -> successful
            //bind a popup to the given marker / the popupt is formatted in HTML and 
            //is enriched with information extracted from the api locations
            tours = res;
            const togglerDelete = document.getElementById("selectTourToDelete");
            for(var i = 0; i < tours.length; i++) {
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(tours[i].tourName);
                elem.setAttribute("value", tours[i].tourName) 
                elem.appendChild(elemText);
                togglerDelete.appendChild(elem);
                document.getElementById('oldTour').value = tours[i].tourName;
            } 
            selectTourForDelete();

            const togglerUpdate = document.getElementById("selectTourToUpdate");
            for(var i = 0; i < tours.length; i++) {
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(tours[i].tourName);
                elem.setAttribute("value", tours[i].tourName) 
                elem.appendChild(elemText);
                togglerUpdate.appendChild(elem);
                document.getElementById('oldTour').value = tours[i].tourName;
            } 
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
getAllLocationsfromDB(); //Get Locations from DB
getAllToursfromDB();  //Get Tours from DB

//Function for populating the Form which is used to select the Location to be Updated
function selectLocationForUpdate() {
    var value = document.getElementById("selectLocationToUpdate").value;
    for(var i = 0; i < locations.length; i++) {
        if(locations[i].nameID == value) {
            document.getElementById('oldNameID').value = locations[i].nameID;
            document.getElementById('newName').value = locations[i].nameID;
            document.getElementById('newURL').value = locations[i].GeoJson.features[0].properties.URL;
            document.getElementById('newDescription').value = locations[i].GeoJson.features[0].properties.Description;
            document.getElementById('newGeometry').value = JSON.stringify(locations[i].GeoJson.features[0].geometry);
        }
    }
}

//Function for populating the Form which is used to select the Location to be Deleted
function selectLocationForDelete() {
    var value = document.getElementById("selectLocationToDelete").value;
    for(var i = 0; i < locations.length; i++) {
        if(locations[i].nameID == value) {
            document.getElementById('oldName').value = locations[i].nameID;
        }
    }
}

function addLocationToTour() {
    if(document.getElementById("selectLocationToAddToTour").value == "") {
        return;
    }
    document.getElementById('locations').value = document.getElementById('locations').value + document.getElementById("selectLocationToAddToTour").value + ',';
    document.getElementById("selectLocationToAddToTour").remove(document.getElementById("selectLocationToAddToTour").selectedIndex);     
}

function clearLocations() {
    document.getElementById("selectLocationToAddToTour").options.length = 0;
    const togglerAddToTour = document.getElementById("selectLocationToAddToTour");
            for(i = 0; i < locations.length; i++) {
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(locations[i].nameID);
                elem.setAttribute("value", locations[i].nameID) 
                elem.appendChild(elemText);
                togglerAddToTour.appendChild(elem);
    }   
}

function selectTourForDelete() {
    var value = document.getElementById("selectTourToDelete").value;
    for(var i = 0; i < tours.length; i++) {
        if(tours[i].tourName == value) {
            document.getElementById('newTour').value = tours[i].tourName;
        }
    }
}

function selectTourForUpdate() {
    document.getElementById("selectLocationToDeleteFromTour").options.length = 0;
    document.getElementById("selectLocationToAddToTour2").options.length = 0;
    var value = document.getElementById("selectTourToUpdate").value;
    var locationsNameID = [];
    for(var i = 0; i < tours.length; i++) {
        if(tours[i].tourName == value) {
            document.getElementById('oldTour').value = tours[i].tourName;
            document.getElementById('newTour').value = tours[i].tourName;
            locationsInTour = tours[i].locations;
        }
    }

    const togglerDeleteLocation = document.getElementById("selectLocationToDeleteFromTour");
    for(var i = 0; i < locationsInTour.length; i++) {
        const elem = document.createElement("option");
        elem.href = "#";
        const elemText = document.createTextNode(locationsInTour[i]);
        elem.setAttribute("value", locationsInTour[i]) 
        elem.appendChild(elemText);
        togglerDeleteLocation.appendChild(elem);
    } 

    const togglerAddLocation = document.getElementById("selectLocationToAddToTour2");
    for(var i = 0; i < locationsInTour.length; i++) {
        locationsNameID.push(locations[i].nameID)
    }
    for(var i = 0; i < locations.length; i++) {
        if(locationsNameID.includes(locations[i].nameID) == false) {
            const elem = document.createElement("option");
            elem.href = "#";
            const elemText = document.createTextNode(locations[i].nameID);
            elem.setAttribute("value", locations[i].nameID) 
            elem.appendChild(elemText);
            togglerAddLocation.appendChild(elem);
        }
    }
    document.getElementById("newLocations").value = locationsInTour;
}

function addLocationToTour() {
    var locationToAdd = document.getElementById("selectLocationToAddToTour2").value;
    console.log(document.getElementById("selectLocationToAddToTour2").value);
    var newlocationsInTour = locationsInTour;
    newlocationsInTour.push(locationToAdd);
    console.log(newlocationsInTour);
    document.getElementById("newLocations").value = newlocationsInTour;
    locationsInTour = newlocationsInTour;
    document.getElementById("selectLocationToAddToTour2").remove(document.getElementById("selectLocationToAddToTour2").selectedIndex); 

    const elem = document.createElement("option");
    elem.href = "#";
    const elemText = document.createTextNode(locationToAdd);
    elem.setAttribute("value", locationToAdd) 
    elem.appendChild(elemText);
    document.getElementById("selectLocationToDeleteFromTour").appendChild(elem);
}

function deleteLocationFromTour() {
    var locationToDelete = document.getElementById("selectLocationToDeleteFromTour").value;
    var newlocationsInTour = [];
    for(var i = 0; i < locationsInTour.length; i++) {
        if(locationsInTour[i] != locationToDelete) {
            newlocationsInTour.push(locationsInTour[i]);
        }
    }
    document.getElementById("newLocations").value = newlocationsInTour;
    locationsInTour = newlocationsInTour;
    document.getElementById("selectLocationToDeleteFromTour").remove(document.getElementById("selectLocationToDeleteFromTour").selectedIndex);
    
    const elem = document.createElement("option");
    elem.href = "#";
    const elemText = document.createTextNode(locationToDelete);
    elem.setAttribute("value", locationToDelete) 
    elem.appendChild(elemText);
    document.getElementById("selectLocationToAddToTour2").appendChild(elem);
}

function getContentFromWikiMedia(keyword) {
}
