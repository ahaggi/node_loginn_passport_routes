var express = require('express');
var router = express.Router();
var User = require('../model/User')
// express-validator 5.3.0 
//https://express-validator.github.io/docs/index.html
const { body, check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

passport.use(new LocalStrategy(
	(username, password, done) => {  // OBS OBS den kalles "verify callback" http://www.passportjs.org/docs/configure/
		User.getUserByUsername(username, (err, foundUser) => {
			if (err) { return done(err); } // if we can't run User.findOne ,, ei db connection failure
			if (!foundUser) { // wrong user
				return done(null, false, { message: 'Incorrect username or password.1' });
			}
			if (!foundUser.validPassword(password, foundUser.password, foundUser.salt)) { // wrong password  
				return done(null, false, { message: 'Incorrect username or password.2' }); // Will set res.locals.error = message. We need to set passport.authenticate(.., failureFlash: true), to show it
			}
			return done(null, foundUser);
		});
	}
));


passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.getUserById(id, (err, user) => {
		done(err, user);
	});
});

// ************************************************************************************************************************************************

// Login route handler
const loginGet = (req, res) => {
	res.render('login.handlebars');
}
router.get('/login', loginGet);


// ************************************************************************************************************************************************

// Login post route handler
const loginPost = (req, res) => {
	//trenger ikkje noe redirect her, den blir gjort i routeMiddelware passportAuth 
}
// route middleware
const passportAuth = passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/users/login',
	failureFlash: true
})


router.post('/login', passportAuth, loginPost);

// ************************************************************************************************************************************************

// Passport exposes a logout() function on req (also aliased as logOut()) that can be called from any route handler which needs to terminate a login session. Invoking logout() will remove the req.user property and clear the login session (if any).
// Logout route handler
const logoutGet = (req, res) => {
	req.logout();
	req.flash('success_msg', '<div class="header">	you are logout. </div>  <p>You may now log-in with the username you have chosen</p>')
	
	res.redirect('/users/login');
}
router.get('/logout', logoutGet);


// ************************************************************************************************************************************************

// Register get route handler
const registerGet = (req, res) => {
	res.render('register.handlebars');
}
router.get('/register', registerGet);



// ************************************************************************************************************************************************

// route middleware
const registerValidator = [
	body('email')
		.isEmail().withMessage('Please enter a valid e-mail')
		.normalizeEmail(),

	body('firstName')
		.not().isEmpty().withMessage('This field is required')   //withMessage for hver constrain
		.isLength({ min: 3 }).withMessage('firstName must be at least 3 chars long')
		.trim()
		.escape()
	,


	sanitizeBody('terms').toBoolean()
]
// eller ,, check istedenfor body ,, les mer
// const registerValidator = [
// 	check('email')
// 		.isEmail()
// 		.normalizeEmail(),
// 	check('firstName')
// 		.isLength({ min: 3 })
// 		.trim()
// 		.escape(),

// ]



// Register post route handler
const registerPost = (req, res) => {
	var data = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		userName: req.body.userName,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		terms: req.body.terms,
	}


	var errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(422)
		console.log({ errors: errors.array() })

		//kan reformateres til
		// var err={}
		// errors.array().forEach(element => {
		// 	var {param} = element
		// 	 err[param]= err[param]=== undefined ? [].concat(element) : err[param].concat(element)
		// });
		// console.log(err)

		return res.render('register.handlebars', { errors: errors.array() })
	} else {
		var newUser = new User({
			firstName: data.firstName,
			lastName: data.lastName,
			userName: data.userName,
			email: data.email,
			password: data.password
		})
		console.log(newUser)
		newUser.createUser(newUser, (err, user) => {
			if (err) throw err
			console.log(user)
		})
		req.flash('success_msg', '<div class="header">	Your user registration was successful. </div>  <p>You may now log-in with the username you have chosen</p>')
		res.redirect('/users/login')
	}
}
router.post('/register', registerValidator, registerPost);



// ************************************************************************************************************************************************





module.exports = router;