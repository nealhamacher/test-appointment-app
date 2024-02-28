import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const port = 8000;
const app = express();
const prisma = new PrismaClient();


app.use(cors({origin: "*", methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]}));
app.use(bodyParser.urlencoded({extended: false }));
app.use(bodyParser.json());

/**
 * Listen for input
 */
app.listen(port, () => {
    console.log(`Backend listening on port #${port}`);
});

//TODO: Move routes to separate file(s), error checking throughout, should 
//      change npiNumber and clinicianID to same variable name
/***************** PATIENT ROUTES *********************************************/

/**
 * Create operation for a patient
 */
app.post('/patient', async (req, res) => {
    const payload = {...req.body}
    const result = await prisma.patient.create({
        data: payload
        //TODO: Error checking on clinicianID (if not null)
    });
    res.status(200).json(result);
    return;
})

/**
 * Read operation for all patients
 */
app.get('/patient', async(req, res) => {
    const patients = await prisma.patient.findMany();
    res.status(200).json(patients).send();
    return;
});

/**
 * Read operation for a single patient
 */
app.get('/patient/:id', async(req, res) => {
    const { id } = req.params;
    try {
        const patient = await prisma.patient.findUnique({
            where: {
                patientID: Number(id)
            }
        });
        res.status(200).json(patient);
    } catch(error) {
        res.status(500).send(`Error: ${error}`);
        return;
    }
});

/**
 * Update operation for a patient
 */
app.patch('/patient/:id', async(req, res) => {
    //TODO: Error checking
    const { id } = req.params;
    const payload = { ...req.body };
    if(payload.hasOwnProperty('clinicianID')) {
        payload.clinicianID = Number(payload.clinicianID);
    }
    //TODO: Check payload for appropriate params, only update ones needed
    const result = await prisma.patient.update({
        where: {
            patientID: Number(id)
        },
        data: payload
    });
    res.status(200).send(result);
    return;
});


/**
 * Delete operation for a patient
 */
app.delete('/patient/:id', async(req, res) => {
    const { id } = req.params;
    try {
        const result = await prisma.patient.delete({
            where: {
                patientID: Number(id)
            }
        });
        res.status(200).json(result);
        return;
    } catch(error) {
        res.status(404).send(`Error: ${error}`);
        return;
    }
});

/***************** CLINICIAN ROUTES *******************************************/

/**
 * Create operation for a clinician
 */
app.post('/clinician', async(req, res) => {
    const request = {...req.body};
    if(!request.hasOwnProperty('npiNumber')) {
        res.status(400).send('Missing NPI Number');
        return;
    }
    if(request.npiNumber.length != 10) {
        res.status(400).send('NPI Number must be 10 digits long');
        return;
    }
    const response = await axios.get(
        `https://npiregistry.cms.hhs.gov/api/?number=${request.npiNumber}&version=2.1`);
    if(response.data.result_count == 0) {
        res.status(404).send('No clinician found with given NPI number');
        return;
    }
    const payload = {...response.data.results[0]}
    console.log(payload);

    try {
        const result = await prisma.clinician.create({
            data: {
                npiNumber: Number(request.npiNumber),
                nameFirst: payload.basic.first_name,
                nameLast: payload.basic.last_name,
                state: payload.addresses[0].state 
                //May want to ensure that entered state is location
            }
        });
        res.status(200).send(result);
        return;
    } catch(error) {
        res.status(500).send(`Error: ${error}`);
        return;
    };
})

/**
 * Read operation for all clinicians
 */
app.get('/clinician', async(req, res) => {
    const clinicians = await prisma.clinician.findMany();
    res.status(200).json(clinicians);
    return;
});

/**
 * Read operation for a single clinician
 */
app.get('/clinician/:id', async(req, res) => {
    const { id } = req.params;
    try {
        const clinician = await prisma.clinician.findUnique({
            where: {
                npiNumber: Number(id)
            }
        });
        if(clinician == null) {
            res.status(404).send(`Clinician with NPI Number ${id} not found`);
            return;
        }
        res.status(200).json(clinician);
        return;
    } catch(error) {
        res.status(500).send(`Error: ${error}`);
        return;
    }
});

/***************** APPOINTMENT ROUTES *****************************************/

/** 
 * Create operation for an appointment
 */
app.post('/appointment', async(req, res) => {
    try {
        const payload = {...req.body};
        //Input checking - probably could be broken into separate function?
        if(!payload.hasOwnProperty('clinicianID')) {
            res.status(400).send("Missing clinician ID (NPI number)");
            return;
        };
        if(!payload.hasOwnProperty('patientID')) {
            res.status(400).send("Missing patient ID number");
            return;
        };
        if(!payload.hasOwnProperty('date')) {
            res.status(400).send("Missing date of appointment");
            return;
        };

        const patient = await prisma.patient.findUnique({
            where: {
                patientID: Number(payload.patientID)
            }
        });
        if (patient == null) {
            res.status(404).send(`Patient with ID Number ${payload.patientID} not in system`);
            return;
        }

        const clinician = await prisma.clinician.findUnique({
            where: {
                npiNumber: Number(payload.clinicianID)
            }
        });
        if(clinician == null) {
            res.status(404).send(`Clinician with NPI Number ${payload.clinicianID} not in system`);
            return;
        };

        const result = await prisma.appointment.create({
            data: {
                patientID: Number(payload.patientID),
                clinicianID: Number(payload.clinicianID),
                date: payload.date            
            }
        });
        res.status(200).json(result);
        return; 
    } catch (error) {
        res.status(500).send(`Error: ${error}`);
        return;
    }
})

/**
 * Read operation for all appointments
 */
app.get('/appointment', async(req, res) => {
    const appointments = await prisma.appointment.findMany();
    res.status(200).json(appointments);
    return;
});

/**
 * Read operation for all appointments for a single patient
 */
app.get('/appointment/patient/:id', async(req, res) => {
    const { id } = req.params;
    try {
        //TODO: could probably be in separate function with getter for patient
        const patient = await prisma.patient.findUnique({
            where: {
                patientID: Number(id)
            }
        });
        if(patient == null) {
            res.status(404).send(`Patient with ID Number ${id} not in system`);
            return;
        }
        const appointments = await prisma.appointment.findMany({
            where: {
                patientID: Number(id)
            }
        })
        res.status(200).json(appointments);
        return;
    } catch(error) {
        res.status(500).send(`Error: ${error}`);
        return;
    }
});

/**
 * Read operation for all appointments for a single clinician
 */
app.get('/appointment/clinician/:id', async(req, res) => {
    const { id } = req.params;
    try {
        const clinician = await prisma.clinician.findUnique({
            where: {
                npiNumber: Number(id)
            }
        });
        if(clinician == null) {
            res.status(404).send(`Clinician with NPI Number ${id} not in system`);
            return;
        };
        const appointments = await prisma.appointment.findMany({
            where: {
                clinicianID: Number(id)
            }
        });
        res.status(200).json(appointments);
        return;
    } catch(error) {
        res.status(500).send(`Error: ${error}`);
        return;
    }
});