var express = require('express');
var router = express.Router({ mergeParams: true, strict: true});
const bodyParser = require('body-parser');

// const db = require('./queries');

router.use(function (req, res, next) {
    console.log("Logging request... (Message does nothing atm)");
    next();
})

router.use('/jobseeker/', require('./API/jobseeker'));
router.use('/company', require('./API/company'));
router.use('/employer', require('./API/employer'));
router.use('/search', require('./API/search'));
router.use('/init', require('./API/universal'));



module.exports = router;