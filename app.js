var express = require('express')
var path = require ('path')
var cookieParser =require ('cookie-parser')
var bodyParser = require('body-parser')
var exphbs = require('express-handlebars');

var flash = require ('connect-flash')
var session = require('express-session')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy


var routes_path = require('./routes/paths') // == index= require('./index.js'); users= require('./usres'),

//https://codeburst.io/how-to-easily-set-up-node-environment-variables-in-your-js-application-d06740f9b9bd
//https://codeburst.io/process-env-what-it-is-and-why-when-how-to-use-it-effectively-505d0b2831e7
require('dotenv').config();

var app = express()

// https://codeburst.io/what-is-pug-js-jade-and-how-can-we-use-it-within-a-node-js-web-application-69a092d388eb
//https://expressjs.com/en/api.html#app.set
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')
//Hvis vi vil bruker dot_handlebars istedenfor dot_pug
app.engine('handlebars', exphbs({defaultLayout:'layout'}));

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));



// OBS OBS Note that enabling session support is entirely optional, ... If enabled, be sure to use session() before passport.session() to ensure that the login session is restored in the correct order
// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());



//connect Flash
app.use(flash())

//Global Var
//https://stackoverflow.com/a/16502225

app.use((req,res, next)=>{
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null
    next()
})


//routes
//  routes_path.index= require('./routes/index.js'); routes_path.users= require('./routes/usres.js')
app.use('/', routes_path.index) 
app.use('/users', routes_path.users)

app.set('port', (process.env.PORT || 8084));
app.set('host', (process.env.HOST || 'localhost'));



//https://codeburst.io/process-env-what-it-is-and-why-when-how-to-use-it-effectively-505d0b2831e7
app.listen(app.get('port') , () => {
    console.log('Server running on http://' + app.get('host') +':'+ app.get('port'))
  })