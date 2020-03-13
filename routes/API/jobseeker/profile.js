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

exports.getProfile = [
    async function(req, res, next) {
        let uid = validator.escape(req.params.uid);
        if (validator.isEmpty(uid)) {
            res.status(400).send();
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send();
            return;
        }

        if (uid !== req['authData']['uid']) return res.sendStatus(403);

        let query_jobseeker = `SELECT uid, acceptance_wage, goal_wage, open_relocation FROM jobseeker WHERE uid = $1`;
        let query_skills = `SELECT * FROM skills where uid = $1`;
        let query_dream_careers = `SELECT * FROM dream_careers WHERE uid = $1`;
        let query_dream_companies = `SELECT * FROM dream_companies WHERE uid = $1`;
        let query_experiences = `SELECT * FROM experiences WHERE uid = $1`;
        let query_certification = `SELECT * FROM certification WHERE uid = $1`;
        let query_education = `SELECT * FROM education WHERE uid = $1`;
        
        Promise.all([await pool.query(query_jobseeker, [uid]), await pool.query(query_skills, [uid]),
        await pool.query(query_dream_careers, [uid]), await pool.query(query_dream_companies, [uid]),
        await pool.query(query_experiences, [uid]), await pool.query(query_certification, [uid]),
        await pool.query(query_education, [uid])])
        .then(values => {
            
            let mapping = ['', 'skill', 'dream_career', 'dream_company', 'experiences', 'certification', 'education'];
            // Don't filter as will need to do a loop
            let rows = values.map(r => r.rows);
            // Need to check if jobseeker exists
            if (rows[0].length === 0) {
                res.status(404).send()
                return;
            }
            // console.log(rows);
            let result = {}
            result['jobseeker'] = {};
            result['jobseeker']['uid'] = rows[0][0]['uid'];
            result['jobseeker']['info'] = {};
            // We don't want uid in that field anymore
            delete rows[0][0]['uid'];
            Object.keys(rows[0][0]).forEach(function(key) {
                result['jobseeker']['info'][key] = rows[0][0][key];
            })
            
            for (let i = 1; i < rows.length; i++) {
                // console.log(mapping[i])
                if (mapping[i] === 'experiences' || mapping[i] === 'education' || mapping[i] === 'certification' || mapping[i] == 'skill') {
                    Object.keys(rows[i]).forEach(function(key) {
                        delete rows[i][key]['uid'];
                    })
                    result['jobseeker']['info'][mapping[i]] = rows[i];
                } else {
                    result['jobseeker']['info'][mapping[i]] = []
                    for (let j = 0; j < rows[i].length; j++) {
                        console.log(rows[i][j]);
                        result['jobseeker']['info'][mapping[i]].push(rows[i][j][mapping[i]]);
                        
                    }
                }
                
            }
            console.log(JSON.stringify(result));
            console.log(rows);

            res.type('application/json')
            res.status(200).send(JSON.stringify(result));

            
        }) .catch(e => { res.status(500); res.send(sendError(500, 'profile error ' + e)) });
    }
]