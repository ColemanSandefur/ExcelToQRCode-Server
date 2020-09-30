import {DatabaseManager} from "./database-manager";
import {ConfigManager} from "./config-manager";

export class ValveTable {
    constructor(id?: number, valveFlow?: boolean, fluid?: string, valveID?: number) {
        this.id = id || 0;
        this.valveFlow = valveFlow || false;
        this.fluid = fluid || ConfigManager.config.fluids[0];
        this.valveID = valveID || 0;
    }
    "valveID": number;
    "id": number;
    "valveFlow": boolean;
    "fluid": string; 
    
}
export class EncodeValveTable {
    "id": number;
    "valveFlow": number;
    "fluid": number;
    "valveID": number;
}

export class DataManager {
    public static AddRow(valveFlow: boolean, fluid: string, valveID: number): Promise<String | null> {
        return new Promise((res, rej) => {
            let encoded = this.EncodeToDatabase({"id": 0, "valveFlow": valveFlow, "fluid": fluid, "valveID": valveID});
            DatabaseManager.dbQuery("INSERT INTO valves (valveFlow, fluid, valveID) VALUES (?, ?, ?)", [encoded.valveFlow, encoded.fluid, encoded.valveID]).then((returnedData) => {
                if (returnedData.length == 0) {
                    res(null);
                    return;
                }
                let rowID = (<any>returnedData).insertId;

                this.GenerateUniqueUUID(15).then((UUID) => {
                    DatabaseManager.dbQuery("INSERT INTO id_manager (UUID, valve_row_id) VALUES (?, ?)", [UUID, rowID]);
                    res(UUID);
                });
            });
        });
    }

    private static GenerateUniqueUUID(length: number): Promise<String> {
        return new Promise((res, rej) => {
            let UUID = this.GenerateUUID(length);
            this.UUIDExists(UUID).then((valExists) => {
                if (valExists) {
                    res(this.GenerateUniqueUUID(length));
                } else {
                    res(UUID);
                }
            })
        });
    }

    private static UUIDExists(UUID: String): Promise<boolean> {
        return new Promise((res, rej) => {
            DatabaseManager.dbQuery("SELECT * FROM id_manager WHERE UUID=?", [UUID]).then((returnedData) => {
                res(returnedData.length > 0);
            });
        });
    }

    private static GenerateUUID(length: number): String {
        let validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let output = "";

        for (let i = 0; i < length; i++) {
            output += validChars.charAt(Math.floor(Math.random() * validChars.length));
        }

        return output;
    }

    public static GetRow(UUID: String): Promise<ValveTable | null> {
        return new Promise((res, rej) => {
            DatabaseManager.dbQuery("SELECT * FROM id_manager WHERE UUID=?", [UUID]).then((returnedData) => {
                if (returnedData.length == 0) {
                    res(null);
                    return;
                }

                DatabaseManager.dbQuery("SELECT * FROM valves WHERE id=?", [returnedData[0].valve_row_id]).then((returnedData) => {
                    if (returnedData.length == 0) {
                        res(null);
                        return;
                    }

                    let table:ValveTable = this.DecodeFromDatabase(<EncodeValveTable>returnedData[0]);
                    res(table);
                });
            });
        });
    }

    public static EditRow(UUID: String, data: {"valveFlow"?: boolean, "fluid"?: string, "valveID"?: number}): Promise<boolean> {
        return new Promise((res, rej) => {
            this.GetRow(UUID).then((returnedData) => {
                if (returnedData == null) {
                    res(false);
                    return;
                }

                let valveFlow = ((data.valveFlow != undefined)? data.valveFlow : returnedData.valveFlow)
                let fluid = (data.fluid != undefined)? data.fluid : returnedData.fluid;
                let valveID = (data.valveID != undefined)? data.valveID : returnedData.valveID;

                let dataEncode = this.EncodeToDatabase(new ValveTable(returnedData.id, valveFlow, fluid, valveID));
                
                DatabaseManager.dbQuery("UPDATE valves SET valveFlow=?, fluid=?, valveID=? WHERE id=?", [dataEncode.valveFlow, dataEncode.fluid, dataEncode.valveID, dataEncode.id]).then(() => {
                    res(true);
                    return;
                });
            });
        });
    }

    private static EncodeToDatabase(table: ValveTable) {
        let encoded = new EncodeValveTable();

        encoded.id = table.id;
        if (ConfigManager.config.fluids.indexOf(table.fluid) == -1) {
            ConfigManager.addLiquids([table.fluid]);
        }
        encoded.fluid = ConfigManager.config.fluids.indexOf(table.fluid)
        encoded.valveFlow = (table.valveFlow == true)? 1 : 0;
        encoded.valveID = table.valveID;

        return encoded;
    }

    private static DecodeFromDatabase(table: EncodeValveTable) {
        let decoded = new ValveTable;

        decoded.id = table.id;
        decoded.valveID = table.valveID;
        decoded.fluid = ConfigManager.config.fluids[table.fluid];
        decoded.valveFlow = (table.valveFlow == 1)? true : false;

        return decoded;
    }
}