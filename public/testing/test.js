// To run this file, the user first has to start the server (npm start) and second run 'npm test'

let got = require("got");
let port = 3000;
let keys = require("./weather_key.json"); // This will import a working api key for the weather api in form of a json {"apiKey":"..."}

//const getAllfromDB =  require("../js/map");

describe ("Routing test", () =>
{
    // This test checks, whether the routing to map.html works well
    test("/Map route: return status 200", async () =>
    {
        let urlMap = `http://localhost:${port}/map`;
        const answer = await got(urlMap);
        expect(answer.statusCode).toBe(200);
    });

    // This test checks, whether the routing to editor.html works well
    test("/Editor route: return status 200", async () =>
    {
        let urlEditor = `http://localhost:${port}/editor`; // API variable
        const answer = await got(urlEditor);
        expect(answer.statusCode).toBe(200);
    });

    // This test checks, whether the routing to editor.html works well
    test("/Impressum route: return status 200", async () =>
    {
        let urlImpressum = `http://localhost:${port}/impressum`;
        const answer = await got(urlImpressum);
        expect(answer.statusCode).toBe(200);
    });
});

describe ("API test", () =>
{
    // This test will check whether the bus api from the map.js works
    test("/Bus-API returns result", async() =>
    {
        var busAPI = "https://rest.busradar.conterra.de/prod/haltestellen";
        let result = await got(busAPI);
        expect(result.statusMessage).toBe("OK");
    });

    // This test checks whether the weather-API from the map.js works
    test("/Weather-API returns result", async() =>
    {
        let lat = 51.9980888759729; // These are example coodrinates 
        let lon = 7.630158418673886;
        var weatherAPI = `https://api.openweathermap.org/data/2.5/onecall?units=metric&lat=${lat}&lon=${lon}&exclude=hourly&appid=${keys.apiKey}`;
        let weatherResult = await got(weatherAPI);
        expect(weatherResult.statusMessage).toBe("OK");
    });
});
