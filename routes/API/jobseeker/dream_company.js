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
        res.type('application/json')
        let Query = `SELECT uid, company, id as company_id, ranking FROM Pre_Dream_Companies PDC
                    LEFT JOIN Dream_Companies DC ON PDC.id = DC.company_id where uid = $1`;
        Promise.all([pool.query(Query, [uid])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows)
                res.type('application/json');
                if (rows[0]) {
                    if (rows.length == 0) {
                        res.status(200).send([]);
                    }
                    res.status(200).send({'data': rows[0]})
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            })
            .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];
    exports.addDreamCompanies = [
        async function (req, res, next) {
            let uid = validator.escape(req.params.uid);
            let company = validator.escape(req.body.dream_company);
            let ranking;

            if (req.body.ranking) {
                ranking = validator.escape(req.body.ranking);
                if (ranking.length != req.body.ranking.length) return res.sendStatus(400);
            } else {
                ranking = 0;
            }

            if (validator.isEmpty(uid) || validator.isEmpty(company)) {
                res.status(400).send("One of the field is empty");
                return;
            }
            if (!validator.isUUID(uid, [4])) {
                res.status(400).send("Invalid UUID");
                return;
            }
            let getCompanyId = `SELECT id FROM pre_dream_companies WHERE LOWER(company) = LOWER($1)`;
            let addPreCompany = `INSERT INTO pre_dream_companies(company) values(LOWER($1)) RETURNING id;`;
            let addCompany = `INSERT INTO dream_companies(uid, company_id, ranking) VALUES($1, $2, $3) returning uid`;
            // Idealy should check if uid even exists first. 
            await Promise.all([pool.query(getCompanyId, [company])])
                .then(result => {
                    // company is in pre_dream_company table. Proceed to add jobseeker's dream company
                    if (result[0].rowCount > 0) {
                        row = result.map(r => r.rows);
                        Promise.all([pool.query(addCompany, [uid, row[0][0].id, ranking])])
                            .then(result2 => {
                                row = result2.map(r => r.rows);
                                res.status(200).send(row[0][0]);
                                return;
                            })
                            .catch(e => {
                                res.status(500);
                                res.send(sendError(500, '/dream_company ' + e))
                                return;
                            });
                        // company is NOT in pre_dream_companys table. Need to add company to pre_dream_companys first
                    } else {
                        Promise.all([pool.query(addPreCompany, [company])])
                            .then(result3 => {
                                row = result3.map(r => r.rows)
                                // Now we can add to skills
                                Promise.all([pool.query(addCompany, [uid, row[0][0].id, ranking])])
                                    .then(result4 => {
                                        console.log(result4);
                                        row = result4.map(r => r.rows);
                                        res.status(200).send(row[0][0]);
                                        return;
                                    })
                                    .catch(e => {
                                        res.status(500);
                                        res.send(sendError(500, '/dream_company ' + e))
                                        return;
                                    });
                            })
                            .catch(e => {
                                res.status(500);
                                res.send(sendError(500, '/dream_company ' + e))
                                return;
                            });
                    }
                })
                .catch(e => {
                    res.status(500);
                    res.send(sendError(500, '/dream_company ' + e))
                    return;
                });
            }
];
// exports.addDreamCompanies = [
//     async function (req, res, next) {
//         let uid = validator.escape(req.params.uid);
//         let dream_company = validator.escape(req.body.dream_company);
//         let ranking = validator.escape(req.body.ranking);
//         if (validator.isEmpty(uid) || validator.isEmpty(dream_company)) {
//             res.status(400).send("One of the field is empty");
//             return;
//         }
//         if (!validator.isUUID(uid, [4])) {
//             res.status(400).send("Invalid UUID");
//             return;
//         }
//         if (uid != req.params.uid) return res.status(400).send();
//         if (dream_company != req.body.dream_company) return res.status(400).send();
//         if (ranking != req.body.ranking) return res.status(400).send();

//         let Query = `INSERT INTO dream_companies (uid, dream_company, preference) VALUES ($1, $2, $3) returning uid`;
//         Promise.all([pool.query(Query, [uid, dream_company, ranking])])
//             .then(result => {
//                 var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

//                 if (rows[0]) {
//                     res.status(200).send('Added dream company');
//                 } else {
//                     res.status(400).send(`Jobseeker could not be found`);
//                 }
//             })
//             .catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
//     }];

exports.deleteDreamCompanies = [
    async function (req, res, next) {
        let uid = validator.escape(req.params.uid);
        let dream_company = validator.escape(req.params.dream_company);
        if (validator.isEmpty(uid) || validator.isEmpty(dream_company)) {
            res.status(400).send("One of the field is empty");
            return;
        }
        if (!validator.isUUID(uid, [4])) {
            res.status(400).send("Invalid UUID");
            return;
        }
        let Query = `DELETE FROM dream_companies WHERE uid = $1 and company_id = (SELECT DISTINCT id from pre_dream_companies WHERE company ILIKE $2) returning uid`;
        Promise.all([pool.query(Query, [uid, dream_company])])
            .then(result => {
                var rows = result.filter(r => r.rowCount > 0).map(r => r.rows);

                if (rows.length == 1) {
                    res.status(200).send(rows[0][0]);
                } else {
                    res.status(400).send(`Jobseeker could not be found`);
                }
            }).catch(e => { res.status(500); res.send(sendError(500, '/jobseeker error ' + e)) });
    }];
