var express = require('express'); //get express
var router = express.Router(); //use express
const assert = require('assert');

//MongoConnect
//-------------->>>>Hier muss die passende Datenbank und die passende Collection angegeben werden!!!!!<<<<--------------
const url = 'mongodb://localhost:27017' // connection URL
const dbName = 'tourguidedb' // database name
const collectionName = 'locations' // collection name

//----------------------------------------------------------------------------------------------------------------------
const MongoClient = require('mongodb').MongoClient //Client for MongoDB
const client = new MongoClient(url) // mongodb client

//get Documents
router.get('/getAll', function(req, res, next) 
{
  //Connect to the mongodb database and retrieve all docs
  client.connect(function(err) 
  {
  
    const db = client.db(dbName); //Database
    const collection = db.collection(collectionName); //Collection

    // Find all documents
    var result = [];
    collection.find({}).toArray(function(err, docs) 
    {
      res.json(docs); //return documents from Database
    })
  })
});
module.exports = router; //export as router
