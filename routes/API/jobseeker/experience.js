// Global var and functions
const pool = require('../../../config');
const validator = require('validator');

function sendJSON(statusCode, payload) {
    return JSON.stringify({ status_code: statusCode, payload: payload })
}

function sendError(statusCode, message, additionalInfo = {}) {
    return JSON.stringify({ status_code: statusCode, error: { message: message, additional_information: additionalInfo } })
}

exports.getExp = [
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
        let Query = `SELECT * FROM Experiences where uid = $1`;
        res.type('application/json')
        Promise.all([pool.query(Query, [uid])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows)
                res.type('application/json')
                if (rows[0]) {
                    if (rows.length == 0) {
                        res.status(200).send([]);
                    }
                    res.status(200).send({'data': rows[0]})
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];
exports.addExp = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let title = validator.escape(req.body.title);
        let start_date = validator.escape(req.body.start_date);
        let end_date = validator.escape(req.body.end_date);
        let description = validator.escape(req.body.description);
        if (validator.isEmpty(uid) || validator.isEmpty(title) || validator.isEmpty(start_date) || validator.isEmpty(end_date) || validator.isEmpty(description)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        let Query = `INSERT INTO experiences (uid, title, start_date, end_date, description) VALUES ($1, $2, $3, $4, $5) returning exp_id`;
        Promise.all([pool.query(Query, [uid, title, start_date, end_date, description])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);
                if (rows[0]) {
                    res.status(200).send(rows[0]);
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            })
            .catch(e => { res.status(500); re.send(sendError(500, '/jobseeker error ' + e)) });
    }];

    exports.updateExp = [
        async function (req, res, next) {
            let uid = validator.escape(req.params.uid);
            let exp_id = validator.escape(req.body.exp_id);

            if (!validator.isUUID(uid, [4])) {
                res.status(400).send("Invalid UUID");
                return;
            }

            let data = req.body;
            delete data['exp_id'];
            pairs = Object.keys(data).map((key, index) => `${key}=$${index + 1}`).join(", ");
    
            values = Object.values(data)
            console.log(pairs);
            var query = `UPDATE experiences set ${pairs} where exp_id = $${values.length + 1} RETURNING exp_id`;
            Promise.all([pool.query(query, values.concat(exp_id))])
                .then(result => {
                    var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])
    
                    if (rows[0]) {
                        res.status(200).send(rows[0]);
                    } else {
                        res.status(400).send(`Jobseeker could not be updated`);
                    }
                })
                .catch(e => { res.status(500); res.send(sendError(500, '/experience error ' + e)) });
        }
    ];

exports.deleteExp = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let e_id = validator.escape(req.params.exp_id);
        // let title = validator.escape(req.body.title);
        // let start_date = validator.escape(req.body.start_date);
        // let end_date = validator.escape(req.body.end_date);
        // let description = validator.escape(req.body.description);
        if (validator.isEmpty(uid)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        let Query = `DELETE FROM experiences WHERE uid = $1 and exp_id = $2 returning uid`;
        Promise.all([pool.query(Query, [uid, e_id])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows[0]) {
                    res.status(200).send(rows);
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            }).catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];