"use strict"

var express = require('express'); //require express
const app = express(); //initialize express app
var router = express.Router(); //initialize express-router

//Here we are configuring express to use body-parser as middle-ware
app.use(express.json());
app.use(express.urlencoded());

// Loggers
var JL = require('jsnlog').JL;
var jsnlog_nodejs = require('jsnlog-nodejs').jsnlog_nodejs;

//MongoClient and DB
//const url = 'mongodb://localhost:27017' // connection URL for local use
const url = 'mongodb://mongo:27017' // connection URL for docker use
const dbName = 'tourguidedb' // database name
const locationsCollection = 'locations' // collection containing the locations
const toursCollection = 'tours' // collection containing the tours
const MongoClient = require('mongodb').MongoClient;
const { stringify } = require('querystring'); 
const client = new MongoClient(url) // mongodb client

//Delete Location - this post operation can be used to remove existing locations from the locations collection 
router.post('/removeLocation', function(req, res, next)
{
    JL("ServerLogs").info("> Remove location payload: " + JSON.stringify(req.body)); //log the request body on the server console

    client.connect(function(err)
    {
        const db = client.db(dbName)
        const collection = db.collection(locationsCollection)
        var locationID = req.body.locationIDToDelete;
        var inUse = false;
        //check if Location is part of a stored tour
        db.collection(toursCollection).find({}).toArray(function(err, docs) 
        {
          for(var i = 0; i < docs.length; i++) { //check all tours
            for(var j = 0; j < docs[i].locations.length; j++) { //check all locations in tours
              if(locationID == docs[i].locations[j]) { //if the location to be deleted is still part of a tour
                inUse = true; //set inUse to true
              }
            }
          }
        });

        collection.find({locationID: locationID}).toArray(function(err, docs)
        {      
            if(docs.length >= 1 && inUse == false){ //if the locations exists and is not in use
                collection.deleteOne({locationID: locationID}, function(err, results){ //delte the location from the locations collection
                })
                res.sendFile(__dirname + "/done.html"); //send positive response -> the post operation war successful
                return;
            }
            if(inUse == true) { //if the location is still in use
                res.sendFile(__dirname + "/error_location_in_use.html");  //send a location in use error   
                return; 
            }
            else { //if the location does not exist
                res.sendFile(__dirname + "/error_nonexistent_number.html"); //send nonexistent location error
                return;
            }
        })
    })
})

//Delete Tour - this post operation can be used to remove existing tours from the tours collection 
router.post('/removeTour', function(req, res, next)
{
    client.connect(function(err)
    {
        const db = client.db(dbName)
        const collection = db.collection(toursCollection)
        var tourID = req.body.tourIDToDelete;
        
        collection.find({tourID: tourID}).toArray(function(err, docs)
        {      
            if(docs.length >= 1){ //check if tour exists
                collection.deleteOne({tourID: tourID}, function(err, results){ //delte the tour from the tours collection
                })
                res.sendFile(__dirname + "/done.html") //send positive response -> the post operation war successful
            }
            else { //if the tour does not exist
                res.sendFile(__dirname + "/error_nonexistent_number.html") //send nonexistent tour error
            }
            
        })

    })
})
module.exports = router; //export as router