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

// Import the ConfigManager class and load all the configs for the project
import {ConfigManager} from "./config-manager";
ConfigManager.loadConfig("serverConfig.json");

import {DatabaseManager} from "./database-manager";
DatabaseManager.initializeDatabase();

import {DataManager} from "./data-manager";


server.listen(argv.port, () => {
    console.log(`Listening on port *${argv.port}`);
});

app.get("/", (req, res) => {
    fs.readFile(__dirname + "/index.html", (err, html) => {
        res.send(ejs.render(html.toString()));
    });

    DataManager.EditRow("1NZHW7RWMNIEQ9L", {"valveFlow": false}).then((data) => {
        console.log(data);
        DataManager.GetRow("1NZHW7RWMNIEQ9L").then((data) => {
            console.log(data);
        })
    });
});

//Scanned qr codes get linked here
app.get("/decode/:UUID", (req, res) => {
    fs.readFile(__dirname + "/decode.html", (err, html) => {
        //:UUID is the UUID of the specified table row;

        DataManager.GetRow(req.params["UUID"]).then((rowData) => {
            let dataString = (JSON.stringify(rowData));
            let data = JSON.parse(dataString.substring(dataString.indexOf("{")));
            delete data.id;

            //put the data into desired html file using ejs
            res.send(ejs.render(html.toString(), {"data": JSON.stringify(data)}));
        });
    });
});

app.post("/encode", (req, res) => {
    //Get data from post: req.body.value
    DataManager.AddRow(req.body.valveFlow, req.body.fluid, req.body.valveID).then((UUID) => {
        res.send(UUID);
    });
});

app.post("/update", (req, res) => {
    let data:{"valveFlow"?: boolean, "fluid"?: number, "valveID"?: number} = {};
    if (req.body.valveFlow != undefined) {
        data.valveFlow = req.body.valveFlow;
    }
    if (req.body.fluid != undefined) {
        data.fluid = req.body.fluid;
    }
    if (req.body.valveID != undefined) {
        data.valveID = req.body.valveID;
    }

    DataManager.EditRow(req.body.UUID, data).then((success) => {
        res.send(success);
    })
});

function base64Decode(base64: string): string {
    return Buffer.from(base64, 'base64').toString('ascii');
}