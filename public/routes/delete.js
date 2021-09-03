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

//Delete Location - this post operation can be used to remove existing locations from the locations collection 
router.post('/removeLocation', function(req, res, next)
{
    console.log(">remove location payload: ", req.body); //log the request body on the server console

    client.connect(function(err)
    {
        const db = client.db(dbName)
        const collection = db.collection(locationsCollection)
        var oldLocationID = req.body.oldName;
        var inUse = false;
        //check if Location is part of a stored tour
        db.collection(toursCollection).find({}).toArray(function(err, docs) 
        {
          for(var i = 0; i < docs.length; i++) {
            for(var j = 0; j < docs[i].locations.length; j++) {
              if(oldLocationID == docs[i].locations[j]) {
                inUse = true;
              }
            }
          }
        })

        collection.find({locationID: oldLocationID}).toArray(function(err, docs)
        {      
            if(docs.length >= 1 && inUse == false){
                collection.deleteOne({locationID: oldLocationID}, function(err, results){
                })
                res.sendFile(__dirname + "/done.html"); //send positive response -> the post operation war successful
                return;
            }
            if(inUse == true) {
                res.sendFile(__dirname + "/error_location_in_use.html");  //send a location in use error   
                return; 
            }
            else {
                res.sendFile(__dirname + "/error_nonexistent_number.html"); //send nonexistent location error
                return;
            }
        })
    })
})

router.post('/removeTour', function(req, res, next)
{
    client.connect(function(err)
    {
        const db = client.db(dbName)
        const collection = db.collection(toursCollection)
        var oldTourID = req.body.tourToDelete;
        //check if number exists
        collection.find({tourID: oldTourID}).toArray(function(err, docs)
        {      
            if(docs.length >= 1){
                //delete Document
                collection.deleteOne({tourID: oldTourID}, function(err, results){
                })
                res.sendFile(__dirname + "/done.html")
            }
            else {
                res.sendFile(__dirname + "/error_nonexistent_number.html")
            }
            
        })

    })
})
module.exports = router; //export as router