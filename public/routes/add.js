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
const MongoClient = require('mongodb').MongoClient;
const { stringify } = require('querystring');
const client = new MongoClient(url) // mongodb client

//Post Location
router.post('/newLocation', function(req, res, next) 
{
  //Check Request
  if(req.body.name == '' || req.body.url == '' || req.body.geometry == '') {
    res.sendFile(__dirname + "/error_empty_input.html")
    return;
  }

  console.log("Payload URL:", req.body.url);
  var description;


  //Crete Payload to Store
  var GeoJsonString = '{' + '"type": "FeatureCollection"' + ',' + '"features":' + '[' + '{' + '"type": "Feature"' + ',' +
        '"properties":' +  '{' + '"Name":' + '"' + req.body.name + '"' + ',' 
                               + '"URL":' + '"' + req.body.url + '"' + ',' 
                               + '"Description":' + '"' + description + '"' + '}' + ',' 
                               + '"geometry":' + req.body.geometry + '}' + ']' + '}';
  var nameID = req.body.name;
  var GeoJson = JSON.parse(GeoJsonString);

  //connect to the mongodb database and insert one new element
  client.connect(function(err) 
  {
    const db = client.db(dbName) //database
    const collection = db.collection(locationsCollection) //collection
    collection.find({nameID: req.body.name}).toArray(function(err, docs)
    {
        //assert.strictEqual(err, null)
        //check if name already exists
        if(docs.length >= 1){
          res.sendFile(__dirname + "/error_redundant_number.html");
          return;
        } 
        else {
          //Insert the document in the database
          collection.insertOne({GeoJson, nameID}, function(err, result) 
          {
            //assert.strictEqual(err, null)
            //assert.strictEqual(1, result.result.ok)
            res.sendFile(__dirname + "/done.html");
            return;
           })
        }
    })
  })
});

//Post Tours
router.post('/newTour', function(req, res, next) 
{
  //Check Request
  if(req.body.tour == '' || req.body.locations == '') {
    res.sendFile(__dirname + "/error_empty_input.html")
    return;
  }

  //Create Payload to Store
  var tourName = req.body.tour;
  var trimmedLocations = req.body.locations.substring(0, req.body.locations.length - 1);
  var locations = trimmedLocations.split(',');

  //connect to the mongodb database and insert one new element
  client.connect(function(err) 
  {
    const db = client.db(dbName) //database
    const collection = db.collection(toursCollection) //collection
    collection.find({tourName: req.body.tour}).toArray(function(err, docs)
    {
        //check if name already exists
        if(docs.length >= 1){
          res.sendFile(__dirname + "/error_redundant_number.html");
          return;
        } 
        else {
          //Insert the document in the database
          collection.insertOne({tourName,locations}, function(err, result) 
          {
            res.sendFile(__dirname + "/done.html");
            return;
           })
        }
    })
  })
});
module.exports = router; //export as router