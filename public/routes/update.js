var express = require('express'); //get express
const app = express(); //use express
var router = express.Router(); //get router
const assert = require('assert'); 

//Here we are configuring express to use body-parser as middle-ware
app.use(express.json());
app.use(express.urlencoded());

//MongoConnect
//-------------->>>>Hier muss die passende Datenbank und die passende Collection angegeben werden!!!!!<<<<--------------
const url = 'mongodb://localhost:27017' // connection URL
const dbName = 'tourguidedb' // database name
const collectionName = 'locations' // collection name
//----------------------------------------------------------------------------------------------------------------------
const MongoClient = require('mongodb').MongoClient
const client = new MongoClient(url) // mongodb client

//Post Router
router.post('/updateLocation', function(req, res, next) 
{
  var GeoJsonString = '{' + '"type": "FeatureCollection"' + ',' + '"features":' + '[' + '{' + '"type": "Feature"' + ',' +
        '"properties":' +  '{' + '"Name":' + '"' + req.body.newName + '"' + ',' 
                               + '"URL":' + '"' + req.body.newURL + '"' + ',' 
                               + '"Description":' + '"' + req.body.newDescription + '"' + '}' + ',' 
                               + '"geometry":' + req.body.newGeometry + '}' + ']' + '}';
  //console.log(req);
  var newNameID = req.body.newName;
  var oldNameID = req.body.oldNameID;
  var newGeoJson = JSON.parse(GeoJsonString);

  //connect to the mongodb database and insert one new element
  client.connect(function(err) 
  {
    const db = client.db(dbName) //database
    const collection = db.collection(collectionName) //collection

    //check if exists
    collection.find({nameID: oldNameID}).toArray(function(err, docs) 
    {
      if(docs.length >= 1) {
          //Update the document in the database
          collection.updateOne({nameID: oldNameID}, {$set:{nameID: newNameID, GeoJson: newGeoJson}}, function(err, result) 
          {
          })
          res.sendFile(__dirname + "/done.html") //redirect after Post
          return;
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

