var express = require('express'); //require express
const app = express(); //initialize express app
var router = express.Router(); //initialize express-router

//Here we are configuring express to use body-parser as middle-ware
app.use(express.json());
app.use(express.urlencoded());

//MongoClient and DB
const url = 'mongodb://localhost:27017' // connection URL
const dbName = 'tourguidedb' // database name
const locationsCollection = 'locations' // collection containing the locations
const toursCollection = 'tours' // collection containing the tours
const MongoClient = require('mongodb').MongoClient;
const { stringify } = require('querystring'); 
const client = new MongoClient(url) // mongodb client

//Post Router
router.post('/updateLocation', function(req, res, next) 
{
  //console.log(req.body);
  //Check Request
  if(req.body.newName == '' || req.body.newURL == '' || req.body.newDescription == '' || req.body.newGeometry == '') {
    res.sendFile(__dirname + "/error_empty_input.html")
    return;
  }
  var GeoJsonString = '{' + '"type": "FeatureCollection"' + ',' + '"features":' + '[' + '{' + '"type": "Feature"' + ',' +
        '"properties":' +  '{' + '"Name":' + '"' + req.body.newName + '"' + ',' 
                               + '"URL":' + '"' + req.body.newURL + '"' + ',' 
                               + '"Description":' + '"' + req.body.newDescription + '"' + '}' + ',' 
                               + '"geometry":' + req.body.newGeometry + '}' + ']' + '}';
  //console.log(req);
  var newlocationID = req.body.newName;
  var oldlocationID = req.body.oldNameID;
  var newGeoJson = JSON.parse(GeoJsonString);

  //connect to the mongodb database and insert one new element
  client.connect(function(err) 
  {
    const db = client.db(dbName) //database
    const collection = db.collection(locationsCollection) //collection

    //check if exists
    collection.find({locationID: oldlocationID}).toArray(function(err, docs) 
    {
      if(docs.length >= 1) {
          //Update the document in the database
          collection.find({locationID: newlocationID}).toArray(function(err, docs) 
          {
            if(docs.length >= 1 && oldlocationID != newlocationID) {
                //Update the document in the database
                res.sendFile(__dirname + "/error_redundant_number.html") //redirect after Post
                return;
            }
            else {
              collection.updateOne({locationID: oldlocationID}, {$set:{locationID: newlocationID, GeoJson: newGeoJson}}, function(err, result) 
              {
              })
              res.sendFile(__dirname + "/done.html") //redirect after Post
              return;
            }
          })
      }
      else {
        //console.log("false");
        res.sendFile(__dirname + "/error_nonexistent_number.html") //redirect after Post
        return;
      }
    })
  })
});

router.post('/updateTour', function(req, res, next) 
{
  var oldtourID = req.body.oldTour;
  var newtourID = req.body.newTour;
  var newLocations = req.body.newLocations.split(',');
  //connect to the mongodb database and insert one new element
  client.connect(function(err) 
  {
    const db = client.db(dbName) //database
    const collection = db.collection(toursCollection) //collection

    if(oldtourID == "" || newLocations == "" || newtourID == "") {
      res.sendFile(__dirname + "/error_empty_input.html")
      return;
    }

    //check if exists
    collection.find({tourID: oldtourID}).toArray(function(err, docs) 
    {
      if(docs.length >= 1) {
          //Update the document in the database
          collection.find({tourID: newtourID}).toArray(function(err, docs) 
          {
            if(docs.length >= 1 && oldtourID != newtourID) {
                //Update the document in the database
                res.sendFile(__dirname + "/error_redundant_number.html") //redirect after Post
                return;
            }
            else {
              collection.updateOne({tourID: oldtourID}, {$set:{tourID: newtourID, locations: newLocations}}, function(err, result) 
              {
              })
              res.sendFile(__dirname + "/done.html") //redirect after Post
              return;
            }
          })
      }
      else {
        //console.log("false");
        res.sendFile(__dirname + "/error_nonexistent_number.html") //redirect after Post
        return;
      }
    })
  })
});
module.exports = router; //export as router