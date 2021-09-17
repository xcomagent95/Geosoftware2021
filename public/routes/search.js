var express = require('express'); //require express
const app = express(); //initialize express app
var router = express.Router(); //initialize express-router

//Here we are configuring express to use body-parser as middle-ware
app.use(express.json());
app.use(express.urlencoded());

//MongoClient and DB
const url = 'mongodb://localhost:27017' // connection URL
//const url = 'mongodb://mongo:27017' // connection URL
const dbName = 'tourguidedb' // database name
const locationsCollection = 'locations' // collection containing the locations
const toursCollection = 'tours' // collection containing the tours
const MongoClient = require('mongodb').MongoClient;
const { stringify } = require('querystring'); 
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
    const tcollection = db.collection(toursCollection); //tours collection
    const lcollection = db.collection(locationsCollection); //locations collection

    // Find all documents
    var tresult = []; //tour result
    var lresult = []; //location result
    tcollection.find({}).toArray(function(err, docs) 
    {
      tresult = docs; //store tours

      lcollection.find({}).toArray(function(err, docs2) 
      {
        lresult = docs2; //store locations
        var result = [];
        result[0] = lresult;
        result[1] = tresult; 
        res.json(result); //return combines result
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
    const tcollection = db.collection(toursCollection); //tours collection
    const lcollection = db.collection(locationsCollection); //locations collection

    // Find all documents
    var tresult = []; //tour result
    var lresult = []; //location result
    tcollection.find({}).toArray(function(err, docs) 
    {
      tresult = docs; //store tours

      lcollection.find({}).toArray(function(err, docs2) 
      {
        lresult = docs2; //store locations
        var result = []; //initialize result
        
        for(var i = 0; i < tresult.length; i++) {  //iterate over tours
          var obj = {tour: tresult[i].tourID , locations: []}; //build combines object
          for(var j = 0; j < tresult[i].locations.length; j++) { //iterate over locations in tour
            for(var k = 0; k < lresult.length; k++) { //iterate over locations
              if (tresult[i].locations[j] == lresult[k].locationID) { //if location is in tour
                obj.locations.push(lresult[k]); //push location into combined object
              }
            }
          }
          result.push(obj); //push result into result
        }
        //console.log(result);
        res.json(result); //return documents from Database
      })
    })
  })
});
module.exports = router; //export as router