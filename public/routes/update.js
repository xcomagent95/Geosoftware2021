var express = require('express'); //require express
const app = express(); //initialize express app
var router = express.Router(); //initialize express-router

//Here we are configuring express to use body-parser as middle-ware
app.use(express.json());
app.use(express.urlencoded());

//MongoClient and DB
//const url = 'mongodb://localhost:27017' // connection URL
const url = 'mongodb://mongo:27017' // connection URL
const dbName = 'tourguidedb' // database name
const locationsCollection = 'locations' // collection containing the locations
const toursCollection = 'tours' // collection containing the tours
const MongoClient = require('mongodb').MongoClient;
const { stringify } = require('querystring'); 
const client = new MongoClient(url) // mongodb client

//Post Router
router.post('/updateLocation', function(req, res, next) 
{
  console.log(">update location payload: ", req.body); //log the request body on the server console
  //Check Request
  if(req.body.newLocationID == '' || req.body.newURL == '' || req.body.newDescription == '' || req.body.newGeometry == '') {
    res.sendFile(__dirname + "/error_empty_input.html")
    return;
  }

  var newLocationID = req.body.newLocationID;
  var existingLocationID = req.body.existingLocationID;
  var newURL = req.body.newURL;
  var newDescription = req.body.newDescription;
  var newGeometry = req.body.newGeometry;

  var GeoJson = {};
  GeoJson.type = "FeatureCollection";
  GeoJson.features = [];
  GeoJson.features[0] = {};
  GeoJson.features[0].type = "Feature";
  GeoJson.features[0].properties = {};
  GeoJson.features[0].properties.Name = newLocationID;
  GeoJson.features[0].properties.URL = newURL;
  GeoJson.features[0].properties.Description = newDescription;
  GeoJson.features[0].geometry = {};
  GeoJson.features[0].geometry = JSON.parse(newGeometry);
  
  var newGeoJson = GeoJson;

  //connect to the mongodb database and insert one new element
  client.connect(function(err) 
  {
    const db = client.db(dbName) //database
    const collection = db.collection(locationsCollection) //collection

    //check if exists
    collection.find({locationID: existingLocationID}).toArray(function(err, docs) 
    {
      if(docs.length >= 1) {
          //Update the document in the database
          collection.find({locationID: newLocationID}).toArray(function(err, docs) 
          {
            if(docs.length >= 1 && existingLocationID != newLocationID) {
                //Update the document in the database
                console.log(">update location error: redundant locationID");
                res.sendFile(__dirname + "/error_redundant_number.html") //redirect after Post
                return;
            }
            else {
              collection.updateOne({locationID: existingLocationID}, {$set:{locationID: newLocationID, GeoJson: newGeoJson}}, function(err, result) 
              {
                //check if Location is part of a stored tour
                db.collection(toursCollection).find({}).toArray(function(err, docs) 
                {
                  for(var i = 0; i < docs.length; i++) { //check all tours
                    for(var j = 0; j < docs[i].locations.length; j++) { //check all locations in tours
                      if(existingLocationID == docs[i].locations[j]) { //if the location to be updated is still part of a tour
                        docs[i].locations[j] = newLocationID; //update locationID in tour
                        var updatedLocations =  docs[i].locations;  
                        db.collection(toursCollection).updateOne({tourID: docs[i].tourID}, {$set:{tourID: docs[i].tourID, locations: updatedLocations}}, function(err, result) 
                        {})
                      }
                    }
                  }
                });
              })
              console.log(">update location successful: updated location in database");
              res.sendFile(__dirname + "/done.html") //redirect after Post
              return;
            }
          })
      }
      else {
        console.log(">update location error: nonexistent locationID");
        res.sendFile(__dirname + "/error_nonexistent_number.html") //redirect after Post
        return;
      }
    })
  })
});

router.post('/updateTour', function(req, res, next) 
{
  console.log(">update tours payload: ", req.body); //log the request body on the server console
  if(req.body.existingTourID == "" || req.body.newLocations == "" || req.body.newTourID == "") {
    res.sendFile(__dirname + "/error_empty_input.html")
    return;
  }

  var existingTourID = req.body.existingTourID;
  var newTourID = req.body.newTourID;
  var newLocationsRaw = req.body.newLocations.split(',');
  var newLocations = [];
  for(var i = 0; i < newLocationsRaw.length; i++) {
    if(newLocationsRaw[i] != "") {
      newLocations.push(newLocationsRaw[i]);
    }
  }

  //connect to the mongodb database and insert one new element
  client.connect(function(err) 
  {
    const db = client.db(dbName) //database
    const collection = db.collection(toursCollection) //collection

    //check if exists
    collection.find({tourID: existingTourID}).toArray(function(err, docs) 
    {
      if(docs.length >= 1) {
          //Update the document in the database
          collection.find({tourID: newTourID}).toArray(function(err, docs) 
          {
            if(docs.length >= 1 && existingTourID != newTourID) {
                //Update the document in the database
                console.log(">update tour error: redundant tourID");
                res.sendFile(__dirname + "/error_redundant_number.html") //redirect after Post
                return;
            }
            else {
              collection.updateOne({tourID: existingTourID}, {$set:{tourID: newTourID, locations: newLocations}}, function(err, result) 
              {
              })
              console.log(">update tour successful: updated tour in database");
              res.sendFile(__dirname + "/done.html") //redirect after Post
              return;
            }
          })
      }
      else {
        console.log(">update tour error: nonexistent tourID");
        res.sendFile(__dirname + "/error_nonexistent_number.html") //redirect after Post
        return;
      }
    })
  })
});
module.exports = router; //export as router