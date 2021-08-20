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
        document.getElementById("newGeometry").value = newGeoJSON;
    } 
    else {
        var geometry;
        geometry = [e.layer._latlng.lat, e.layer._latlng.lng];
        //console.log(geometry);
        newGeoJSON = '{' + '"type": "Point"' + ',' + '"coordinates":' +  '[' + geometry[1] + ',' + geometry[0] + ']' + '}';
        //console.log(newGeoJSON);
        document.getElementById("geometry").value = newGeoJSON;
        document.getElementById("newGeometry").value = newGeoJSON;
    }
});

let locations;
let tours;

function getAllLocationsfromDB() { 
    {$.ajax({ //handle request via ajax
        url: "/search/getLocations", //request url is the prebuild request
        method: "GET", //method is GET since we want to get data not post or update it
        })
        .done(function(res) { //if the request is done -> successful
            //bind a popup to the given marker / the popupt is formatted in HTML and 
            //is enriched with information extracted from the api locations
            locations = res;
            for(i = 0; i < res.length; i++) {
                var layer = L.geoJSON(locations[i].GeoJson);
                locationLayer.addLayer(layer);
                layer.bindPopup("Name: " + locations[i].nameID);
            }
            //Fit Bounds to the Route
            map.fitBounds(locationLayer.getBounds());  

            // The following lines of code build up the dropdown menu from the actual state of the database
            const togglerUpdate = document.getElementById("selectLocationToUpdate");
            for(i = 0; i < locations.length; i++) {
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(locations[i].nameID);
                elem.setAttribute("value", locations[i].nameID) 
                elem.appendChild(elemText);
                togglerUpdate.appendChild(elem);
                var value = document.getElementById("selectLocationToUpdate").value;
                if(locations[i].nameID == value) {
                    document.getElementById('oldNameID').value = locations[i].nameID;
                    document.getElementById('newName').value = locations[i].nameID;
                    document.getElementById('newURL').value = locations[i].GeoJson.features[0].properties.URL;
                    document.getElementById('newDescription').value = locations[i].GeoJson.features[0].properties.Description;
                    document.getElementById('newGeometry').value = JSON.stringify(locations[i].GeoJson.features[0].geometry);
                }
            } 

            const togglerDelete = document.getElementById("selectLocationToDelete");
            for(i = 0; i < locations.length; i++) {
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(locations[i].nameID);
                elem.setAttribute("value", locations[i].nameID) 
                elem.appendChild(elemText);
                togglerDelete.appendChild(elem);
                document.getElementById('oldName').value = locations[i].nameID;
            }  
            
            const togglerAddToTour = document.getElementById("selectLocationToAddToTour");
            for(i = 0; i < locations.length; i++) {
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(locations[i].nameID);
                elem.setAttribute("value", locations[i].nameID) 
                elem.appendChild(elemText);
                togglerAddToTour.appendChild(elem);
            }
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
            for(i = 0; i < tours.length; i++) {
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(tours[i].tourName);
                elem.setAttribute("value", tours[i].tourName) 
                elem.appendChild(elemText);
                togglerDelete.appendChild(elem);
                document.getElementById('oldTour').value = tours[i].tourName;
            } 
            selectTourForDelete();
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
            document.getElementById('oldTour').value = tours[i].tourName;
        }
    }
}

getAllLocationsfromDB(); 
getAllToursfromDB(); 
