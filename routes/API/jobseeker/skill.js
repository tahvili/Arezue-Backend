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
        let query2 = `SELECT Skill from Pre_Skills where id = $1`;
        res.type('application/json')
        await Promise.all([pool.query(Query, [uid])])
            .then(async result => {
                if (result[0].rowCount == 0) {
                    res.status(404).send('Jobseeker not found');
                    return;
                }
                var row1 = result.filter(r => r.rowCount > 0).map(r => r.rows)
                var skills = [];
                for (i = 0; i < row1[0].length; i++) {
                    var years = row1[0][i].years;
                    var level = row1[0][i].level;
                    await Promise.all([pool.query(query2, [row1[0][i].skill_id])])
                        .then(result2 => {
                            var row2 = result2.filter(r => r.rowCount > 0).map(r => r.rows);
                            var ele = {};
                            ele.skill = row2[0][0].skill;
                            ele.years = years;
                            ele.level = level;
                            skills.push(ele);
                        })
                        .catch(e => {
                            res.status(500);
                            res.send(sendError(500, '/jobseeker ' + e))
                            return;
                        });
                }
                if (skills) {
                    
                    res.status(200).send({'data': skills})
                    return;
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            })

            .catch(e => {
                res.status(500);
                res.send(sendError(500, '/jobseeker ' + e))
            });
    }
];

exports.addSkill = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let skill = validator.escape(req.body.skill);
        let level = validator.escape(req.body.level);
        let years = validator.escape(req.body.years);
        var ranking = null;
        if (validator.isEmpty(uid) || validator.isEmpty(skill)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        let getSkillId = `SELECT id FROM pre_skills WHERE LOWER(skill) = LOWER($1)`;
        let addPreSkill = `INSERT INTO pre_skills(skill) values(LOWER($1)) RETURNING id;`;
        let addSkill = `INSERT INTO skills(uid, skill_id, level, years) VALUES($1, $2, $3, $4) returning uid`;
        // Idealy should check if uid even exists first. 
        await Promise.all([pool.query(getSkillId, [skill])])
            .then(result => {
                // skill is in pre_skills table. Proceed to add jobseeker's skill
                if (result[0].rowCount > 0) {
                    row = result.map(r => r.rows);
                    Promise.all([pool.query(addSkill, [uid, row[0][0].id, level, years])])
                        .then(result2 => {
                            row = result2.map(r => r.rows);
                            res.status(200).send(row[0][0]);
                            return;
                        })
                        .catch(e => {
                            res.status(500);
                            res.send(sendError(500, '/jobseeker1 ' + e))
                            return;
                        });
                    // skill is NOT in pre_skills table. Need to add skill to pre_skill first
                } else {
                    Promise.all([pool.query(addPreSkill, [skill])])
                        .then(result3 => {
                            row = result3.map(r => r.rows)
                            // Now we can add to skills
                            Promise.all([pool.query(addSkill, [uid, row[0][0].id, level, years])])
                                .then(result4 => {
                                    console.log(result4);
                                    row = result4.map(r => r.rows);
                                    res.status(200).send(row[0][0]);
                                    return;
                                })
                                .catch(e => {
                                    res.status(500);
                                    res.send(sendError(500, '/jobseeker ' + e))
                                    return;
                                });
                        })
                        .catch(e => {
                            res.status(500);
                            res.send(sendError(500, '/jobseeker ' + e))
                            return;
                        });
                }
            })
            .catch(e => {
                res.status(500);
                res.send(sendError(500, '/jobseeker ' + e))
                return;
            });
    }];

exports.deleteSkill = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let skill = validator.escape(req.params.skill);
        if (validator.isEmpty(uid) || validator.isEmpty(skill)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        let Query = `DELETE FROM skills WHERE uid = $1 AND skill_id = 
                        (SELECT id FROM pre_skills 
                        WHERE skill = $2) returning uid`;
        Promise.all([pool.query(Query, [uid, skill])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows.length == 1) {
                    res.status(200).send(rows[0][0]);
                } else {
                    res.status(404).send('Skill not found');
                }
            })
            .catch(e => {
                res.status(500);
                res.send(sendError(500, '/jobseeker error ' + e))
            });
    }
];

exports.searchSkill = [
    async function(req, res, next) {
        if (validator.isEmpty(req.query.q)) return res.sendStatus(400);
        let search_query = validator.escape(req.query.q);
        if (search_query.length != req.query.q.length) return res.sendStatus(400);
        let limit = validator.escape(req.query.limit);
        if (limit.length != req.query.limit.length) return res.sendStatus(400);
        let uid = validator.escape(req.params.uid);
        if (validator.isEmpty(uid) || !validator.isUUID(uid, [4])) return res.sendStatus(400);

        let Query = `SELECT skill FROM pre_skills WHERE skill LIKE $1 LIMIT $2`;
        search_query += '%';
        res.type('application/json');

        Promise.all([pool.query(Query, [search_query])])
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
                res.send(sendError(500, '/jobseeker ' + e))
            });
    }
];