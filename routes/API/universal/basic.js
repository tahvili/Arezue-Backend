// Global var and functions
const pool = require('../../../config');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const util = require('../universal/util');

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

                util.createToken({"uid": rows[0]['uid'], "fb_id": rows[0]['fb_id'], "type": rows[0]['user_type']}, function(err, token) {
                    console.log(token);
                    response.json({
                        'status': 200,
                        'payload': rows[0],
                        token
                    });
                });
                

            })
            .catch(e => { response.status(500); response.send(sendError(500, '/api/init error ' + e)) });
    }

]

exports.getAllUsers = function (request, response, next) {
    pool.query('SELECT * from Users', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};