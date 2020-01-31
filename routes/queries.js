/*
 * We need to create an authorized API call after we get firebase integration
 * https://www.toptal.com/firebase/role-based-firebase-authentication
 */

// Need to call pool from config.js which is our database setup and others
const pool = require('../config');

var express = require('express')
var bodyParser = require('body-parser')

const {
    body,
    validationResult
} = require('express-validator');
const {
    sanitizeBody
} = require('express-validator');

var app = express()

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
    extended: true
})

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
        pool.query('INSERT INTO jobseeker (uid, name, email_address) VALUES ($1, $2, $3) RETURNING uid', [firebaseID,name, email], (error, results) => {
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
        pool.query('INSERT INTO employer (uid, name, email_address, company VALUES (uuid_generate_v4(), $1, $2, $3) RETURNING uid', [name, email, company], (error, results) => {
            if (error) {
                res.status(400).send(error)
                return console.error(error);
            }
            res.status(200).send(`User created with ID: ${results.rows[0].uid}`)
        })


    }
];

// Method to insert phone number whether its employer or jobseeker
exports.updatePhoneNum = [
    body('phone').notEmpty().isMobilePhone().withMessage("Must be a valid phone number"),
    body('uuid').notEmpty().withMessage("Must provide a valid UUID"),
    sanitizeBody('phone', 'uuid').escape(),

    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send(errors)
            return;
        } else {
            let firebaseID = req.body.firebaseID; // Unsure if needed at this stage right now
            let phone = req.body.phone;
            let uuid = req.body.uuid;
            let url = req.originalUrl;
            let path = url.split("/")[2];
            if (path == 'jobseeker') {
                await pool.query(`Update jobseeker 
                    SET phone_number = $1
                    WHERE 
                        uid = $2
                    RETURNING uid`, [phone, uuid], (error, results) => {
                    if (error) {
                        res.status(400).send(error);
                        return console.error(error);
                    }
                    if (results.rowCount) {
                        res.status(200).send('Phone number inserted')
                    } else {
                        res.status(400).send("Users not found");
                    }
                });
            } else if (path == 'employer') {
                await pool.query(`Update employer 
                    SET phone_number = $1
                    WHERE 
                        uid = $2 
                    RETURNING uid`, [phone, uuid], (error, results) => {
                    if (error) {
                        res.status(400).send(error);
                        return console.error(error);
                    }
                    if (results.rowCount) {
                        res.status(200).send('Phone number inserted')
                    } else {
                        res.status(400).send("Users not found");
                    }
                });
            } else {
                res.status(404)
            }


        }
    }
];

// !  Not in use
exports.updateJobseekerPhoneNum = [
    body('phone').notEmpty().isMobilePhone().withMessage("Must be a valid phone number"),
    body('uuid').notEmpty().withMessage("Must provide a valid UUID"),
    sanitizeBody('phone', 'uuid').escape(),

    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send(errors)
            return;
        }
        let phone = req.body.phone;
        let uuid = req.body.uuid;
        let url = req.originalUrl;
        let path = url.split("/");
        await pool.query(`Update jobseeker
        SET phone_number = $1
        WHERE
            uid = $2
        RETURNING uid`, [phone, uuid], (error, results) => {
            if (error) {
                res.status(400).send(error)
                return console.error(error);
            }
            if (results.rowCount) {
                res.status(200).send(`Phone number inserted ${path[2]}`);
            } else {
                res.status(400).send("User not found");
            }

        });

    }
];

// !  Not in use
exports.updateEmployerPhoneNum = [
    body('phone').notEmpty().isMobilePhone().withMessage("Must be a valid phone number"),
    body('uuid').notEmpty().withMessage("Must provide a valid UUID"),
    sanitizeBody('phone', 'uuid').escape(),

    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send(errors)
            return;
        }
        let phone = req.body.phone;
        let uuid = req.body.uuid;
        await pool.query(`Update employer
        SET phone_number = $1
        WHERE
            uid = $2
        RETURNING uid`, [phone, uuid], (error, results) => {
            if (error) {
                res.status(400).send(error)
                return console.error(error);
            }
            if (results.rowCount) {
                res.status(200).send("Phone number inserted");
            } else {
                res.status(400).send("User not found");
            }

        });

    }
];

// Update the potential boolean of jobseeker or employer
exports.updateJobseekerPotential = [
    body('potential').notEmpty().isBoolean().withMessage("Must be a boolean value"),
    body('uuid').notEmpty().withMessage("Must provide a valid UUID"),

    sanitizeBody('potential', 'uuid').escape(),

    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send(errors)
            return;
        }
        let potential = req.body.potential;
        await pool.query(`Update jobseeker
        SET potential_client = $1
        WHERE
            uid = $2
        RETURNING uid`, [potential, uid], (error, results) => {
            if (error) {
                res.status(400).send(error)
                return console.error(error);
            }
            if (results.rowCount) {
                res.status(200).send("Potential Client modified");
            } else {
                res.status(400).send("User not found");
            }
        })
    }
];

// Method to insert location whether its employer or jobseeker
exports.updateLocation = [
    body('location').notEmpty().withMessage("Must be a valid location"),
    body('uuid').notEmpty().withMessage("Must provide a valid UUID"),
    sanitizeBody('location', 'uuid').escape(),

    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send(errors)
            return;
        } else {
            let firebaseID = req.body.firebaseID; // Unsure if needed at this stage right now
            let locaiton = req.body.location;
            let uuid = req.body.uuid;
            let url = req.originalUrl;
            let path = url.split("/")[2];
            if (path == 'jobseeker') {
                await pool.query(`Update jobseeker 
                    SET location = $1
                    WHERE 
                        uid = $2
                    RETURNING uid`, [location, uuid], (error, results) => {
                    if (error) {
                        res.status(400).send(error);
                        return console.error(error);
                    }
                    if (results.rowCount) {
                        res.status(200).send('Location updated')
                    } else {
                        res.status(400).send("Users not found");
                    }
                });
            } else if (path == 'employer') {
                await pool.query(`Update employer 
                    SET location = $1
                    WHERE 
                        uid = $2 
                    RETURNING uid`, [location, uuid], (error, results) => {
                    if (error) {
                        res.status(400).send(error);
                        return console.error(error);
                    }
                    if (results.rowCount) {
                        res.status(200).send('Location updated')
                    } else {
                        res.status(400).send("Users not found");
                    }
                });
            } else {
                res.status(404)
            }
        }
    }
];

// Method to update states of employer or jobseeker
exports.updateActiveStates = [
    body('states').notEmpty().isBoolean().withMessage("Must be a boolean"),
    body('uuid').notEmpty().withMessage("Must provide a valid UUID"),
    sanitizeBody('location', 'uuid').escape(),

    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send(errors)
            return;
        } else {
            let firebaseID = req.body.firebaseID; // Unsure if needed at this stage right now
            let states = req.body.states;
            let uuid = req.body.uuid;
            let url = req.originalUrl;
            let path = url.split("/")[2];
            if (path == 'jobseeker') {
                await pool.query(`Update jobseeker 
                    SET states = $1
                    WHERE 
                        uid = $2
                    RETURNING uid`, [states, uuid], (error, results) => {
                    if (error) {
                        res.status(400).send(error);
                        return console.error(error);
                    }
                    if (results.rowCount) {
                        res.status(200).send('Active states boolean required')
                    } else {
                        res.status(400).send("Users not found");
                    }
                });
            } else if (path == 'employer') {
                await pool.query(`Update employer 
                    SET states = $1
                    WHERE 
                        uid = $2 
                    RETURNING uid`, [states, uuid], (error, results) => {
                    if (error) {
                        res.status(400).send(error);
                        return console.error(error);
                    }
                    if (results.rowCount) {
                        res.status(200).send('Active states boolean required')
                    } else {
                        res.status(400).send("Users not found");
                    }
                });
            } else {
                res.status(404)
            }
        }
    }
];

// Method to update states of employer or jobseeker
exports.updateName = [
    body('name').notEmpty().isAlpha().withMessage("Must be a valid name"),
    body('uuid').notEmpty().withMessage("Must provide a valid UUID"),
    sanitizeBody('name', 'uuid').escape(),

    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send(errors)
            return;
        } else {
            let firebaseID = req.body.firebaseID; // Unsure if needed at this stage right now
            let states = req.body.states;
            let uuid = req.body.uuid;
            let url = req.originalUrl;
            let path = url.split("/")[2];
            if (path == 'jobseeker') {
                await pool.query(`Update jobseeker 
                    SET name = $1
                    WHERE 
                        uid = $2
                    RETURNING uid`, [name, uuid], (error, results) => {
                    if (error) {
                        res.status(400).send(error);
                        return console.error(error);
                    }
                    if (results.rowCount) {
                        res.status(200).send('Name has been changed')
                    } else {
                        res.status(400).send("Users not found");
                    }
                });
            } else if (path == 'employer') {
                await pool.query(`Update employer 
                    SET name = $1
                    WHERE 
                        uid = $2 
                    RETURNING uid`, [name, uuid], (error, results) => {
                    if (error) {
                        res.status(400).send(error);
                        return console.error(error);
                    }
                    if (results.rowCount) {
                        res.status(200).send('Name has been changed')
                    } else {
                        res.status(400).send("Users not found");
                    }
                });
            } else {
                res.status(404)
            }
        }
    }
];

// Method to update last login of employer or jobseeker
exports.updateLastLogin = [
    body('uuid').notEmpty().withMessage("Must provide a valid UUID"),
    sanitizeBody('uuid').escape(),

    async function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send(errors)
            return;
        } else {
            let firebaseID = req.body.firebaseID; // Unsure if needed at this stage right now
            let uuid = req.body.uuid;
            let url = req.originalUrl;
            let path = url.split("/")[2];
            if (path == 'jobseeker') {
                await pool.query(`Update jobseeker 
                    SET date_last_login = current_date
                    WHERE 
                        uid = $1
                    RETURNING uid`, [uuid], (error, results) => {
                    if (error) {
                        res.status(400).send(error);
                        return console.error(error);
                    }
                    if (results.rowCount) {
                        res.status(200).send('Date updated')
                    } else {
                        res.status(400).send("Users not found");
                    }
                });
            } else if (path == 'employer') {
                await pool.query(`Update employer 
                    SET date_last_login = current_date
                    WHERE 
                        uid = $1
                    RETURNING uid`, [uid], (error, results) => {
                    if (error) {
                        res.status(400).send(error);
                        return console.error(error);
                    }
                    if (results.rowCount) {
                        res.status(200).send('Date updated')
                    } else {
                        res.status(400).send("Users not found");
                    }
                });
            } else {
                res.status(404)
            }
        }
    }
];
// Now using exports.func so the list of below doesnt get too long
// Route to create the employer's account
// module.exports = {
//     getAllUsers,
//     createJobseeker,
//     // createEmployer,
// }