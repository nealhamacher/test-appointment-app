import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import sqlite3 from 'sqlite3';
import patientRouter from './routes/patient.route.js';

const app = express();
const port = 8000;

app.use(cors({origin: "*", methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]}));
app.use(bodyParser.urlencoded({extended: false }));
app.use(bodyParser.json());

const db = new sqlite3.Database('./database/appointmentDB.db');

db.on('open', () => {
    console.log('Database is ready.');
});

app.use('/patients', patientRouter);

app.listen(port, () => {
    console.log(`Backend listening on port #${port}`);
});