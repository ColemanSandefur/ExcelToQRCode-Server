import mysql = require("mysql");
import {ConfigManager} from "./config-manager";

var con = mysql.createConnection({
    host: ConfigManager.config.database.host,
    user: ConfigManager.config.database.user,
    password: ConfigManager.config.database.password
});

con.connect((err) => {
    if (err) {
        throw err
    };
    
    console.log("Connected to the database server!");
});

export class DatabaseManager{
    private static con = con;

    static initializeDatabase() {
        this.dbQuery(`CREATE DATABASE IF NOT EXISTS ${ConfigManager.config.database.databaseName}`).then(() => { // creates a database with the databaseName given in serverConfig.json
            con.changeUser({database: ConfigManager.config.database.databaseName}, (err) => { // starts using the database with the databaseName given
                if (err) throw err;

                //Creates a table for storing data if it doesn't already exist
                this.dbQuery("CREATE TABLE IF NOT EXISTS `valves` (`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,`valveFlow` TINYINT UNSIGNED NOT NULL DEFAULT 0,`fluid` INT NOT NULL DEFAULT -1,`valveID` INT NOT NULL,PRIMARY KEY (`id`),UNIQUE INDEX `id_UNIQUE` (`id` ASC), UNIQUE INDEX `valveID_UNIQUE` (`valveID` ASC));");
                this.dbQuery("CREATE TABLE IF NOT EXISTS `id_manager` (`UUID` VARCHAR(15) NOT NULL,`valve_row_id` INT UNSIGNED NOT NULL,PRIMARY KEY (`UUID`),UNIQUE INDEX `UUID_UNIQUE` (`UUID` ASC),UNIQUE INDEX `valve_row_id_UNIQUE` (`valve_row_id` ASC));");
                
                console.log(`connected to the ${ConfigManager.config.database.databaseName} database`);
            });
        });
    }

    //Used to query data from the database
    static dbQuery(query: string, data?: any[]): Promise<RowPacket[]> {
        return new Promise(function (res, rej) {
            DatabaseManager.con.query(query, data, function (err, result) {
                if (err) rej(err);
                else res(result);
            });
        });
    }
}

export interface RowPacket {
    [key: string]: any;
}