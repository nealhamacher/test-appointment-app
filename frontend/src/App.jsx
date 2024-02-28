import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios'

import Table from 'react-bootstrap/Table';

//TODO (Major): Implement react-query or similar for loading screen, implement
//              date range filter and state management, styling, commenting, 
//              more efficient parsing of appointments (patient & clinician name)
function App() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [clinicians, setClinicians] = useState([]);

  //Get patients from backend
  useEffect (() => {
    const getPatientsFromBackend = async() => {
      const response = await axios.get('http://localhost:8000/patient');
      setPatients(response.data);
    };
    getPatientsFromBackend(); 
  }, []);

  //Get clinicians from backend
  useEffect (() => {
    const getCliniciansFromBackend = async() => {
      const response = await axios.get('http://localhost:8000/clinician');
      setClinicians(response.data);
    };
    getCliniciansFromBackend(); 
  }, []);

  //Get appointments from backend
  useEffect (() => {
    const getAppointmentsFromBackend = async() => {
      const response = await axios.get('http://localhost:8000/appointment');
      setAppointments(response.data);
    };
    getAppointmentsFromBackend(); 
  }, []);


  const findPatientName = ((id) => {
    const patient = patients.find((e) => e.patientID == id);
    const name = `${patient.nameLast}, ${patient.nameFirst}`;
    console.log(name)
    return name;
  });

  const findClinicianName = ((id) => {
    const clinician = clinicians.find((e) => e.npiNumber == id);
    const name = `${clinician.nameLast}, ${clinician.nameFirst}`;
    return name;
  });

  return(
    <div classname='body_main'>
      <h1 id='hdr_main'>Appointment Table</h1>
      <Table>
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Patient Name</th>
            <th>Clinician ID</th>
            <th>Clinician Name</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(appointment => (
            <tr>
              <td>{appointment.patientID}</td>
              <td>{findPatientName(appointment.patientID)}</td>
              <td>{appointment.clinicianID}</td>
              <td>{findClinicianName(appointment.clinicianID)}</td>
              <td>{appointment.date}</td>
              <td>{(appointment.status == 0) ? 'Not complete' : "complete"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

export default App;
