var express = require('express');
var router = express.Router();

var db = require('./queries');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Arezue API' });
});

router.get('/api', function(req, res, next) {
  res.render('index', { title: 'Arezue API' });
});

// Temporarily get request for testing
router.get('/api/Users', db.getAllUsers);

// Create account for new jobseeker
router.post('/api/CreateAccount/jobseeker/', db.createJobseeker);

// Create account for new employer
router.post('/api/CreateAccount/employer/', db.createEmployer);

// Add a phone number to jobseeker's row
router.post('/api/Jobseeker/addPhoneNum', db.updatePhoneNum);

// Add a phone number to employer's row
router.post('/api/Employer/addPhoneNum', db.updatePhoneNum);

// Update potentialness of a jobseeker if they are seeking for a job
router.post('/api/Jobseeker/updatePotential', db.updateJobseekerPotential);

// Update location
router.post('/api/Jobseeker/updateLocation', db.updateLocation);
router.post('/api/Employer/updateLocaiton', db.updateLocation);

// Update active states
router.post('/api/Jobseeker/updateActiveStates', db.updateActiveStates);
router.post('/api/Employer/updateActiveStates', db.updateActiveStates);


// Not being used method, DO NOT USE
router.post('/api/addPhoneNum', db.addPhoneNum);

module.exports = router;
 