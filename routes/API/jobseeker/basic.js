// Global var and functions
const pool = require('../../../config');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const fs = require('fs');

function sendJSON(statusCode, payload) {
    return JSON.stringify({
        status_code: statusCode,
        payload: payload
    })
}

function sendError(statusCode, message, additionalInfo = {}) {
    return JSON.stringify({
        status_code: statusCode,
        error: {
            message: message,
            additional_information: additionalInfo
        }
    })
}

// Exports for API
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

                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0].uid) {
                    res.status(200).send(`Jobseeker created with ID: ${rows[0].uid}`)
                } else {
                    res.status(400).send(`Jobseeker could not be created`);
                }

            })
            .catch(e => {
                res.status(500);
                res.send(sendError(500, '/jobseeker error ' + e))
            });
    }
];

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
        // Example of how to not allow them to exploit the api
        if (uid !== req['authData']['uid']) return res.sendStatus(403);

        let create_employer = `SELECT * FROM jobseeker where uid = $1`;
        Promise.all([pool.query(create_employer, [uid])])
            .then(result => {
                // var rowCountsArray = values.map(r=>r.rowCount)
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows[0])
                } else {
                    res.status(400).send(`jobseeker could not be found`);
                }

            })
            .catch(e => {
                res.status(500);
                res.send(sendError(500, '/jobseeker error ' + e));
            });

       
    }
];

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
        if (uid !== req['authData']['uid']) return res.sendStatus(403);

        delete data['uid'];
        delete data['firebaseID']
        pairs = Object.keys(data).map((key, index) => `${key}=$${index + 1}`).join(", ");

        values = Object.values(data)
        console.log(pairs);
        var update_jobseeker = `UPDATE jobseeker set ${pairs} where uid = $${values.length + 1} RETURNING uid`;
        Promise.all([pool.query(update_jobseeker, values.concat(uid))])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows[0]);
                } else {
                    res.status(400).send(`Jobseeker could not be updated`);
                }

            })
            .catch(e => {
                res.status(500);
                res.send(sendError(500, '/jobseeker error ' + e))
            });
    }
];