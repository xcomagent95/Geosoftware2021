const express = require('express'); //require for express
const app = express(); //create express app
const port = 3000;

//Parser for Request
app.use(express.json());
app.use(express.urlencoded());

//Routers
var searchRouter = require('./public/routes/search.js'); //require search router
var addRouter = require('./public/routes/add.js'); //require add router
var updateRouter = require('./public/routes/update.js'); //require update router
var deleteRouter = require('./public/routes/delete.js'); //requiredelete router

//Folders
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

//Usages (mainly routers)
app.use('/search', searchRouter);
app.use('/add', addRouter);
app.use('/update', updateRouter);
app.use('/delete', deleteRouter);

//Gets
app.get("/map", (req, res) => { res.sendFile(__dirname + "/public/map.html"); });
app.get("/editor", (req, res) => { res.sendFile(__dirname + "/public/editor.html"); });
app.get("/impressum", (req, res) => { res.sendFile(__dirname + "/public/impressum.html"); });

//Listener
app.listen(port, () => {
    console.log(`>Server started`);
	console.log(`>Example app listening at http://localhost:${port}`); test
    }
);
