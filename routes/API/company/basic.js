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

exports.addCompany = [
    async function (req, res, next) {
        let name = validator.escape(req.body.name);
        let Query = `INSERT INTO company (company_name) VALUES ($1) returning company_name`;
        Promise.all([pool.query(Query, [name])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows[0]) {
                    res.status(200).send(`Added company ${name} with id: ${rows[0].company_name}`);
                } else {
                    res.status(400).send(`Company could not be added`);
                }
            })
            .catch(e => { res.status(500); res.send(sendError(500, '/company error ' + e)) });
    }];

exports.getCompany = [
    async function (req, res, next) {
        let company_name = validator.escape(req.params.company_name);
        let Query = `SELECT * FROM company WHERE company_name = ($1)`;
        res.type('application/json');
        Promise.all([pool.query(Query, [company_name])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows[0]) {
                    res.status(200).send({'data': rows[0]});
                } else {
                    res.status(400).send(`Company could not be found`);
                }
            })
            .catch(e => { res.status(500); res.send(sendError(500, '/company error ' + e)) });
    }];


exports.updateCompany = [

];

exports.deleteCompany = [

];