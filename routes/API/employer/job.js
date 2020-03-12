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

exports.getAllJob = [
    async function (req, res, next) {
        let euid = validator.escape(req.params.uid);
        if (validator.isEmpty(euid)) {
            res.status(422).send();
            return;
        }
        if (!validator.isUUID(euid, [4])) {
            res.status(400).send();
            return;
        }
        let query = `SELECT * FROM job WHERE euid = $1`;
        Promise.all([pool.query(query, [euid])])
            .then(result => {
                let rows = result.map(r => r.rows)[0];
                let returning = [];
                console.log(rows);
                if (rows.length > 0) {
                    res.type('application/json');
                    Object.keys(rows).forEach(function(key) {
                        delete rows[key]['euid'];
                        returning.push(rows[key]);
                    });
                    return res.status(200).send(returning);
                } else {
                    return res.status(404).send();
                }
            })
            .catch(e => {
                res.status(500, res.send(sendError(500, '/employer ' + e)));
            });
    }
];

exports.getJob = [
    async function(req, res, next) {
        let euid = validator.escape(req.params.uid);
        let job_id = validator.escape(req.params.job_id);
        if (validator.isEmpty(euid) || validator.isEmpty(job_id) || !validator.isInt(job_id)) {
            res.status(422).send();
            return;
        }
        if (!validator.isUUID(euid, [4])) {
            res.status(400).send();
            return;
        }
        let query = `SELECT * FROM job WHERE job_id = $1 and euid = $2`;
        Promise.all([pool.query(query, [job_id, euid])])
            .then(result => {
                let rows = result.map(r => r.rows)[0];
                if (rows.length > 0) {
                    delete rows[0].euid;
                    return res.status(200).send(rows[0]);
                } else {
                    return res.status(404).send();
                }
            })
            .catch(e => {
                res.status(500, res.send(sendError(500, '/employer' + e)));
            });
    }
];

exports.addJob = [
    async function (req, res, next) {
        let euid = validator.escape(req.params.uid);
        let company_name = validator.escape(req.body.company_name);
        let title = validator.escape(req.body.title);
        let wage = validator.escape(req.body.wage);
        let position = validator.escape(req.body.position);
        let hours = validator.escape(req.body.hours);
        let location = validator.escape(req.body.location);
        let description = validator.escape(req.body.description);
        let status = validator.escape(req.body.status);
        let max_candidate = validator.escape(req.body.max_candidate.toString());

        if (validator.isEmpty(euid) || validator.isEmpty(company_name) || validator.isEmpty(title) ||
        validator.isEmpty(wage) || validator.isEmpty(position) || validator.isEmpty(hours) || 
        validator.isEmpty(location) || validator.isEmpty(description) || validator.isEmpty(status) ||
        validator.isEmpty(max_candidate)) {
            res.status(422).send();
            return;
        }
        if (!validator.isUUID(euid, [4])) {
            res.status(400).send();
            return;
        }
        if (euid.length != req.params.uid.length) return res.status(400).send();
        if (company_name.length != req.body.company_name.length) return res.status(400).send();
        if (title.length != req.body.title.length) return res.status(400).send();
        if (wage.length != req.body.wage.length) return res.status(400).send();
        if (position.length != req.body.position.length) return res.status(400).send();
        if (hours.length != req.body.hours.length) return res.status(400).send();
        if (location.length != req.body.location.length) return res.status(400).send();
        if (description.length != req.body.description.length) return res.status(400).send();
        if (status.length != req.body.status.length) return res.status(400).send();
        if (max_candidate.length != req.body.max_candidate.toString().length) return res.status(400).send();

        res.type('application/json');
        let query = `INSERT INTO job VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, DEFAULT, DEFAULT, $8, $9, $10) returning euid AS uid, job_id`;
        Promise.all([pool.query(query, [euid, title, wage, position, hours, location, description, status, max_candidate, company_name])])
            .then(result => {
                var rows = result.map(r => r.rows)[0];
                if (rows.length > 0) {
                    return res.status(200).send(rows[0]);
                } else {
                    return res.status(400).send();
                }
            })
            .catch(e => {
                res.status(500, res.send(sendError(500, '/employer ' + e)));
            });
    }
];

exports.updateJob = [
    async function(req, res, next) {
        let euid = validator.escape(req.params.uid);
        let job_id = validator.escape(req.params.job_id);
        let data = req.body;

        if (validator.isEmpty(euid) || validator.isEmpty(job_id) || data == {}) {
            res.status(422).send();
            return;
        }
        if (!validator.isUUID(euid, [4]) || !validator.isInt(job_id)) {
            res.status(400).send();
            return;
        }
        pairs = Object.keys(data).map((key, index) => `${key}=$${index + 1}`).join(", ");
        values = Object.values(data);
        let update_job = `UPDATE job set ${pairs} where job_id = $${values.length + 1} and euid = $${values.length + 2} returning euid AS uid`;
        // values.concat(euid);
        // values.concat(job_id);
        Promise.all([pool.query(update_job, values.concat(job_id, euid))])
            .then(result => {
                let rows = result.map(r => r.rows[0]);

                if (rows[0]) {
                    res.status(200).send(rows[0]);
                } else {
                    res.status(400).send();
                }
                return;
            })
            .catch(e => {
                res.status(500, res.send(sendError(500, '/employer ' + e)));
            });

    }
];