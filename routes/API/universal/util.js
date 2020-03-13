const jwt = require('jsonwebtoken');
const fs = require('fs');
const newSessionRoutes = [{path: '/api/v1/jobseeker', method: 'POST'}];
const authRoutes = [{path: '/', method: 'GET'}];
const express = require('express');
const app = express.Router({
    mergeParams: true,
    strict: true
});

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
            next();
        } else {
            res.sendStatus(403);
        }
    }
];