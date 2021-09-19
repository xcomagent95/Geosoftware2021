"use strict"

const express = require('express'); //require for express
const app = express(); //create express app
const port = 3000; //define port via which the application will be accessable
const bodyParser = require('body-parser'); 

let got = require("got");
const { expect } = require("chai");
async function test () {
    let port = 3000;
    let urlMap = `http://localhost:${port}/map`;
    const {req} = await got(urlMap);
    console.log(req.res.statusCode);
}
let urlMap = `http://localhost:${port}/map`;

test("/add route: return status 200", async () =>
   {
        const {answer} = await got(urlMap);
        expect(answer.res.statusCode).toBe(200);
           /*request(urlMap, function (error, response, body) {
               expect(response.statusCode).to.equal(200);
           });
           const response = await got(urlAdd);
           console.log(response.statusCode);
           expect(response.statusCode).toBe(200);*/
    })


//Parser for Requests
app.use(express.json()); 
app.use(express.urlencoded());

// Loggers
var JL = require('jsnlog').JL;
var jsnlog_nodejs = require('jsnlog-nodejs').jsnlog_nodejs;

//Routers
var searchRouter = require('./public/routes/search.js'); //require search router
app.use('/search', searchRouter); //instruct the server to use the router
       
var addRouter = require('./public/routes/add.js'); //require add router
app.use('/add', addRouter); //instruct the server to use the router 

var updateRouter = require('./public/routes/update.js'); //require update router
app.use('/update', updateRouter); //instruct the server to use the router

var deleteRouter = require('./public/routes/delete.js'); //require delete router
app.use('/delete', deleteRouter); //instruct the server to use the router

//Folders
app.use(express.static(__dirname + '/public')); //define public folder
app.use(express.static(__dirname + '/node_modules')); //define node_modules folder

//Gets for webpages to be hosted
app.get("/", (req, res) => { res.sendFile(__dirname + "/public/landing.html"); });
app.get("/map", (req, res) => { res.sendFile(__dirname + "/public/map.html"); });
app.get("/editor", (req, res) => { res.sendFile(__dirname + "/public/editor.html"); });
app.get("/impressum", (req, res) => { res.sendFile(__dirname + "/public/impressum.html"); });

//Listener
app.listen(port, () => {
    JL("").info("---------------------------------------------------------------------------------------------------------------");
    JL("ServerLogs").info("> Server started");
    JL("ServerLogs").info("> Tourguide app listening at http://localhost:${port}");
    JL("ServerLogs").info("> Landingpage: http://localhost:${port}/");
    JL("ServerLogs").info("> Tourguide: http://localhost:${port}/map");
    JL("ServerLogs").info("> Location- and Toureditor: http://localhost:${port}/editor");
    JL("ServerLogs").info("> Impressum: http://localhost:${port}/impressum");
    JL("").info("---------------------------------------------------------------------------------------------------------------");
});

// parse application/json.
// Log messages from the client use POST and have a JSON object in the body.
// Ensure that those objects get parsed correctly.
app.use(bodyParser.json())

// jsnlog.js on the client by default sends log messages to jsnlog.logger, using POST.
app.post('*.logger', function (req, res) 
{ 
    // console.log(req.url)
    // Process incoming log messages, by handing to the server side jsnlog.
    // JL is the object that you got at
    jsnlog_nodejs(JL, req.body)
    // Send empty response. This is ok, because client side jsnlog does not use response from server.
    res.send('')
})
