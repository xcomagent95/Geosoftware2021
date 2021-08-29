var express = require('express');
const app = express();
var router = express.Router();
const assert = require('assert');

//Here we are configuring express to use body-parser as middle-ware
app.use(express.json());
app.use(express.urlencoded());

//MongoConnect
//-------------->>>>Hier muss die passende Datenbank und die passende Collection angegeben werden!!!!!<<<<--------------
const url = 'mongodb://localhost:27017' // connection URL
const dbName = 'tourguidedb' // database name
const locationsCollection = 'locations' // collection name
const toursCollection = 'tours' // collection name

//----------------------------------------------------------------------------------------------------------------------
const MongoClient = require('mongodb').MongoClient
const client = new MongoClient(url) // mongodb client

// Delete Router
router.post('/removeLocation', function(req, res, next)
{
    client.connect(function(err)
    {
        const db = client.db(dbName)
        const collection = db.collection(locationsCollection)
        var oldName = req.body.oldName;
        var inUse = false;
        //check if Location is used
        db.collection(toursCollection).find({}).toArray(function(err, docs) 
        {
          for(var i = 0; i < docs.length; i++) {
            for(var j = 0; j < docs[i].locations.length; j++) {
              if(oldName == docs[i].locations[j]) {
                inUse = true;
              }
            }
          }
        })

        //check if number exists
        collection.find({nameID: oldName}).toArray(function(err, docs)
        {      
            if(docs.length >= 1 && inUse == false){
                //delete Document
                collection.deleteOne({nameID: oldName}, function(err, results){
                })
                res.sendFile(__dirname + "/done.html")
                return;
            }
            if(inUse == true) {
                res.sendFile(__dirname + "/error_location_in_use.html")
                return; 
            }
            else {
                res.sendFile(__dirname + "/error_nonexistent_number.html")
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
        var oldTour = req.body.tourToDelete;
        //check if number exists
        collection.find({tourName: oldTour}).toArray(function(err, docs)
        {      
            if(docs.length >= 1){
                //delete Document
                collection.deleteOne({tourName: oldTour}, function(err, results){
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