//Main Imports
import express = require('express');
const app: express.Application = express();
import http = require("http");
const server = http.createServer(app);
import path = require("path");
import bodyParser = require("body-parser");
import ejs = require("ejs");
import fs = require("fs");
import yargs = require("yargs");

yargs.default({port: 3000});
const argv = yargs.argv;

//Adding directories
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "static")));

server.listen(argv.port, () => {
    console.log(`Listening on port *${argv.port}`);
});

app.get("/", (req, res) => {
    fs.readFile(__dirname + "/index.html", (err, html) => {
        res.send(ejs.render(html.toString()));
    });
});

//Scanned qr codes get linked here
app.get("/decode/:data", (req, res) => {
    fs.readFile(__dirname + "/decode.html", (err, html) => {
        //:data is in base64 we need to convert it back to ascii
        let data = base64Decode(req.params["data"]);

        //put the data into desired html file using ejs
        res.send(ejs.render(html.toString(), {"data": data}));
    });
});

function base64Decode(base64: string): string {
    return Buffer.from(base64, 'base64').toString('ascii');
}