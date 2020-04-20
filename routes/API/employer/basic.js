// Global var and functions
const pool = require('../../../config');
const validator = require('validator');

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


        let create_employer = `INSERT INTO Employer (fb_id, name, email_address, company_name) VALUES ($1, $2, $3, $4) RETURNING uid`;
        Promise.all([pool.query(create_employer, [firebaseID, name, email, company])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0].uid) {
                    res.status(200).send(`Employer created with ID: ${rows[0].uid}`)
                } else {
                    res.status(400).send(`Employer could not be created`);
                }

            })
            .catch(e => { res.status(500); res.send(sendError(500, '/employers error ' + e)) });
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
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows[0])
                } else {
                    res.status(400).send(`employer could not be found`);
                }

            })
            .catch(e => { res.status(500); res.send(sendError(500, '/employer error ' + e)) });
    }];



exports.updateEmployer = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let data = req.body;

        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        delete data['uid'];
        delete data['firebaseID']
        pairs = Object.keys(data).map((key, index) => `${key}=$${index + 1}`).join(", ");
        values = Object.values(data)
        var update_employer = `UPDATE employer set ${pairs} where uid = $${values.length + 1} RETURNING uid`;
        Promise.all([pool.query(update_employer, values.concat(uid))])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows[0]);
                } else {
                    res.status(400).send(`Employer could not be updated`);
                }

            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];