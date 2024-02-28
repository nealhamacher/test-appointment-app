import schema from "../models/model.js";
import db from "../database/db.js"

/**
 * Get all patients from repo
 * @returns 
 */
const getPatientsRepo = async () => {
    try {
        let sqlQuery = 'SELECT * FROM patient'
        let data = db.all(sqlQuery, [], (error, rows) => {
            if (error) {
                throw Error(error)
            }
            else {
                rows.forEach(row => {
                    console.log(row);
                })  
            }
        });
        console.log(data);
        return data;
        
    } catch (error) {
        throw Error(error)
    }
}

const createPatientRepo = async (payload, callback) => {
    try {
        console.log(payload)
        let sqlQuery = `INSERT INTO patient (nameLast, nameFirst, 
            clinicianPrimary) VALUES ('${payload.nameLast}', '${payload.nameFirst}', 
            ${payload.clinicianPrimary})`
        console.log(sqlQuery)
        db.run(sqlQuery, callback)    
        return "success";
    }
    catch (error) {
        throw Error(error)
    }
};


export { getPatientsRepo, createPatientRepo } 