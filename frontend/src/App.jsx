import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios'

import Table from 'react-bootstrap/Table';

function App() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [clinicians, setClinicians] = useState([]);

  //Get appointments from backend
  useEffect (() => {
    const getAppointmentsFromBackend = async() => {
      const response = await axios.get('http://localhost:8000/appointment');
      setAppointments(response.data);
    };
    getAppointmentsFromBackend(); 
  }, []);

  useEffect (() => {
    const getPatientsFromBackend = async() => {
      const response = await axios.get('http://localhost:8000/patient');
      setPatients(response.data);
    };
    getPatientsFromBackend(); 
  }, []);

  useEffect (() => {
    const getCliniciansFromBackend = async() => {
      const response = await axios.get('http://localhost:8000/clinician');
      setClinicians(response.data);
    };
    getCliniciansFromBackend(); 
  }, []);

  const findPatientName = ((id) => {
    const patient = patients.find((e) => e.patientID == id);
    const name = `${patient.nameLast}, ${patient.nameFirst}`;
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
