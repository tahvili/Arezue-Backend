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
const getAllUsers = function (request, response, next) {
    pool.query('SELECT * from jobseeker', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

// Route to create the jobseeker account
// Since they have different views, we will have differnet POST api request
const createJobseeker = [
    body('email').notEmpty().isEmail().withMessage("Must be a valid email address"),
    body('name').notEmpty().isAlpha().withMessage("Must be a valid name"),
    sanitizeBody('name').escape(),

    function(request, response, next) {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            response.status(400).send(errors)
            return;
        }
        else {
            let firebaseID = request.body.firebaseID;
            let name = request.body.name;
            let email = request.body.email;
            pool.query('INSERT INTO jobseeker (uid, name, email_address) VALUES (uuid_generate_v4(), $1, $2) RETURNING *', [name, email], (error, results) => {
                if (error) {
                    response.status(400).send(error)
                    return console.error(error);
                }
                response.status(200).send(`User created with ID: ${results.rows[0].uid}`)
            })
        }
}];

// Route to create the employer's account
module.exports = {
    getAllUsers,
    createJobseeker,
    // createEmployer,
}
