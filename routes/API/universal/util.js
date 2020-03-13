const jwt = require('jsonwebtoken');
const fs = require('fs');
const newSessionRoutes = [{path: '/api/v1/jobseeker', method: 'POST'}];
const authRoutes = [{path: '/', method: 'GET'}];
const express = require('express');
const app = express.Router({
    mergeParams: true,
    strict: true
});

const privateKey = fs.readFileSync(__dirname + '/private.pem', 'utf8');

// Will use public key after figuring this out

exports.verifyToken = [
    function (req, res, next) {
        // First get authentiation header value
        const bearerHeader = req.header('Authorization');
        console.log(bearerHeader);
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            req.token = bearerToken;
            // We need to decode the token to see if its valid
            
            jwt.verify(req.token, privateKey, (err, authData) => {
                if (err) {
                    res.sendStatus(403);
                } else {
                    req.authData = authData;
                    next();
                }
            });
            
        } else {
            res.sendStatus(403);
        }
    },
];

exports.createToken = function (data, callback) {
        let privateKey = fs.readFileSync(__dirname + '/private.pem', 'utf8');
        jwt.sign(data, privateKey, (err, token) => {
            if (err) {
                callback(err, null);
            }
            callback(null, token);
        });
    };
