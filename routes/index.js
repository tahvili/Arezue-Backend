var express = require('express');
var router = express.Router();

var db = require('./queries');
var bodyParser = require('body-parser')


//bodyParser was initialized in queries but never used, moving it here and attaching it to "router"
// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
    extended: true
})
router.use(jsonParser)

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Arezue API' });
});

router.get('/api', function(req, res, next) {
  res.render('index', { title: 'Arezue API' });
});


// Temporarily get request for testing
router.get('/api/temp-testing', db.getAllUsers);
router.get('/api/users', db.getAllUsers);

router.post('/api/init', db.init);

//##########Jobseeker Routes############//
// Create account for new jobseeker
// router.post('/api/jobseekers', db.getAllJobSeekers);
router.get('/api/jobseekers', db.getAllJobSeekers);
router.post('/api/jobseekers/create', db.createJobseeker);


//##########Jobseeker Routes############//
// Create account for new employer
router.get('/api/employers', db.getAllEmployers);
router.post('/api/employers/create', db.createEmployer);
// router.put('/api/employers/edit', db.editeEmployer);



//#########Old Routes that need to be converted to Update####//
// // Add a phone number to jobseeker's row
// router.post('/api/Jobseeker/addPhoneNum', db.updatePhoneNum);
// // Add a phone number to employer's row
// router.post('/api/Employer/addPhoneNum', db.updatePhoneNum);
// // Update name to employer or jobseeker
// router.post('/api/Jobseeker/updateName', db.updateName);
// router.post('/api/Employer/updateName', db.updateName);
// // Update potentialness of a jobseeker if they are seeking for a job
// router.post('/api/Jobseeker/updatePotential', db.updateJobseekerPotential);
// // Update name to employer or jobseeker
// router.post('/api/Jobseeker/updateLastLogin', db.updateLastLogin);
// router.post('/api/Employer/updateLastLogin', db.updateLastLogin);
// // Update location
// router.post('/api/Jobseeker/updateLocation', db.updateLocation);
// router.post('/api/Employer/updateLocaiton', db.updateLocation);
// // Update active states
// router.post('/api/Jobseeker/updateActiveStates', db.updateActiveStates);
// router.post('/api/Employer/updateActiveStates', db.updateActiveStates);


/* What is missing?
  Jobseeker
    - profile_picture
    - num_employer_*
    - pending_interest
*/

// Not being used method, DO NOT USE
// router.post('/api/addPhoneNum', db.addPhoneNum);

module.exports = router;
 