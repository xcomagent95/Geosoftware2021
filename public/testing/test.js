// const { expect } = require("chai");
let got = require("got");
// let request = require("request");
let port = 3000;

/*let urlAdd = `http://localhost:${port}/map`;

async function start(){
    try {
        const response = await got(urlAdd);
        console.log(response.statusCode);
        return response.body;
    }
    catch(error) {
        console.log("test2");
        return error;
    }
    
}
start();

console.log("test");*/

/*describe ("TEST", () => 
{
    test("NOW TRUE TEST", async() =>
    {
        const res = [];
        request('http://www.google.com', function (error, response, body) {
            //console.error('error:', error); // Print the error if one occurred
            //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.
            //res = response;
            expect(response.statusCode).to.equal(200);

        });

        //expect(response.statusCode).toBe(200);
    })
})*/


describe ("Routing test", () =>
{
    let urlMap = `http://localhost:${port}/map`;

    test("/add route: return status 200", async () =>
       {
            const answer = await got(urlMap);
            console.log(answer.statusCode);
            expect(answer.statusCode).toBe(200);
           /*request(urlMap, function (error, response, body) {
               expect(response.statusCode).to.equal(200);
           });
           const response = await got(urlAdd);
           console.log(response.statusCode);
           expect(response.statusCode).toBe(200);*/
       })
})
