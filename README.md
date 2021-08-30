# Geosoftware_2021_Abschlussprojekt
Abschlussprojekt für den Kurs Geosoftware I 2021
Authors: Alexander Pilz & Josefina Balzer

The Tourguide employs the Express Node.js web application framework.

# Routers:
## Search-Router:
The Search-Router can be used to retrieve data from the mongoDB in various formats. These Functions can accessed via "http://localhost:3000/search/".
The following actions are provided:

### getLocations:
The getLocations function returns the collection containing the locations from the mongoDB as an array. 
It can be called with "http://localhost:3000/search/getLocations".

### getTours:
The getTours function returns the collection containing the tours from the mongoDB as an array. 
It can be called with "http://localhost:3000/search/getTours".

### getUsedLocations:
The getUsedLocations function returns the collection containing the locations which are part of a tour from the mongoDB as an array. 
It can be called with "http://localhost:3000/search/getUsedLocations".

### getCollections:
The getCollections function returns the collections containing the locations and the tours from the mongoDB as an array. 
The locations can accessed with res[0] and the tours can be accessed with res[1]. 
It can be called with "http://localhost:3000/search/getCollections".

### getCombined:
The getCombined function returns the tours with the complete locations which are part of the tours from the mongoDB as an array. 
It can be called with "http://localhost:3000/search/getCombined".
            
## Add-Router:
The Add-Router can be used to add data from the mongoDB. These Functions can accessed via "http://localhost:3000/add/".
The following actions are provided:

### newLocation:
The newLocation function add a new location to the locations collection in the mongoDB. A location needs to have a nameID, an URL, a description, and a                   geometry.
It can be called with "http://localhost:3000/add/newLocation".

### newTour:
The newTour function add a new tour to the tours collection in the mongoDB. A tour needs to have a tourID, and a list of locations comprising the tour.
It can be called with "http://localhost:3000/add/newTour".

##Update-Router:
###/update

        
##Delete-Router:
###/delete

