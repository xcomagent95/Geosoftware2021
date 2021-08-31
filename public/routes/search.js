var express = require('express'); //get express
var router = express.Router(); //use express
const assert = require('assert');

//MongoConnect
//-------------->>>>Hier muss die passende Datenbank und die passende Collection angegeben werden!!!!!<<<<--------------
const url = 'mongodb://localhost:27017' // connection URL
const dbName = 'tourguidedb' // database name
const locationsCollection = 'locations' // collection name
const toursCollection = 'tours' // collection name

//----------------------------------------------------------------------------------------------------------------------
const MongoClient = require('mongodb').MongoClient //Client for MongoDB
const client = new MongoClient(url) // mongodb client

//get Documents
router.get('/getLocations', function(req, res, next) 
{
  //Connect to the mongodb database and retrieve all docs
  client.connect(function(err) 
  {
  
    const db = client.db(dbName); //Database
    const collection = db.collection(locationsCollection); //Collection

    // Find all documents
    var result = [];
    collection.find({}).toArray(function(err, docs) 
    {
      res.json(docs); //return documents from Database
    })
  })
});
//get Documents
router.get('/getTours', function(req, res, next) 
{
  //Connect to the mongodb database and retrieve all docs
  client.connect(function(err) 
  {
  
    const db = client.db(dbName); //Database
    const collection = db.collection(toursCollection); //Collection

    // Find all documents
    collection.find({}).toArray(function(err, docs) 
    {
      res.json(docs); //return documents from Database
    })
  })
});

//get Documents
router.get('/getUsedLocations', function(req, res, next) 
{
  //Connect to the mongodb database and retrieve all docs
  client.connect(function(err) 
  {
  
    const db = client.db(dbName); //Database
    const collection = db.collection(toursCollection); //Collection

    // Find all documents
    var result = [];
    collection.find({}).toArray(function(err, docs) 
    {
      for(var i = 0; i < docs.length; i++) {
        for(var j = 0; j < docs[i].locations.length; j++) {
          result.push(docs[i].locations[j]);
        }
      }
      res.json(result); //return documents from Database
    })
  })
});

//get All Tours and their Locations
router.get('/getCollections', function(req, res, next) 
{
  //Connect to the mongodb database and retrieve all docs
  client.connect(function(err) 
  {
  
    const db = client.db(dbName); //Database
    const tcollection = db.collection(toursCollection); //Collection
    const lcollection = db.collection(locationsCollection); //Collection

    // Find all documents
    var tresult = [];
    var lresult = [];
    tcollection.find({}).toArray(function(err, docs) 
    {
      tresult = docs;

      lcollection.find({}).toArray(function(err, docs2) 
      {
        lresult = docs2;
        var result = [];
        result[0] = lresult;
        result[1] = tresult; 
        /*
        for(var i = 0; i < tresult.length; i++) {
          var obj = {tour: tresult[i].tourID , locations: []};
          for(var j = 0; j < tresult[i].locations.length; j++) {
            for(var k = 0; k < lresult.length; k++) {
              if (tresult[i].locations[j] == lresult[k].locationID) {
                obj.locations.push(lresult[k]);
              }
            }
          }
          result.push(obj);
        }*/
        //console.log(result);
        res.json(result); //return documents from Database
      })
    })
  })
});

router.get('/getAll', function(req, res, next) 
{
  //Connect to the mongodb database and retrieve all docs
  client.connect(function(err) 
  {
  
    const db = client.db(dbName); //Database
    const tcollection = db.collection(toursCollection); //Collection
    const lcollection = db.collection(locationsCollection); //Collection

    // Find all documents
    var tresult = [];
    var lresult = [];
    tcollection.find({}).toArray(function(err, docs) 
    {
      tresult = docs;

      lcollection.find({}).toArray(function(err, docs2) 
      {
        lresult = docs2;
        var result = [];
        
        for(var i = 0; i < tresult.length; i++) {
          var obj = {tour: tresult[i].tourID , locations: []};
          for(var j = 0; j < tresult[i].locations.length; j++) {
            for(var k = 0; k < lresult.length; k++) {
              if (tresult[i].locations[j] == lresult[k].locationID) {
                obj.locations.push(lresult[k]);
              }
            }
          }
          result.push(obj);
        }
        //console.log(result);
        res.json(result); //return documents from Database
      })
    })
  })
});
module.exports = router; //export as router
