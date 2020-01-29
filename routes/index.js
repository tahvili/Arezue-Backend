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

// C of CRUD, create account for new jobseeker
router.post('/api/CreateAccount/jobseeker/', db.createJobseeker);

// Create account for new employer
router.post('/api/CreateAccount/employer/', db.createEmployer);

// Add a field
// router.post('/api/Jobseeker/addPhone', db.addJobseeker);

module.exports = router;
