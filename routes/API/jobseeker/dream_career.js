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
        res.type('application/json');
        let Query = `SELECT uid, career, id as pre_career_id, ranking FROM Pre_Dream_Careers PDC 
                    LEFT JOIN Dream_Careers DC ON PDC.id = DC.career_id where uid = $1`;
        Promise.all([pool.query(Query, [uid])])
            .then(result => {
                var rows = {};
                rows = result.filter(r => r.rowCount > 0).map(r => r.rows)
                res.type('application/json')
                if (rows) {
                    if (rows.length == 0) {
                        res.status(200).send([]);
                    }
                    res.status(200).send({'data': rows[0]});
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

exports.addDreamCareers = [
        async function (req, res, next) {
            let uid = validator.escape(req.params.uid);
            let career = validator.escape(req.body.dream_career);
            let ranking;
            if (req.body.ranking) {
                ranking = validator.escape(req.body.ranking);
                if (ranking.length != req.body.ranking.length) return res.sendStatus(400);
            } else {
                ranking = 0;
            }
            if (validator.isEmpty(uid) || validator.isEmpty(career)) {
                res.status(400).send("One of the field is empty");
                return;
            }
            if (!validator.isUUID(uid, [4])) {
                res.status(400).send("Invalid UUID");
                return;
            }
            let getCareerId = `SELECT id FROM pre_dream_careers WHERE LOWER(career) = LOWER($1)`;
            let addPreCareer = `INSERT INTO pre_dream_careers(career) values(LOWER($1)) RETURNING id;`;
            let addCareer = `INSERT INTO dream_careers(uid, career_id, ranking) VALUES($1, $2, $3) returning uid`;
            // Idealy should check if uid even exists first. 
            await Promise.all([pool.query(getCareerId, [career])])
                .then(result => {
                    // career is in pre_dream_career table. Proceed to add jobseeker's dream career
                    if (result[0].rowCount > 0) {
                        row = result.map(r => r.rows);
                        Promise.all([pool.query(addCareer, [uid, row[0][0].id, ranking])])
                            .then(result2 => {
                                row = result2.map(r => r.rows);
                                res.status(200).send(row[0][0]);
                                return;
                            })
                            .catch(e => {
                                res.status(500);
                                res.send(sendError(500, '/dream_career ' + e))
                                return;
                            });
                        // career is NOT in pre_dream_careers table. Need to add career to pre_dream_careers first
                    } else {
                        Promise.all([pool.query(addPreCareer, [career])])
                            .then(result3 => {
                                row = result3.map(r => r.rows)
                                // Now we can add to skills
                                Promise.all([pool.query(addCareer, [uid, row[0][0].id, ranking])])
                                    .then(result4 => {
                                        console.log(result4);
                                        row = result4.map(r => r.rows);
                                        res.status(200).send(row[0][0]);
                                        return;
                                    })
                                    .catch(e => {
                                        res.status(500);
                                        res.send(sendError(500, '/dream_career ' + e))
                                        return;
                                    });
                            })
                            .catch(e => {
                                res.status(500);
                                res.send(sendError(500, '/dream_career ' + e))
                                return;
                            });
                    }
                })
                .catch(e => {
                    res.status(500);
                    res.send(sendError(500, '/dream_career ' + e))
                    return;
                });
            }
];
// exports.addDreamCareers = [
//     async function (req, res, next) {
//         let uid = validator.escape(req.params.uid);
//         let dream_career = validator.escape(req.body.dream_career);
//         let ranking = validator.escape(req.body.ranking);
//         if (validator.isEmpty(uid) || validator.isEmpty(dream_career)) {
//             res.status(400).send("One of the field is empty");
//             return;
//         }
//         if (!validator.isUUID(uid, [4])) {
//             res.status(400).send("Invalid UUID");
//             return;
//         }
//         if (uid != req.params.uid) return res.status(400).send();
//         if (dream_career != req.body.dream_career) return res.status(400).send();
//         if (ranking != req.body.ranking) return res.status(400).send();

//         let Query = `INSERT INTO dream_careers (uid, dream_career, ranking) VALUES ($1, $2, $3) returning uid`;
//         Promise.all([pool.query(Query, [uid, dream_career, ranking])])
//             .then(result => {
//                 var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

//                 if (rows[0]) {
//                     res.status(200).send('Added dream career');
//                 } else {
//                     res.status(400).send(`Jobseeker could not be found`);
//                 }
//             }).catch(e => {
//                 res.status(500);
//                 res.send(sendError(500, '/jobseeker ' + e))
//             });
//     }
// ];

exports.deleteDreamCareers = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let dream_career = validator.escape(req.params.dream_career);
        if (validator.isEmpty(uid) || validator.isEmpty(dream_career)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        let Query = `DELETE FROM dream_careers WHERE uid = $1 and career_id = (SELECT DISTINCT id from pre_dream_careers WHERE career ILIKE $2) returning uid`;
        //let Query = `DELETE FROM dream_careers WHERE uid = $1 and dream_career = $2 returning uid`;
        Promise.all([pool.query(Query, [uid, dream_career])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows.length == 1) {
                    res.status(200).send(rows[0][0]);
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
