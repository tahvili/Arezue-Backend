// Need to call pool from config.js which is our database setup and others
const pool = require('../config');

var express = require('express')
var bodyParser = require('body-parser')

const { body,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

var app = express()

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true })

// we can also do exports.func
exports.getAllUsers = function (request, response, next) {
    pool.query('SELECT * from jobseeker', (error, results) => {
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
    body('email').notEmpty().isEmail().withMessage("Must be a valid email address"),
    body('name').notEmpty().isAlpha().withMessage("Must be a valid name"),
    sanitizeBody('name', 'email').escape(),

    async function(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.status(400).send(errors)
            return;
        }
        else {
            let firebaseID = req.body.firebaseID;
            let name = req.body.name;
            let email = req.body.email;
            pool.query('INSERT INTO jobseeker (uid, name, email_address) VALUES (uuid_generate_v4(), $1, $2) RETURNING uid', [name, email], (error, results) => {
                if (error) {
                    res.status(400).send(error)
                    return console.error(error);
                }
                res.status(200).send(`User created with ID: ${results.rows[0].uid}`)
            })
        }
}];

exports.createEmployer = [
    body('email').notEmpty().isEmail().withMessage("Must be a valid email address"),
    body('name').notEmpty().isAlpha().withMessage("Must be a valid name"),
    body('company').notEmpty().withMessage("Must be a valid company name"),
    sanitizeBody('name', 'company', 'email').escape(),

    async function(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send(errors)
            return;
        } else {
            let firebaseID = req.body.firebaseID;
            let name = req.body.name;
            let email = req.body.email;
            let company = req.body.company;
            pool.query('INSERT INTO employer (uid, name, email_address, company VALUES (uuid_generate_v4(), $1, $2, $3) RETURNING uid', [name, email, company], (error, results) => {
                if (error) {
                    res.status(400).send(error)
                    return console.error(error);
                }
                res.status(200).send(`User created with ID: ${results.rows[0].uid}`)
            })
        }

    }
];

// exports.addJobseeker = [

// ]

// Now using exports.func so the list of below doesnt get too long
// Route to create the employer's account
// module.exports = {
//     getAllUsers,
//     createJobseeker,
//     // createEmployer,
// }
