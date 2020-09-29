import {DatabaseManager} from "./database-manager";

export class ValveTable {
    "id": number;
    "valveFlow": boolean;
    "fluid": number; 
    "valveID": number;
}

export class DataManager {
    public static AddRow(valveFlow: boolean, fluid: number, valveID: number): Promise<String | null> {
        return new Promise((res, rej) => {
            DatabaseManager.dbQuery("INSERT INTO valves (valveFlow, fluid, valveID) VALUES (?, ?, ?)", [valveFlow, fluid, valveID]).then((returnedData) => {
                if (returnedData.length == 0) {
                    res(null);
                    return;
                }
                console.log(returnedData);
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
                console.log(UUID);
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

                    let table:ValveTable = <ValveTable>returnedData[0];
                    table.valveFlow = (<any>returnedData[0]).valveFlow == 1;
                    res(<ValveTable>returnedData[0]);
                });
            });
        });
    }

    public static EditRow(UUID: String, data: {"valveFlow"?: boolean, "fluid"?: number, "valveID"?: number}): Promise<boolean> {
        return new Promise((res, rej) => {
            this.GetRow(UUID).then((returnedData) => {
                if (returnedData == null) {
                    res(false);
                    return;
                }

                let valveFlow = ((data.valveFlow != undefined)? data.valveFlow : returnedData.valveFlow)? 1 : 0; //converts to tinyint for the database
                let fluid = (data.fluid != undefined)? data.fluid : returnedData.fluid;
                let valveID = (data.valveID != undefined)? data.valveID : returnedData.valveID;

                DatabaseManager.dbQuery("UPDATE valves SET valveFlow=?, fluid=?, valveID=? WHERE id=?", [valveFlow, fluid, valveID, returnedData.id]).then(() => {
                    res(true);
                    return;
                });
            });
        });
    }
}