# Geosoftware_2021_Abschlussprojekt
Abschlussprojekt für den Kurs Geosoftware I 2021
Authors: Alexander Pilz & Josefina Balzer

# Server
The Tourguide employs the Express Node.js web application framework. The application run on port 3000.

# Routers:

![alt text](https://github.com/xcomagent95/Geosoftware_2021_Abschlussprojekt/blob/API_Setup/documentation/router_overview.jpg?raw=true)

## Search-Router:
The Search-Router can be used to retrieve data from the mongoDB in various formats. These Functions can accessed via "http://localhost:3000/search/".
The following actions are provided:

**getLocations:**
The getLocations function returns the collection containing the locations from the mongoDB as an array. 
It can be called with "http://localhost:3000/search/getLocations".

**getTours:**
The getTours function returns the collection containing the tours from the mongoDB as an array. 
It can be called with "http://localhost:3000/search/getTours".

**getUsedLocations:**
The getUsedLocations function returns the collection containing the locations which are part of a tour from the mongoDB as an array. 
It can be called with "http://localhost:3000/search/getUsedLocations".

**getCollections:**
The getCollections function returns the collections containing the locations and the tours from the mongoDB as an array. 
The locations can accessed with res[0] and the tours can be accessed with res[1]. 
It can be called with "http://localhost:3000/search/getCollections".

**getCombined:**
The getCombined function returns the tours with the complete locations which are part of the tours from the mongoDB as an array. 
It can be called with "http://localhost:3000/search/getCombined".
            
## Add-Router:
The Add-Router can be used to add data from the mongoDB. These Functions can accessed via "http://localhost:3000/add/".
The following actions are provided:

**newLocation:**
The newLocation function add a new location to the locations collection in the mongoDB. A location needs to have a nameID, an URL, a description, and a                   geometry.
It can be called with "http://localhost:3000/add/newLocation".

**newTour:**
The newTour function add a new tour to the tours collection in the mongoDB. A tour needs to have a tourID, and a list of locations comprising the tour.
It can be called with "http://localhost:3000/add/newTour".

## Update-Router:

**updateLocation:**

**updateTour:**

## Delete-Router:

**removeLocation:**

**removeTour:**

# Webpages
## Landingpage

## Map

The map page provides access the the actual application. locations and tours can be viewed here. Additionaly nearest busstops from a location and weather information at these busstops can be requested here. It can be accessed via "http://localhost:3000/map".

## Editor

The editor page provides the user with all necessary fucntions to manage the locations and tours. It can be accessed via "http://localhost:3000/editor".

## Impressum

The impressum page contains all legal information regarding the application and links to additional material. It can be accessed via "http://localhost:3000/impressum".

# Database
## Collections
**locations:**
The locations collection contains the locations.
Each location is comprised of 
- an __id_ which is an object created by mongoDB and acts as an internal primary key
- a _locationID_ which is a user defined string which acts as the identifier for the location in athe application
- a _GeoJson_ which contains the geometry (point or polygon) and the URL and description properties

The point locations are formatted like:

    {
     "type": "FeatureCollection",
      "features": [{
       "type": "Feature",
        "properties": {
         "Name": "name of the location (indentical to nameID)",
         "URL": "some URL",
         "Description": "some description"
         },
        "geometry": {
         "type": "Point",
         "coordinates": [some longitude, some latitude]
        }
      }]
     }
     
The polygon locations are formatted like: 

    {
     "type": "FeatureCollection",
      "features": [{
       "type": "Feature",
        "properties": {
         "Name": "name of the location (indentical to nameID)",
         "URL": "some URL",
         "Description": "some description"
         },
        "geometry": {
         "type": "Polygon",
         "coordinates": 
         [
          [
           [some longitude, some latitude],
           [some longitude, some latitude],
           [some longitude, some latitude],
           [some longitude, some latitude],
           [some longitude, some latitude]
          ]
         ]
        }
      }]
     }

**tours:**
The tours collection contains the tours.
Each tour is comprised of 
- an __id_ which is an object created by mongoDB and acts as an internal primary key
- a _tourID_ which is a user defined string which acts as the identifier for the tour in athe application
- _locations_ which contain the _locationID_ of the locations which are part of the tour
