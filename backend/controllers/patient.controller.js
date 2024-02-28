import { getPatientsRepo, createPatientRepo }
    from "../repositories/patient.repository.js";

const getPatients = async (req, res) => {
    try {
        const Patients = await getPatientsRepo();
        res.status(200).send(Patients);
    } catch (error) {
        res.status(500).send(`Error while getting patients: ${error}`);
    }
};

const createPatient = async (req, res) => {
    const payload = {...req.body};
    if(!payload.hasOwnProperty("nameLast")) {
        res.status(400).send("Missing required field: nameLast")
        return
    }
    if(!payload.hasOwnProperty("nameFirst")) {
        res.status(400).send("Missing required field: nameFirst")
        return
    }
    try {
        const Patient = await createPatientRepo(payload);
        res.status(200).send(Patient);
    } catch (e) {
        res.status(500).send(`Error while creating patient: ${e}`);
    }
};

export { getPatients, createPatient}