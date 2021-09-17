"use strict"

var express = require('express'); //require express
const app = express(); //initialize express app
var router = express.Router(); //initialize express-router

//Here we are configuring express to use body-parser as middle-ware
app.use(express.json());
app.use(express.urlencoded());

// Loggers
var JL = require('jsnlog').JL
var jsnlog_nodejs = require('jsnlog-nodejs').jsnlog_nodejs

//MongoClient and DB
const url = 'mongodb://localhost:27017' // connection URL
//const url = 'mongodb://mongo:27017' // connection URL
const dbName = 'tourguidedb' // database name
const locationsCollection = 'locations' // collection containing the locations
const toursCollection = 'tours' // collection containing the tours
const MongoClient = require('mongodb').MongoClient;
const { stringify } = require('querystring'); 
const client = new MongoClient(url) // mongodb client

//Post Location - this post operation can be used to store new locations in the locations collection
router.post('/newLocation', function(req, res, next) 
{
  console.log(">add location payload: ", req.body); //log the request body on the server console

  //Check Request
  if(req.body.locationID == '' || req.body.url == '' || req.body.description == '' || req.body.geometry == '') { //if some information is missing
    res.sendFile(__dirname + "/error_empty_input.html"); //send a missing information error   
    return;
  }

  //Create payload to store in form of a json object
  var GeoJson = {};
  GeoJson.type = "FeatureCollection";
  GeoJson.features = [];
  GeoJson.features[0] = {};
  GeoJson.features[0].type = "Feature";
  GeoJson.features[0].properties = {};
  GeoJson.features[0].properties.Name = req.body.locationID;
  GeoJson.features[0].properties.URL = req.body.url;
  GeoJson.features[0].properties.Description = req.body.description;
  GeoJson.features[0].geometry = {};
  GeoJson.features[0].geometry = JSON.parse(req.body.geometry);

  var locationID = req.body.locationID; 

  //connect to the mongodb database and insert one new element
  client.connect(function(err) 
  {
    const db = client.db(dbName) //database
    const collection = db.collection(locationsCollection) //locations collection
    collection.find({locationID: locationID}).toArray(function(err, docs)
    {
        //check if name already exists
        if(docs.length >= 1) { //if a location with the same locationID already exists
          console.log(">add location error: locationID is redundant");
          res.sendFile(__dirname + "/error_redundant_number.html"); //send a redundant key error
          return;
        } 
        else {
          //Insert the document in the database
          collection.insertOne({GeoJson, locationID}, function(err, result) //insert new location into collection
          {
            console.log(">add location successful: new location stored in database");
            res.sendFile(__dirname + "/done.html"); //send positive response -> the post operation war successful
            return;
           })
        }
    })
  })
});

//Post Tour - this post operation can be used to store new tours in the tours collection
router.post('/newTour', function(req, res, next) 
{
  console.log(">add tour payload: ", req.body);
  //Check Request
  if(req.body.tourID == '' || req.body.locations == '') { //if some information is missing
    res.sendFile(__dirname + "/error_empty_input.html") //send a missing information error
    return;
  }

  //Create Payload to Store
  var tourID = req.body.tourID;
  var trimmedLocations = req.body.locations.substring(0, req.body.locations.length);
  var locations = trimmedLocations.split(',');

  //connect to the mongodb database and insert one new element
  client.connect(function(err) 
  {
    const db = client.db(dbName) //database
    const collection = db.collection(toursCollection) //collection
    collection.find({tourID: tourID}).toArray(function(err, docs)
    {
        //check if name already exists
        if(docs.length >= 1){ //if a tour with the same tourID already exists
          console.log(">add tour error: tourID is redundant");
          res.sendFile(__dirname + "/error_redundant_number.html"); //send a redundant key error
          return;
        } 
        else {
          //Insert the document in the database
          collection.insertOne({tourID, locations}, function(err, result) //insert new tour into collection
          {
            console.log(">add tour successful: new tour stored in database");
            res.sendFile(__dirname + "/done.html"); //send positive response -> the post operation war successful
            return;
           })
        }
    })
  })
});
module.exports = router; //export as router