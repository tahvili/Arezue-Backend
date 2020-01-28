// Need to call pool from config.js which is our database setup and others
const pool = require('../config')

// we can also do exports.func
const getAllUsers = function (request, response, next) {
    pool.query('SELECT * from jobseeker', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const createJobseeker = function(request, response, next) {
    let firebaseID = request.params.firebaseID;
    let name = request.params.Name;
    let email = request.params.Email;
    pool.query('INSERT INTO jobseeker (uid, name, email_address) VALUES (uuid_generate_v4, $1, $2) RETURNING *', [name, email], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).send(`User added with ID: ${results.rows[0].uid}`)
    })

}
module.exports = {
    getAllUsers,
    createJobseeker,
}
