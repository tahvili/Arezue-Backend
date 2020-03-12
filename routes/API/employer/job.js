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
    async function(req, res, next) {
        let euid = validator.escape(req.params.uid);

    }
]

exports.addJob = [
    async function(req, res, next) {
        let euid = validator.escape(req.params.uid);
        let company_name = validator.escape(req.body.company_name);
        let title = validator.escape(req.body.title);
        if (euid.length != req.params.uid.length) return res.status(400).send();
        if (company_name.length != req.params.company_name.length) return res.status(400).send();
        if (title.length != req.body.title.length) return res.status(400).send();
        console.log(req.body.wage);
        return; 
    }
]