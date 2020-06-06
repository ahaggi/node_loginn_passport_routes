var express = require('express');
var router = express.Router();

// route middleware
// Simple middleware to ensure user is authenticated.
// Use this middleware on any resource that needs to be protected.
// If the request is authenticated (typically via a persistent login session),
// the request will proceed.  Otherwise, the user will be redirected to the
// login page
const ensureAuthenticated = (req, res, next)=> {
	// les mer om req.isAuthenticated() vs req.session.passport.user 
	//https://stackoverflow.com/a/27055836
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect('/users/login');
	}
}

// Get Homepage
router.get('/', ensureAuthenticated, (req, res)=> {
	res.render('index.handlebars');
});

module.exports = router;