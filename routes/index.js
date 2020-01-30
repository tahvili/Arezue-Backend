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
router.post('/api/Jobseeker/addPhoneNum', db.updateJobseekerPhoneNum);

// Add a phone number to employer's row
router.post('/api/Employer/addPhoneNum', db.updateEmployerPhoneNum);

// Not being used method, DO NOT USE
router.post('/api/addPhoneNum', db.addPhoneNum);

module.exports = router;
 