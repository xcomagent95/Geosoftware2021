let got = require("got");
let port = 3000;
let urlAdd = `http://localhost:${port}/map`;
const response = await got(urlAdd);
console.log(response.statusCode);