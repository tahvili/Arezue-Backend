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

exports.getAllResume = [
    async function(req, res, next) {
        let uid = validator.escape(req.params.uid);
        if (validator.isEmpty(uid)) {
            res.status(422).send();
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send();
            return;
        }
        let query = `SELECT * FROM resumes where uid = $1`;
        Promise.all([pool.query(query, [uid])])
            .then(result => {
                let rows = result.map(r => r.rows)[0];
                let returning = {'data': []};
                if (rows.length > 0) {
                    res.type('application/json');
                    Object.keys(rows).forEach(function(key) {
                        delete rows[key]['uid'];
                        returning.data.push(rows[key]);
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

exports.getResume = [
    async function(req, res, next) {
        let uid = validator.escape(req.params.uid);
        let resume_id = validator.escape(req.params.resume_id);
        if (validator.isEmpty(uid) || validator.isEmpty(resume_id)) {
            res.status(422).send();
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send();
            return;
        }
        let query = `SELECT * FROM resumes WHERE resume_id = $1 and uid = $2`;
        Promise.all([pool.query(query, [resume_id, uid])])
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
                res.status(500, res.send(sendError(500, '/jobseeker ' + e)));
            });
    }
];

exports.createResume = [
    async function(req, res, next) {
        let uid = validator.escape(req.params.uid);        
        let resume = req.body.resume;
        let name = req.body.resume_id;

        if (resume == '') return res.status(400).send();
        
        if (validator.isEmpty(uid)) {
            res.status(422).send();
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send();
            return;
        }

        let query = `INSERT INTO resumes (uid, resume, resume_name) VALUES ($1, $2, $3) returning uid, resume_id`;
        Promise.all([pool.query(query, [uid, resume, name])])
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

exports.updateResume = [
    async function(req, res, next) {
        let uid = validator.escape(req.params.uid);
        let resume_id = validator.escape(req.params.resume_id);
        let resume = req.body.resume;
         
        if (resume == '') return res.status(400).send();
        
        if (validator.isEmpty(uid) || validator.isEmpty(resume_id)) {
            res.status(422).send();
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send();
            return;
        }

        let query = `UPDATE resumes set resume = $1 where uid = $2 and resume_id = $3 returning uid`;
        Promise.all([pool.query(query, [resume, uid, resume_id])])
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

exports.deleteResume = [
    async function(req, res, next) {
        let uid = validator.escape(req.params.uid);
        let resume_id = validator.escape(req.params.resume_id);
        if (validator.isEmpty(uid) || validator.isEmpty(resume_id)) {
            res.status(422).send();
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send();
            return;
        }

        let query = `DELETE FROM resumes WHERE uid = $1 and resume_id = $2 RETURNING uid`;
        Promise.all([pool.query(query, [uid, resume_id])])
            .then(result => {
                let rows = result.map(r => r.rows[0]);
                if (rows[0]) {
                    res.status(200).send(rows[0]);
                } else {
                    res.status(404).send();
                }
                return;
            })
            .catch(e => {
                res.status(500, res.send(sendError(500, '/employer ' + e)));
            });
    }
]