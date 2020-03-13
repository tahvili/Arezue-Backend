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
        Promise.all([pool.query(Query, [uid])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows)

                if (rows[0]) {
                    res.status(200).send(rows[0])
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            })
            .catch(e => {
                res.status(500);
                res.send(sendError(500, '/jobseeker error ' + e))
            });
    }
];


exports.addSkill = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let skill = validator.escape(req.body.skill);
        let level = validator.escape(req.body.level);
        let years = validator.escape(req.body.years);
        if (validator.isEmpty(uid) || validator.isEmpty(skill)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        // https://stackoverflow.com/questions/28250680/how-do-i-access-previous-promise-results-in-a-then-chain
        // https://stackoverflow.com/questions/39693228/building-promise-chain-with-logic-using-postgresql
        // https://stackoverflow.com/questions/33257412/how-to-handle-the-if-else-in-promise-then
        // https://stackoverflow.com/questions/40804351/how-do-i-chain-multiple-conditional-promises
        let getSkillId = `SELECT id FROM pre_skills WHERE LOWER(skill) = LOWER($1)`;
        let addPreSkill = `INSERT INTO pre_skills(skill) values(LOWER($1)) RETURNING id;`;
        let addSkill = `INSERT INTO skills(uid, skill_id, level, years) VALUES($1, $2, $3, $4) returning uid`;

        await Promise.all([pool.query(getSkillId, [skill])])
            .then(result => {
                // console.log(result);
                // console.log(result[0].rowCount);
                // skill is in pre_skills table. Proceed to add jobseeker's skill
                if (result[0].rowCount > 0) {
                    row = result.map(r => r.rows);
                    // console.log(row)
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
                            // console.log(`preskill: ${row[0][0].id}`);
                            // Now we can add to skills
                            Promise.all([pool.query(addSkill, [uid, row[0][0].id, level, years])])
                                .then(result4 => {
                                    row = result4.map(r => r.rows);
                                    res.status(200).send(row[0][0]);
                                    return;
                                })
                                .catch(e => {
                                    res.status(500);
                                    res.send(sendError(500, '/jobseeker2 ' + e))
                                    return;
                                });
                        })
                        .catch(e => {
                            res.status(500);
                            res.send(sendError(500, '/jobseeker3 ' + e))
                            return;
                        });
                }
            })
            .catch(e => {
                res.status(500);
                res.send(sendError(500, '/jobseeker4 ' + e))
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
        let Query = `DELETE FROM skills WHERE uid = $1 and skill = $2 returning uid`;
        Promise.all([pool.query(Query, [uid, skill])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows.length == 1) {
                    res.status(200).send(rows[0][0]);
                } else {
                    res.status(404).send('Delete is case sensitive');
                }
            })
            .catch(e => {
                res.status(500);
                res.send(sendError(500, '/jobseeker error ' + e))
            });
    }
];