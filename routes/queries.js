// Need to call pool from config.js which is our database setup and others
const pool = require('../config');

var express = require('express')
var bodyParser = require('body-parser')

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
const createJobseeker = function(request, response, next) {
    let firebaseID = request.body.firebaseID;
    let name = request.body.name;
    let email = request.body.email;
    pool.query('INSERT INTO jobseeker (uid, name, email_address) VALUES (uuid_generate_v4(), $1, $2) RETURNING *', [name, email], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`User added with ID: ${results.rows[0].uid}`)
    })

}
module.exports = {
    getAllUsers,
    createJobseeker,
}
