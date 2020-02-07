/*
 * We need to create an authorized API call after we get firebase integration
 * https://www.toptal.com/firebase/role-based-firebase-authentication
 */

// Need to call pool from config.js which is our database setup and others
const pool = require('../config');

var express = require('express')

const {
    body,
    validationResult
} = require('express-validator');
const {
    sanitizeBody
} = require('express-validator');


function sendJSON(statusCode, payload) {
    return JSON.stringify({status_code: statusCode, payload: payload})
}

function sendError(statusCode, message, additionalInfo={}) {
    return JSON.stringify({status_code:statusCode, error: {message: message, additional_information: additionalInfo}})
}

exports.init = [
    body('firebaseID').notEmpty().isAlphanumeric().withMessage("You must pass in a firebase ID."),
    function(request, response, next) {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            response.status(400).send(sendError(400, "Validation Error", errors))
            return;
        }
        firebaseID = request.body.firebaseID;
        var queryEmployer = "SELECT * FROM Employer WHERE fb_id = $1";
        var queryJobseeker = "SELECT * FROM Jobseeker WHERE fb_id = $1";

        //Performs both queries and then returns its results in an array which is used to handle the rest of the logic.
        Promise.all([pool.query(queryEmployer, [firebaseID]),pool.query(queryJobseeker, [firebaseID])])
        .then(values => {
            //[0, 1] or [1,1], or [0, 0] where first index is employer, second is jobseeker
            var rowCountsArray = values.map(r=>r.rowCount)
            var rows = values.filter(r=>r.rowCount>0).map(r => r.rows[0])
            //could not find any relevant user
            if (rows.length == 0) {
                response.status(404)
                response.send(sendError(404, `User with firebaseID = ${firebaseID} not found.`))
                return //console.error?
            }
            var userType = rowCountsArray[0] == 1 ? "employer" :"jobseeker" // this shouldn't be a string but using it temporarily
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
    body('firebaseID').notEmpty().isAlphanumeric().withMessage("You must pass in a firebase ID."),
    body('email').notEmpty().isEmail().withMessage("Must be a valid email address"),
    body('name').notEmpty().isAlpha().withMessage("Must be a valid name"),
    sanitizeBody('name', 'email').escape(),

    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.status(400).send(errors)
            return;
        }
        let firebaseID = req.body.firebaseID;
        let name = req.body.name;
        let email = req.body.email;
        pool.query('INSERT INTO jobseeker (fb_id, name, email_address) VALUES ($1, $2, $3) RETURNING uid', [firebaseID, name, email], (error, results) => {
            if (error) {
                res.status(400).send(error)
                return console.error(error);
            }
            res.status(200).send(`User created with ID: ${results.rows[0].uid}`)
        })
    }
];


// Route to create the Employer account
// Since they have different views, we will have differnet POST api request
/*
 ** Requirements: UUID, Email and Name
 */
exports.createEmployer = [
    body('firebaseID').notEmpty().isAlphanumeric().withMessage("You must pass in a firebase ID."),
    body('email').notEmpty().isEmail().withMessage("Must be a valid email address"),
    body('name').notEmpty().isAlpha().withMessage("Must be a valid name"),
    body('company').notEmpty().withMessage("Must be a valid company name"),
    sanitizeBody('name', 'company', 'email').escape(),

    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send(errors)
            return;
        }
        let firebaseID = req.body.firebaseID;
        let name = req.body.name;
        let email = req.body.email;
        let company = req.body.company;
        

        let create_employer = `INSERT INTO Employer (fb_id, name, email_address, Company_id) VALUES ($1, $2, $3, $4) RETURNING uid`;
        Promise.all([pool.query(create_employer, [firebaseID, name, email, company])])
        .then (result => {
            // var rowCountsArray = values.map(r=>r.rowCount)
            var rows = result.filter(r=>r.rowCount>0).map(r => r.rows[0])

            if (rows[0].uid) {
                res.status(200).send(`User created with ID: ${rows[0].uid}`)
            } else {
                res.status(400).send(`User could not be created`);
            }
            
        })
        .catch(e => {res.status(500); res.send(sendError(500, '/api/employers/create error ' + e ))});
    }];