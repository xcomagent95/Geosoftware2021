var locations;
var tours;

function getAllfromDB() { 
    {$.ajax({ //handle request via ajax
        url: "/search/getCollections", //request url is the prebuilt request
        method: "GET", //method is GET since we want to get data not post or update it
        })
        .done(function(res) { //if the request is done -> successful
            locations = res[0];
            tours = res[1];
            fillTables();
            console.log(locations);
        })
        .fail(function(xhr, status, errorThrown) { //if the request fails (for some reason)
            console.log("Request has failed :(", '/n', "Status: " + status, '/n', "Error: " + errorThrown); //we log a message on the console
            return;
        })
        .always(function(xhr, status) { //if the request is "closed", either successful or not 
            console.log("Request completed"); //a short message is logged
            return; 
        })
    }
}  
getAllfromDB();

/**
 * @function {fillTable} - 
 * @param {} data - 
 * @param {Srtring} table - Gets the id of a table
 * @param {} field - 
 */
function fillTables() {
    var locationsTable = document.getElementById('locationsTableBody');
    var toursTable = document.getElementById('toursTableBody');
    var locationsTableData = []; //initialise tabledata as array
    var toursTableData = []; //initialise tabledata as array
    for(var i = 0; i < locations.length; i++) { //iterate over the paths
        locationsTableData.push(locations[i].nameID); //push aggregated paths into table data array
    }
    for(var i = 0; i < tours.length; i++) { //iterate over the paths
        toursTableData.push(tours[i].tourName); //push aggregated paths into table data array
    }

    //fill the table with the paths
    for(var i = 0; i < locationsTableData.length; i++) { //iterate over table data
        //initialise table row as variable
        var row =  `<tr><td>${locationsTableData[i]}</td></tr>`
        locationsTable.innerHTML += row; //pass row to given table
    }
    //fill the table with the paths
    for(var i = 0; i < toursTableData.length; i++) { //iterate over table data
        //initialise table row as variable
        var row =  `<tr><td>${toursTableData[i]}</td></tr>`
        toursTable.innerHTML += row; //pass row to given table
    }
}