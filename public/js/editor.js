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

var response;
function getAllDatafromDB() { 
    {$.ajax({ //handle request via ajax
        url: "/search/getAll", //request url is the prebuild request
        method: "GET", //method is GET since we want to get data not post or update it
        })
        .done(function(res) { //if the request is done -> successful
            //bind a popup to the given marker / the popupt is formatted in HTML and 
            //is enriched with information extracted from the api response
            response = res;
            console.log(response[0]);
            for(i = 0; i < res.length; i++) {
                var layer = L.geoJSON(response[i].GeoJson);
                locationLayer.addLayer(layer);
                layer.bindPopup("Name: " + response[i].nameID);
                route = response[i].GeoJson;
            }
            //Fit Bounds to the Route
            map.fitBounds(locationLayer.getBounds());  

            // The following lines of code build up the dropdown menu from the actual state of the database
            const togglerUpdate = document.getElementById("selectLocationToUpdate");
            for(i = 0; i < response.length; i++) {
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(response[i].nameID);
                elem.setAttribute("value", response[i].nameID) 
                elem.appendChild(elemText);
                togglerUpdate.appendChild(elem);
            } 
            const togglerDelete = document.getElementById("selectLocationToDelete");
            for(i = 0; i < response.length; i++) {
                const elem = document.createElement("option");
                elem.href = "#";
                const elemText = document.createTextNode(response[i].nameID);
                elem.setAttribute("value", response[i].nameID) 
                elem.appendChild(elemText);
                togglerDelete.appendChild(elem);
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
getAllDatafromDB();

function selectLocationForUpdate() {
    for(var i = 0; i < response.length; i++) {
        if(response[i].nameID == document.getElementById("selectLocationToUpdate").value) {
            document.getElementById('oldNameID').value = response[i].nameID;
            document.getElementById('newName').value = response[i].nameID;
            document.getElementById('newURL').value = response[i].GeoJson.features[0].properties.URL;
            document.getElementById('newDescription').value = response[i].GeoJson.features[0].properties.Description;
            document.getElementById('newGeometry').value = JSON.stringify(response[i].GeoJson.features[0].geometry);
        }
    }
}

function selectLocationForDelete() {
    for(var i = 0; i < response.length; i++) {
        if(response[i].nameID == document.getElementById("selectLocationToDelete").value) {
            document.getElementById('oldName').value = response[i].nameID;
        }
    }
}
