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

exports.searchCandidates = [
    async function(req, res, next) {
        var reqQuery = req.body;
        console.log(reqQuery);
        if ("skills" in reqQuery) {
            skills = reqQuery.skills.split(",").map(skill => skill.toLowerCase());
            
            let query = "SELECT * FROM resumes;";
            pool.query(query)
            .then(result => {
                var rows = result.rows;
                if (rows.length > 0) {
                    //Filter out for resumes without the skill attribute
                    var candidates = rows.filter(r => r.hasOwnProperty("resume") && r.resume.hasOwnProperty("skill"))

                    //postgres jsons with subrrays are returned as arrays, need to sanitize (not the best way)
                    candidates.forEach(c => {
                        if (typeof(c.resume.skill) == "string") {
                            c.resume.skill = c.resume.skill.replace("[", "").replace("]","").split(",")
                        }
                    })

                    //filter for resumers that contain skills as passed in the query body
                    candidates = candidates.filter(r => r.resume.skill.some((el) => {return skills.includes(el.toLowerCase())}))
                    return res.status(200).send(sendJSON(200, candidates))

                } else {
                    return res.status(200).send(sendJSON(200, {}));
                }
            })
            .catch(e => {
                res.status(500, res.send(sendError(500, '/search ' + e)));
            })
            
        } else {
            res.status(200).send(sendJSON(200, {}));
            return;
        }
    }
]

exports.searchSkill = [
    async function(req, res, next) {
 
        if (validator.isEmpty(req.query.q)) return res.sendStatus(400);
        let search_query = validator.escape(req.query.q);
        if (search_query.length != req.query.q.length) return res.sendStatus(400);
        let limit;
        if (!req.query.limit) {
            limit = 25;
        } else {
            limit = validator.escape(req.query.limit);
            if (limit.length != req.query.limit.length) return res.sendStatus(400);
        }
        
        let Query = `SELECT skill FROM pre_skills WHERE LOWER(skill) LIKE LOWER($1) LIMIT $2`;
        search_query = '%' + search_query + '%';
        res.type('application/json');

        Promise.all([pool.query(Query, [search_query, limit])])
            .then(result => {
                var rows = result.map(r => r.rows)[0];
                let results = [];

                Object.keys(rows).forEach(function(key) {
                    results.push(rows[key].skill);
                });
                res.status(200).send({data: results});
            })
            .catch(e => {
                res.status(500);
                res.send(sendError(500, '/searchSkill ' + e))
            });
    }
];

exports.searchCareer = [
    async function(req, res, next) {
 
        if (validator.isEmpty(req.query.q)) return res.sendStatus(400);
        let search_query = validator.escape(req.query.q);
        if (search_query.length != req.query.q.length) return res.sendStatus(400);
        let limit;
        if (!req.query.limit) {
            limit = 25;
        } else {
            limit = validator.escape(req.query.limit);
            if (limit.length != req.query.limit.length) return res.sendStatus(400);
        }
        
        let Query = `SELECT career FROM pre_dream_careers WHERE LOWER(career) LIKE LOWER($1) LIMIT $2`;
        search_query = '%' + search_query + '%';
        res.type('application/json');

        Promise.all([pool.query(Query, [search_query, limit])])
            .then(result => {
                var rows = result.map(r => r.rows)[0];
                let results = [];

                Object.keys(rows).forEach(function(key) {
                    results.push(rows[key].career);
                });
                res.status(200).send({data: results});
            })
            .catch(e => {
                res.status(500);
                res.send(sendError(500, '/searchCareer ' + e))
            });
    }
];

exports.searchCompany = [
    async function(req, res, next) {
 
        if (validator.isEmpty(req.query.q)) return res.sendStatus(400);
        let search_query = validator.escape(req.query.q);
        if (search_query.length != req.query.q.length) return res.sendStatus(400);
        let limit;
        if (!req.query.limit) {
            limit = 25;
        } else {
            limit = validator.escape(req.query.limit);
            if (limit.length != req.query.limit.length) return res.sendStatus(400);
        }
        
        let Query = `SELECT company FROM pre_dream_companies WHERE LOWER(company) LIKE LOWER($1) LIMIT $2`;
        search_query = '%' + search_query + '%';
        res.type('application/json');

        Promise.all([pool.query(Query, [search_query, limit])])
            .then(result => {
                var rows = result.map(r => r.rows)[0];
                let results = [];

                Object.keys(rows).forEach(function(key) {
                    results.push(rows[key].company);
                });
                res.status(200).send({data: results});
            })
            .catch(e => {
                res.status(500);
                res.send(sendError(500, '/searchCompany ' + e))
            });
    }
];