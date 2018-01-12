var express = require('express');
var router = express.Router();

var Friend = require('../models/friend');
var User = require('../models/user');


router.delete('/:friendname', ensureAuthenticated, function(req, res){
	console.log("req.user is " + req.user);
	Friend.removeFriend(req.user.username, req.params.friendname, function(err){
    		if (err) return console.log ("REMOVE FAIL OUT");
    		return console.log ("REMOVE GOOD OUT");
	});
	//res.redirect('/friends');
	res.sendStatus(200);
});

router.post('/', ensureAuthenticated, function(req, res){ 
	console.log("req.user is " + req.user);
	/*Friend.addFriend("Test124", "Bally", "/friends", 
		function(err){
    		if (err) return console.log ("ADD FAIL OUT");
    		return console.log ("ADD GOOD OUT");
	});*/

	var user = User.getUserByUsername(req.body.friend_input, function(err, user){
		if(!err && user){
			console.log("USER IS " + user);
			Friend.addFriend(req.user.username, req.body.friend_input, "/friends", 
				function(err){
		    		if (err) return console.log ("ADD FAIL OUT");
		    		return console.log ("ADD GOOD OUT");
			});
		}
		else{
			console.log("User " + req.body.friend_input + " doesn't exist!");
			req.flash('error_msg',"User " + req.body.friend_input + " doesn't exist!");
		}
	});
	res.redirect('/friends');
});

router.get('/', ensureAuthenticated, function(req, res){
	console.log("req.user is " + req.user);

	var friends;
	var query = {username: req.user.username};

	console.log ("username is" + req.user.name);
	Friend.find(query, function(err, friends){
   	if(err) {
   		console.log("ERROR trying to find friends");

   		throw err;
   	}
   	if(!friends){
   		return done(null, false, {message: 'Friend not found'});
   	}
   	console.log("friends is " + JSON.stringify(friends));

	var context = {friends: friends, error_msg: req.flash('error_msg')};
	res.render('friends', context);
	});
});


function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;