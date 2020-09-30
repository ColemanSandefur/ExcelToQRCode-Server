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
    private static path: string;

    static loadConfig(path: string) {
        this.path = path;
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
        this.config = newConfig;
        fs.writeFileSync(path, JSON.stringify(newConfig, null, "\t"));
    }

    public static addLiquids(liquids: string[]) {
        liquids.forEach(liquid => {
            if (this.config.fluids.indexOf(liquid) == -1) {
                this.config.fluids.push(liquid);
            }
        });

        fs.writeFileSync(this.path, JSON.stringify(this.config, null, "\t"));
    }
}