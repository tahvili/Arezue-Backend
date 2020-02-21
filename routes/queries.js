/*jshint esversion: 6*/
/*
 * We need to create an authorized API call after we get firebase integration
 * https://www.toptal.com/firebase/role-based-firebase-authentication
 */

// Need to call pool from config.js which is our database setup and others
const pool = require('../config');
const bodyParser = require('body-parser');

const validator = require('validator');

function sendJSON(statusCode, payload) {
    return JSON.stringify({status_code: statusCode, payload: payload})
}

function sendError(statusCode, message, additionalInfo={}) {
    return JSON.stringify({status_code:statusCode, error: {message: message, additional_information: additionalInfo}})
}

exports.init = [
    function(request, response, next) {
        
        var firebaseID = request.body.firebaseID;
        var queryEmployer = "SELECT * FROM Employer WHERE fb_id = $1";
        var queryJobseeker = "SELECT * FROM Jobseeker WHERE fb_id = $1";
        validator.escape(req.firebaseID),

        //Performs both queries and then returns its results in an array which is used to handle the rest of the logic.
        Promise.all([pool.query(queryEmployer, [firebaseID]),pool.query(queryJobseeker, [firebaseID])])
        .then(values => {
            //[0, 1] or [1,1], or [0, 0] where first index is employer, second is jobseeker
            var rowCountsArray = values.map(r=>r.rowCount);
            var rows = values.filter(r=>r.rowCount>0).map(r => r.rows[0]);
            //could not find any relevant user
            if (rows.length == 0) {
                response.status(404);
                response.send(sendError(404, `User with firebaseID = ${firebaseID} not found.`));
                return; //console.error?
            }
            var userType = rowCountsArray[0] == 1 ? "employer" : "jobseeker" // this shouldn't be a string but using it temporarily
            rows[0]['user_type'] = userType; //attach the user type to the row object
            response.send(sendJSON(200, rows[0]))
        })
        .catch(e => {response.status(500); response.send(sendError(500, '/api/init error ' + e))});
    }

]

// we can also do exports.func
//Get all users
exports.getAllUsers = function (request, response, next) {
    pool.query('SELECT * from Users', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

//Gets all jobseekers
exports.getAllJobSeekers = function (request, response, next) {
    pool.query('SELECT * from Jobseeker', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

//Gets all Employers
exports.getAllEmployers = function (request, response, next) {
    pool.query('SELECT * from Employer', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

// Route to create the jobseeker account
// Since they have different views, we will have differnet POST api request
/*
 ** Requirements: UUID, Email and Name
 */
exports.createJobseeker = [
    async function (req, res, next) {
        let firebaseID = validator.escape(req.body.firebaseID);
        let name = validator.escape(req.body.name);
        let email = validator.escape(req.body.email);
        
        if (validator.isEmpty(firebaseID) || validator.isEmpty(name) || validator.isEmpty(email)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isEmail(email)) {
            res.status(400).send("Invalid email address");
            return;
        }

        Promise.all([pool.query('INSERT INTO jobseeker (fb_id, name, email_address) VALUES ($1, $2, $3) RETURNING uid', [firebaseID, name, email])])
        .then(result => {
    
            var rows = result.filter(r=>r.rowCount>0).map(r => r.rows[0])
          
            if (rows[0].uid) {
                res.status(200).send(`Jobseeker created with ID: ${rows[0].uid}`)
            } else {
                res.status(400).send(`Jobseeker could not be created`);
            }
            
        })
        .catch(e => {res.status(500); res.send(sendError(500, '/jobseeker error ' + e ))});
    }];

exports.getJobseeker = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        if (validator.isEmpty(uid)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }

        let create_employer = `SELECT * FROM jobseeker where uid = $1`;
        Promise.all([pool.query(create_employer, [uid])])
        .then (result => {
            // var rowCountsArray = values.map(r=>r.rowCount)
            var rows = result.filter(r=>r.rowCount>0).map(r => r.rows[0])

            if (rows[0]) {
                res.status(200).send(rows[0])
            } else {
                res.status(400).send(`jobseeker could not be found`);
            }
            
        })
        .catch(e => {res.status(500); res.send(sendError(500, '/jobseeker error ' + e ))});
    }];

// Route to create the Employer account
// Since they have different views, we will have differnet POST api request
/*
 ** Requirements: UUID, Email and Name
 */
exports.createEmployer = [

    async function (req, res, next) {
        let firebaseID = validator.escape(req.body.firebaseID);
        let name = validator.escape(req.body.name);
        let email = validator.escape(req.body.email);
        let company = validator.escape(req.body.company);
        if (validator.isEmpty(firebaseID) || validator.isEmpty(name) || validator.isEmpty(email) || validator.isEmpty(company)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isEmail(email)) {
            res.status(400).send("Invalid email address");
            return;
        }
        if (!validator.isAlpha(name)) {
            res.status(400).send("Invalid name");
            return;
        }
        if (!validator.isNumeric(company)) {
            res.status(400).send("Invalid company ID");
            return;
        }

        let create_employer = `INSERT INTO Employer (fb_id, name, email_address, Company_id) VALUES ($1, $2, $3, $4) RETURNING uid`;
        Promise.all([pool.query(create_employer, [firebaseID, name, email, company])])
        .then (result => {
            // var rowCountsArray = values.map(r=>r.rowCount)
            var rows = result.filter(r=>r.rowCount>0).map(r => r.rows[0])

            if (rows[0].uid) {
                res.status(200).send(`Employer created with ID: ${rows[0].uid}`)
            } else {
                res.status(400).send(`Employer could not be created`);
            }
            
        })
        .catch(e => {res.status(500); res.send(sendError(500, '/employers error ' + e ))});
    }];

exports.getEmployer = [

    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        if (validator.isEmpty(uid)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }

        let create_employer = `SELECT * FROM employer where uid = $1`;
        Promise.all([pool.query(create_employer, [uid])])
        .then (result => {
            // var rowCountsArray = values.map(r=>r.rowCount)
            var rows = result.filter(r=>r.rowCount>0).map(r => r.rows[0])

            if (rows[0]) {
                res.status(200).send(rows[0])
            } else {
                res.status(400).send(`employer could not be found`);
            }
            
        })
        .catch(e => {res.status(500); res.send(sendError(500, '/employer error ' + e ))});
    }];

exports.updateJobseeker = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let data = req.body;
        console.log(typeof data);
        console.log(data);

        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }

        pairs = Object.keys(data).map((key, index) => `${key}=$${index+1}`).join(", ");
        values = Object.values(data)
        var update_jobseeker = `UPDATE jobseeker set ${pairs} where uid = $${values.length+1} RETURNING uid`;
        Promise.all([pool.query(update_jobseeker, values.concat(uid))])
        .then (result => {
            var rows = result.filter(r=>r.rowCount>0).map(r => r.rows[0])

            if (rows[0]) {
                res.status(200).send(rows[0]);
            } else {
                res.status(400).send(`Jobseeker could not be updated`);
            }
            
        })
       .catch(e => {res.status(500); res.send(sendError(500, '/jobseeker error ' + e ))});
   }];

exports.updateEmployer = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let data = req.body;
        console.log(typeof data);
        console.log(data);

        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }

        pairs = Object.keys(data).map((key, index) => `${key}=$${index+1}`).join(", ");
        values = Object.values(data)
        var update_employer = `UPDATE jobseeker set ${pairs} where uid = $${values.length+1} RETURNING uid`;
        Promise.all([pool.query(update_employer, values.concat(uid))])
        .then (result => {
            var rows = result.filter(r=>r.rowCount>0).map(r => r.rows[0])

            if (rows[0]) {
                res.status(200).send(rows[0]);
            } else {
                res.status(400).send(`Jobseeker could not be updated`);
            }
            
        })
       .catch(e => {res.status(500); res.send(sendError(500, '/jobseeker error ' + e ))});
   }];