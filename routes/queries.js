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
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows)
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
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0]);

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
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0]);

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
                    res.status(200).send(rows)
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
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0]);

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
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0]);

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
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows)
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
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0]);

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
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0]);

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
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0])

                if (rows[0]) {
                    res.status(200).send(rows)
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
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0]);

                if (rows[0]) {
                    s
                    res.status(200).send(rows[0]);
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
        let Query = `DELETE FROM experiences WHERE uid = $1 returning uid`;
        Promise.all([pool.query(Query, [uid])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0]);

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
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0]);

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
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows[0]);

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

exports.addEducation = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let name = validator.escape(req.body.school_name);
        let start_date = validator.escape(req.body.start_date);
        let grad_date = validator.escape(req.body.grad_date);
        let program = validator.escape(req.body.program);


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