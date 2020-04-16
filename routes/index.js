var express = require('express');
var router = express.Router({ mergeParams: true, strict: true});

// var db = require('./queries');
var bodyParser = require('body-parser')


//bodyParser was initialized in queries but never used, moving it here and attaching it to "router"
// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
    extended: true
})
router.use(jsonParser)

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Arezue API' });
});

router.get('/api', function(req, res, next) {
  res.render('index', { title: 'Arezue API' });
});

module.exports = router;
 