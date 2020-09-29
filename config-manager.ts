import fs = require("fs");

export class Config {
    "database": {
        "host": string,
        "user": string,
        "password": string,
        "databaseName": string
    }
    "fluids": string[];
}
export class ConfigManager {
    static config: Config;

    static loadConfig(path: string) {
        if (fs.existsSync(path)) {
            this.config = JSON.parse(fs.readFileSync(path).toString());
        } else {
            this.createConfigFile(path);
        }
    }

    private static createConfigFile(path: string) {
        let newConfig:Config = new Config();
        newConfig.database = {"host": "localhost", "user": "root", "password": "", "databaseName": "qr_valve_data"};
        newConfig.fluids = ["water","petrolium", "crude oil"];
        fs.writeFileSync(path, JSON.stringify(newConfig, null, "\t"));
    }
}