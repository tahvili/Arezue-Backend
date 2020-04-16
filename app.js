var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var bodyParser = require('body-parser')
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();


const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
var options = {
  swaggerDefinition: {
    // host: 'api.daffychuy.com',
    
    basePath: '/api/v1',
    info: {
      title: 'Arezue API',
      version: '0.0.1',
      description: 'API for all api calls to Arezue server'
    }
  },
  apis: ['./routes/API/universal.js', './routes/API/company.js', './routes/API/employer.js', './routes/API/jobseeker.js', './routes/API/search.js'],
};
const swaggerSpec = swaggerJSDoc(options);

// API-docs
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json())


// dotenv for all our environment variables
require('dotenv').config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
