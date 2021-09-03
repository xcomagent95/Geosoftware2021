const express = require('express'); //require for express
const app = express(); //create express app
const port = 3000; //define port via which the application will be accessable

//Parser for Requests
app.use(express.json()); 
app.use(express.urlencoded());

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
        console.log(`> Server started`);
        console.log(`> Tourguide app listening at http://localhost:${port}`);
        console.log(`> Landingpage: http://localhost:${port}/`);
        console.log(`> Tourguide: http://localhost:${port}/map`);
        console.log(`> Location- and Toureditor: http://localhost:${port}/editor`);
        console.log(`> Impressum: http://localhost:${port}/impressum`)
    }
);
