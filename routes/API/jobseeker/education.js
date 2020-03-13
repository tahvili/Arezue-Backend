const pool = require('../../../config');
const validator = require('validator');

function sendJSON(statusCode, payload) {
    return JSON.stringify({ status_code: statusCode, payload: payload })
}

function sendError(statusCode, message, additionalInfo = {}) {
    return JSON.stringify({ status_code: statusCode, error: { message: message, additional_information: additionalInfo } })
}


exports.addEducation = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let name = validator.escape(req.body.school_name);
        let start_date = validator.escape(req.body.start_date);
        let grad_date = validator.escape(req.body.grad_date);
        let program = validator.escape(req.body.program);

        if (uid !== req['authData']['uid']) return res.sendStatus(403);

        let query = `INSERT INTO Education (uid, school_name, start_date, grad_date, program) 
        VALUES ($1, $2, $3, $4, $5) returning ed_id`;
        Promise.all([pool.query(query, [uid, name, start_date, grad_date, program])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])
                if (rows[0]) {
                    res.status(200).send(rows[0])
                } else {
                    res.status(400).send(`Education could not be created`);
                }

            })
            .catch(e => { res.status(500); res.send(sendError(500, '/education error ' + e)) });
    }
];

exports.getEducation = [
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
        if (uid !== req['authData']['uid']) return res.sendStatus(403);

        let Query = `SELECT * FROM Education where uid = $1`;
        Promise.all([pool.query(Query, [uid])])
            .then(result => {
                var edu = {};
                if (result[0].rows) {
                    edu.education = result[0].rows;
                    if (edu) {
                        res.status(200).send(edu)
                    } else {
                        res.status(400).send(`Jobseeker could not be found`);
                    }
                }
            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];


exports.updateEducation = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let ed_id = validator.escape(req.body.ed_id);
        // let name = validator.escape(req.body.school_name);
        // let start = validator.escape(req.body.start_date);
        // let grad = validator.escape(req.body.grad_date);
        // let program = validator.escape(req.body.program);
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        if (uid !== req['authData']['uid']) return res.sendStatus(403);

        let data = req.body;
        delete data['ed_id'];
        pairs = Object.keys(data).map((key, index) => `${key}=$${index + 1}`).join(", ");

        values = Object.values(data)
        console.log(pairs);
        var query = `UPDATE education set ${pairs} where ed_id = $${values.length + 1} RETURNING ed_id`;
        Promise.all([pool.query(query, values.concat(ed_id))])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows[0]);
                } else {
                    res.status(400).send(`Jobseeker could not be updated`);
                }

            })
            .catch(e => { res.status(500); res.send(sendError(500, '/education error ' + e)) });
    }
];

exports.deleteEducation = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let ed_id = validator.escape(req.params.ed_id);

        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        if (uid !== req['authData']['uid']) return res.sendStatus(403);

        var query = `DELETE FROM education where uid = $1 and ed_id = $2 returning ed_id`;
        Promise.all([pool.query(query, [uid, ed_id])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows[0]);
                } else {
                    res.status(400).send(`Jobseeker could not be updated`);
                }

            })
            .catch(e => { res.status(500); res.send(sendError(500, '/education error ' + e)) });
    }
];