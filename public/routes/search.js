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
    var result = [];
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
module.exports = router; //export as router
