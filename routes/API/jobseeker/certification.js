const pool = require('../../../config');
const validator = require('validator');

function sendJSON(statusCode, payload) {
    return JSON.stringify({ status_code: statusCode, payload: payload })
}

function sendError(statusCode, message, additionalInfo = {}) {
    return JSON.stringify({ status_code: statusCode, error: { message: message, additional_information: additionalInfo } })
}


exports.addCert = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let name = validator.escape(req.body.cert_name);
        if (req.body.start_date) {
            var start_date = validator.escape(req.body.start_date);
        }
        if (req.body.end_date) {
            var end_date = validator.escape(req.body.end_date);
        }
        if (uid !== req['authData']['uid']) return res.sendStatus(403);

        let issuer = validator.escape(req.body.issuer);


        let query = `INSERT INTO Certification (uid, cert_name, start_date, end_date, issuer) 
        VALUES ($1, $2, $3, $4, $5) returning c_id`;
        Promise.all([pool.query(query, [uid, name, start_date, end_date, issuer])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])
                if (rows[0]) {
                    res.status(200).send(rows[0])
                } else {
                    res.status(400).send(`Certification could not be created`);
                }

            })
            .catch(e => { res.status(500); res.send(sendError(500, '/certificate error ' + e)) });
    }
];

exports.getCert = [
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

        let Query = `SELECT * FROM Certification where uid = $1`;
        Promise.all([pool.query(Query, [uid])])
            .then(result => {
                var edu = {};
                if (result[0].rows) {
                    edu.certification = result[0].rows;
                    if (edu) {
                        res.status(200).send(edu)
                    } else {
                        res.status(400).send(`Jobseeker could not be found`);
                    }
                }
            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

exports.updateCert = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let c_id = validator.escape(req.body.c_id);

        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        if (uid !== req['authData']['uid']) return res.sendStatus(403);

        let data = req.body;
        delete data['c_id'];
        pairs = Object.keys(data).map((key, index) => `${key}=$${index + 1}`).join(", ");
        values = Object.values(data)
        // values.concat(c_id);
        console.log(`Values: ${values}`)
        var query = `UPDATE certification set ${pairs} where c_id = $${values.length + 1} RETURNING c_id`;
        Promise.all([pool.query(query, values.concat(c_id))])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows[0]);
                } else {
                    res.status(400).send(`Jobseeker could not be updated`);
                }

            })
            .catch(e => { res.status(500); res.send(sendError(500, '/certification error ' + e)) });
    }
];

exports.deleteCert = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let c_id = validator.escape(req.params.c_id);

        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        if (uid !== req['authData']['uid']) return res.sendStatus(403);

        var query = `DELETE FROM certification where uid = $1 and c_id = $2 returning c_id`;
        Promise.all([pool.query(query, [uid, c_id])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows[0]);
                } else {
                    res.status(400).send(`Certification could not be deleted`);
                }

            })
            .catch(e => { res.status(500); res.send(sendError(500, '/certification error ' + e)) });
    }
];