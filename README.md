# Test Appointment App  

This is a sample web app for a clinician and patient appointment tracking system.  This app cross-references the NPPES NPI Registry API (https://npiregistry.cms.hhs.gov/api-page) to verify clinicians information. NOTE: Clinicians used in this database were chosen at random, they are in no way affiliated with this application or its creator.
The backend is mostly complete but the frontend is very much a work in progress.  Uses vite (react), express (nodejs), and prisma ORM for sqlite database.  Requires npm and npx to run.

## To run  
<ol>
  <li>Clone the repo ( <strong>git clone https://github.com/nealhamacher/test-appointment-app</strong> )</li>
  <li> Backend: Navigate into the backend folder.  Run <strong>npm install</strong> in the command line to install dependencies. Run <strong>npx prisma generate --schema=./database/schema.prism</strong>. The backend can now be run by executing <strong>npm start</strong>. By default, the backend listens on port 8000. Get, Post, Patch, and Delete requests can be sent to a valid route using Postman (see <strong>/backend/index.js</strong> for routes </li>
  <li> Frontend: Navigate into the frontend folder. Run <strong>npm install</strong> and then enter <strong>npm run dev</strong> or <strong>npm start</strong> to startup frontend. Navigate to <strong>http://localhost:5173</strong> to view front-end page.</li>
</ol>
