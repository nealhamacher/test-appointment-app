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

//TODO: Move routes to separate file(s), error checking throughout
/***************** PATIENT ROUTES *********************************************/

/**
 * Create operation for a patient
 */
app.post('/patient', async (req, res) => {
    const payload = {...req.body}
    const result = await prisma.patient.create({
        data: payload
    });
    res.json(result);
})

/**
 * Read operation for all patients
 */
app.get('/patient', async(req, res) => {
    const patients = await prisma.patient.findMany();
    res.status(200).json(patients);
});

/**
 * Read operation for a single patient
 */
app.get('/patient/:id', async(req, res) => {
    const { id } = req.params;
    console.log("Received");
    try {
        const patient = await prisma.patient.findUnique({
            where: {
                patientID: Number(id)
            }
        });
        res.status(200).json(patient);
    } catch(error) {
        res.status(500).send(`Error: ${error}`);
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
        res.json(result);
    } catch(error) {
        res.status(404).send(`Error: ${error}`);
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
    }
    if(request.npiNumber.length != 10) {
        res.status(400).send('NPI Number must be 10 digits long');
    }
    const response = await axios.get(
        `https://npiregistry.cms.hhs.gov/api/?number=${request.npiNumber}&version=2.1`);
    if(response.data.result_count == 0) {
        res.status(404).send('No clinician found with given NPI number');
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
            }
        });
        res.status(200).send(result);
    } catch(error) {
        res.status(500).send(`Error: ${error}`);
    };
})

/**
 * Read operation for all clinicians
 */
app.get('/clinician', async(req, res) => {
    const clinicians = await prisma.clinician.findMany();
    res.status(200).json(clinicians);
});

/**
 * Read operation for a single patient
 */
app.get('/clinician/:id', async(req, res) => {
    const { id } = req.params;
    console.log("Received");
    try {
        const clinician = await prisma.clinician.findUnique({
            where: {
                npiNumber: Number(id)
            }
        });
        res.status(200).json(clinician);
    } catch(error) {
        res.status(500).send(`Error: ${error}`);
    }
});

/***************** APPOINTMENT ROUTES *****************************************/