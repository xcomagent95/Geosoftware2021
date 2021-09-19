// const { expect } = require("chai");
let got = require("got");
let port = 3000;


describe ("Routing test", () =>
{
    let urlMap = `http://localhost:${port}/map`;

    test("/add route: return status 200", async () =>
       {
            const answer = await got(urlMap);
            console.log(answer.statusCode);
            expect(answer.statusCode).toBe(200);
       })
})
