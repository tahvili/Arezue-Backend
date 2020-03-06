/*jshint esversion: 6*/
/*
 * We need to create an authorized API call after we get firebase integration
 * https://www.toptal.com/firebase/role-based-firebase-authentication
 */

// Need to call pool from config.js which is our database setup and others
const pool = require('../config');
const bodyParser = require('body-parser');

const validator = require('validator');

function sendJSON(statusCode, payload) {
    return JSON.stringify({ status_code: statusCode, payload: payload })
}

function sendError(statusCode, message, additionalInfo = {}) {
    return JSON.stringify({ status_code: statusCode, error: { message: message, additional_information: additionalInfo } })
}

exports.init = [
    function (request, response, next) {

        var firebaseID = validator.escape(request.body.firebaseID);
        var queryEmployer = "SELECT * FROM Employer WHERE fb_id = $1";
        var queryJobseeker = "SELECT * FROM Jobseeker WHERE fb_id = $1";

        //Performs both queries and then returns its results in an array which is used to handle the rest of the logic.
        Promise.all([pool.query(queryEmployer, [firebaseID]), pool.query(queryJobseeker, [firebaseID])])
            .then(values => {
                //[0, 1] or [1,1], or [0, 0] where first index is employer, second is jobseeker
                var rowCountsArray = values.map(r => r.rowCount);
                var rows = values.filter(r => r.rowCount > 0).map(r => r.rows[0]);
                //could not find any relevant user
                if (rows.length == 0) {
                    response.status(404);
                    response.send(sendError(404, `User with firebaseID = ${firebaseID} not found.`));
                    return; //console.error?
                }
                var userType = rowCountsArray[0] == 1 ? "employer" : "jobseeker" // this shouldn't be a string but using it temporarily
                rows[0]['user_type'] = userType; //attach the user type to the row object
                response.send(sendJSON(200, rows[0]))
            })
            .catch(e => { response.status(500); response.send(sendError(500, '/api/init error ' + e)) });
    }

]

// we can also do exports.func
//Get all users
exports.getAllUsers = function (request, response, next) {
    pool.query('SELECT * from Users', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

//Gets all jobseekers
exports.getAllJobSeekers = function (request, response, next) {
    pool.query('SELECT * from Jobseeker', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

//Gets all Employers
exports.getAllEmployers = function (request, response, next) {
    pool.query('SELECT * from Employer', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

// Route to create the jobseeker account
// Since they have different views, we will have differnet POST api request
/*
 ** Requirements: UUID, Email and Name
 */
exports.createJobseeker = [
    async function (req, res, next) {
        let firebaseID = validator.escape(req.body.firebaseID);
        let name = validator.escape(req.body.name);
        let email = validator.escape(req.body.email);

        if (validator.isEmpty(firebaseID) || validator.isEmpty(name) || validator.isEmpty(email)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isEmail(email)) {
            res.status(400).send("Invalid email address");
            return;
        }

        Promise.all([pool.query('INSERT INTO jobseeker (fb_id, name, email_address) VALUES ($1, $2, $3) RETURNING uid', [firebaseID, name, email])])
            .then(result => {

                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0].uid) {
                    res.status(200).send(`Jobseeker created with ID: ${rows[0].uid}`)
                } else {
                    res.status(400).send(`Jobseeker could not be created`);
                }

            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

exports.getJobseeker = [
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

        let create_employer = `SELECT * FROM jobseeker where uid = $1`;
        Promise.all([pool.query(create_employer, [uid])])
            .then(result => {
                // var rowCountsArray = values.map(r=>r.rowCount)
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows[0])
                } else {
                    res.status(400).send(`jobseeker could not be found`);
                }

            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

// Route to create the Employer account
// Since they have different views, we will have differnet POST api request
/*
 ** Requirements: UUID, Email and Name
 */
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
                // var rowCountsArray = values.map(r=>r.rowCount)
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
                // var rowCountsArray = values.map(r=>r.rowCount)
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows[0])
                } else {
                    res.status(400).send(`employer could not be found`);
                }

            })
            .catch(e => { res.status(500); res.send(sendError(500, '/employer error ' + e)) });
    }];

exports.updateJobseeker = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);

        let data = req.body;
        console.log(typeof data);
        console.log(data);

        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        delete data['uid'];
        delete data['firebaseID']
        pairs = Object.keys(data).map((key, index) => `${key}=$${index + 1}`).join(", ");

        values = Object.values(data)
        console.log(pairs);
        var update_jobseeker = `UPDATE jobseeker set ${pairs} where uid = $${values.length + 1} RETURNING uid`;
        Promise.all([pool.query(update_jobseeker, values.concat(uid))])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows[0]);
                } else {
                    res.status(400).send(`Jobseeker could not be updated`);
                }

            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

exports.updateEmployer = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);

        let data = req.body;
        console.log(uid)

        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        delete data['uid'];
        delete data['firebaseID']
        pairs = Object.keys(data).map((key, index) => `${key}=$${index + 1}`).join(", ");
        console.log(data);
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

// Skills
exports.getSkills = [
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
        let Query = `SELECT * FROM skills where uid = $1`;
        Promise.all([pool.query(Query, [uid])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows)

                if (rows[0]) {
                    res.status(200).send(rows[0])
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

exports.addSkill = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let skill = validator.escape(req.body.skill);
        if (validator.isEmpty(uid) || validator.isEmpty(skill)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        let Query = `INSERT INTO skills (uid, skill, ranking) VALUES ($1, $2, 0) returning uid`
        Promise.all([pool.query(Query, [uid, skill])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows[0]) {
                    res.status(200).send(rows);
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            }).catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

exports.deleteSkill = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let skill = validator.escape(req.body.skill);
        if (validator.isEmpty(uid) || validator.isEmpty(skill)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        let Query = `DELETE FROM skills WHERE uid = $1 and skill = $2 returning uid`;
        Promise.all([pool.query(Query, [uid, skill])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows[0]) {
                    res.status(200).send(rows);
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

// Dream careers
exports.getDreamCareers = [
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
        let Query = `SELECT * FROM Dream_Careers where uid = $1`;
        Promise.all([pool.query(Query, [uid])])
            .then(result => {
                var rows = {};
                rows = result.filter(r => r.rowCount > 0).map(r => r.rows)
                if (rows) {
                    res.status(200).send(rows[0])
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

exports.addDreamCareers = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let dream_career = validator.escape(req.body.dream_career);
        if (validator.isEmpty(uid) || validator.isEmpty(dream_career)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        let Query = `INSERT INTO dream_careers (uid, dream_career, ranking) VALUES ($1, $2, 0) returning uid`;
        Promise.all([pool.query(Query, [uid, dream_career])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows[0]) {
                    res.status(200).send('Added dream career');
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            }).catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

exports.deleteDreamCareers = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let dream_career = validator.escape(req.body.dream_career);
        if (validator.isEmpty(uid) || validator.isEmpty(dream_career)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        let Query = `DELETE FROM dream_careers WHERE uid = $1 and dream_career = $2 returning uid`;
        Promise.all([pool.query(Query, [uid, dream_career])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows[0]) {
                    res.status(200).send(rows);
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

// Dream companies
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
        let Query = `SELECT * FROM Dream_Companies where uid = $1`;
        Promise.all([pool.query(Query, [uid])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows)

                if (rows[0]) {
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
        if (validator.isEmpty(uid) || validator.isEmpty(dream_company)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        let Query = `INSERT INTO dream_companies (uid, dream_company, preference) VALUES ($1, $2, 0) returning uid`;
        Promise.all([pool.query(Query, [uid, dream_company])])
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
        let dream_company = validator.escape(req.body.dream_company);
        if (validator.isEmpty(uid) || validator.isEmpty(dream_company)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        let Query = `DELETE FROM dream_companies WHERE uid = $1 and dream_company = $2 returning uid`;
        Promise.all([pool.query(Query, [uid, dream_company])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows[0]) {
                    res.status(200).send(rows);
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            }).catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

// Experiences
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
        Promise.all([pool.query(Query, [uid])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows)

                if (rows[0]) {
                    res.status(200).send(rows[0])
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
        let Query = `INSERT INTO experiences (uid, title, start_date, end_date, description) VALUES ($1, $2, $3, $4, $5) returning uid`;
        Promise.all([pool.query(Query, [uid, title, start_date, end_date, description])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows[0]) {s
                    res.status(200).send('Added job experience');
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            })
            .catch(e => { res.status(500); re.send(sendError(500, '/jobseeker error ' + e)) });
    }];

exports.deleteExp = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
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
        let Query = `DELETE FROM experiences WHERE uid = $1returning uid`;
        Promise.all([pool.query(Query, [uid])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows[0]) {
                    res.status(200).send(rows);
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            }).catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];

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
       
        Promise.all([pool.query(Query, [company_name])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows[0]) {
                    res.status(200).send(rows[0]);
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

// ! To be updated when more tables are in here
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
                if (mapping[i] === 'experiences' || mapping[i] === 'education' || mapping[i] === 'certification') {
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