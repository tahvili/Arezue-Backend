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

exports.getDreamCompanies = [
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

        let Query = `SELECT * FROM Dream_Companies where uid = $1`;
        Promise.all([pool.query(Query, [uid])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows)
                res.type('application/json');
                if (rows[0]) {
                    if (rows.length == 0) {
                        res.status(200).send([]);
                    }
                    res.status(200).send(rows[0])
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

exports.addDreamCompanies = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let dream_company = validator.escape(req.body.dream_company);
        let ranking = validator.escape(req.body.ranking);
        if (validator.isEmpty(uid) || validator.isEmpty(dream_company)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        if (uid != req.params.uid) return res.status(400).send();
        if (dream_company != req.body.dream_company) return res.status(400).send();
        if (ranking != req.body.ranking) return res.status(400).send();

        if (uid !== req['authData']['uid']) return res.sendStatus(403);

        let Query = `INSERT INTO dream_companies (uid, dream_company, preference) VALUES ($1, $2, $3) returning uid`;
        Promise.all([pool.query(Query, [uid, dream_company, ranking])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows[0]) {
                    res.status(200).send('Added dream career');
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

exports.deleteDreamCompanies = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let dream_company = validator.escape(req.params.dream_company);
        if (validator.isEmpty(uid) || validator.isEmpty(dream_company)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        if (uid !== req['authData']['uid']) return res.sendStatus(403);

        let Query = `DELETE FROM dream_companies WHERE uid = $1 and dream_company = $2 returning uid`;
        Promise.all([pool.query(Query, [uid, dream_company])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows.length == 1) {
                    res.status(200).send(rows[0][0]);
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            }).catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];