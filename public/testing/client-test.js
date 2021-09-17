const { expect } = require("chai");
let got = require("got");
let port = 3000;

describe ("Routing test", () =>
{
    let urlAdd = `http://localhost:${post}/add`;

    test("/add route: return status 200", async () =>
       {
           const response = await got(urlAdd)
           expect(response.statusCode).toBe(200)
       })

       
})
