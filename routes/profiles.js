var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var path = require('path');


var Profile = require('../models/profile');

function formatDate(date, separator, format) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    if (format = 1){
    	return [year, month, day].join(separator);
    }
    else{
    	return [month, day, year].join(separator);
    }

}

router.get('/', ensureAuthenticated, function(req, res){
	var profile;
	var query = {uid: req.user.id};
	var user_type = req.user.user_type;	

	Profile.find(query, function(err, profile){
		if(err) {
	   		console.log("ERROR trying to find profiles");
	   		throw err;
   		}
   		console.log("profile is " + profile);
   		console.log("user is " + JSON.stringify(req.user));

   		if (user_type == "volunteer"){
	   		volunteer = 1;
	   		organization = 0;
	   	}
	   	else {
	   		volunteer = 0;
	   		organization = 1;
	   	}
	   	
		dob = formatDate(profile[0].dob, "/", 0)

	   	var context = {
			profile: profile[0], 
			error_msg: req.flash('error_msg'),
			volunteer: volunteer,
			organization: organization,
			user: req.user,
			dob: dob
		};

		if (profile.length != 0){
			console.log("Loading current user's profile")
			res.render('profile', context);
		}
		else {
			console.log("Redirecting to /profile/new")
			res.redirect("/profile/new");
		}
	});
});

// New Profile
router.get('/new', ensureAuthenticated, function(req, res){
	var profile;
	var query = {uid: req.user.id};
	var user_type = req.user.user_type;	

	Profile.find(query, function(err, profile){
	   	if(err) {
	   		console.log("ERROR trying to find profiles");
	   		throw err;
	   	}
	   	console.log("profile is " + JSON.stringify(profile));

	   	if (user_type == "volunteer"){
	   		volunteer = 1;
	   		organization = 0;
	   	}
	   	else {
	   		volunteer = 0;
	   		organization = 1;
	   	}

		var context = {
			profile: profile[0], 
			error_msg: req.flash('error_msg'),
			volunteer: volunteer,
			organization: organization,
			user: req.user
		};

		if (profile.length === 0){
			res.render('new_profile', context);
		}
		else {
			res.redirect("/profile/edit");
		}
	});
});

// Edit Profile
router.get('/edit', ensureAuthenticated, function(req, res){
	var profile;
	var query = {uid: req.user.id};
	var user_type = req.user.user_type;
	var user_id = req.user.id;

	Profile.find(query, function(err, profile){
	   	if(err) {
	   		console.log("ERROR trying to find profiles");
	   		throw err;
	   	}
	   	console.log("profile is " + JSON.stringify(profile));

	   	if (user_type == "volunteer"){
	   		volunteer = 1;
	   		organization = 0;
	   	}
	   	else {
	   		volunteer = 0;
	   		organization = 1;
	   	}

		dob = formatDate(profile[0].dob, "-", 1)

		var context = {
			profile: profile[0], 
			user: req.user, 
			volunteer: volunteer,
			organization: organization,
			error_msg: req.flash('error_msg'),
			dob: dob
		};

		if (profile == null){
			res.redirect('/profile/new');
		}
		else {
			res.render('edit_profile', context);
		}
	});
});

// New Profile
router.post('/create', function(req, res){

	var user_type = req.user.user_type;
	var user_id = req.user.id;
	var name = req.body.name;
	var dob = req.body.dob;
	var interests = req.body.interests;
	console.log(interests);
	var skills = req.body.skills;
		console.log(skills);

	var dob = req.body.dob;
	var availability = {
		monday: {
			from: req.body.availability_monday_from,
			to: req.body.availability_monday_to
		},
		tuesday: {
			from: req.body.availability_tuesday_from,
			to: req.body.availability_tuesday_to
		},
		wednesday: {
			from: req.body.availability_wednesday_from,
			to: req.body.availability_wednesday_to
		},
		thursday: {
			from: req.body.availability_thursday_from,
			to: req.body.availability_thursday_to
		},
		friday: {
			from: req.body.availability_friday_from,
			to: req.body.availability_friday_to
		},
		saturday: {
			from: req.body.availability_saturday_from,
			to: req.body.availability_saturday_to
		},
		sunday: {
			from: req.body.availability_sunday_from,
			to: req.body.availability_sunday_to
		}
	};

	var role = req.body.role;
	console.log(availability);
	var organization_name = req.body.organization_name;

	// Validation
	if (user_type == "volunteer"){
		req.checkBody('name', 'Name is required').notEmpty();
		req.checkBody('dob', 'Date of Birth is required').notEmpty();
		req.checkBody('interests', 'An interest is required').notEmpty();
		req.checkBody('skills', 'A skill is required').notEmpty();
	}
	else {
		req.checkBody('organization_name', 'Organization Name is required').notEmpty();
		req.checkBody('role', 'Role is required').notEmpty();
	}

	var errors = req.validationErrors();

	if(errors){
		res.render('new_profile',{
			errors:errors, 
			name: name
		});
	} 
	else {
		var newProfile;
		if (user_type == "volunteer"){
			newProfile = new Profile({
				uid: req.user.id,
				dob:dob,
				interests: interests,
				skills: skills,
				availability: availability
			});
		}
		else {
			newProfile = new Profile({
				role: role,
				organization_name: organization_name
			});
		}

		Profile.createProfile(req.user, newProfile, function(err, profile){
			if(err) throw err;
			console.log(profile);
		});

		req.flash('success_msg', 'You have successfully created your profile.');

		res.redirect('/profile');
	}
});

router.post('/update', function(req, res){

	var user_type = req.user.user_type;
	var user_id = req.user.id;
	var name = req.body.name;
	var dob = req.body.dob;
	var interests = req.body.interests;
	console.log(interests);
	var skills = req.body.skills;
		console.log(skills);

	var dob = req.body.dob;
	var availability = {
		monday: {
			from: req.body.availability_monday_from,
			to: req.body.availability_monday_to
		},
		tuesday: {
			from: req.body.availability_tuesday_from,
			to: req.body.availability_tuesday_to
		},
		wednesday: {
			from: req.body.availability_wednesday_from,
			to: req.body.availability_wednesday_to
		},
		thursday: {
			from: req.body.availability_thursday_from,
			to: req.body.availability_thursday_to
		},
		friday: {
			from: req.body.availability_friday_from,
			to: req.body.availability_friday_to
		},
		saturday: {
			from: req.body.availability_saturday_from,
			to: req.body.availability_saturday_to
		},
		sunday: {
			from: req.body.availability_sunday_from,
			to: req.body.availability_sunday_to
		}
	};

	var role = req.body.role;
	var organization_name = req.body.organization_name;
	console.log(availability);

	// Validation
	if (user_type == "volunteer"){
		req.checkBody('name', 'Name is required').notEmpty();
		req.checkBody('dob', 'Date of Birth is required').notEmpty();
		req.checkBody('interests', 'An interest is required').notEmpty();
		req.checkBody('skills', 'A skill is required').notEmpty();
	}
	else {
		req.checkBody('organization_name', 'Organization Name is required').notEmpty();
		req.checkBody('role', 'Role is required').notEmpty();
	}

	var errors = req.validationErrors();

	if(errors){
		res.render('edit_profile',{
			errors:errors, 
			name: name
		});
	} 
	else {
		var profile;
		query = {uid: req.user.id};

		Profile.find(query, function(err, profile){
		   	if(err) {
		   		console.log("ERROR trying to find profiles");
		   		throw err;
		   	}
		   	console.log("profile is " + JSON.stringify(profile));

			var pid = profile[0]._id;

			var editProfile;
			if (user_type == "volunteer"){
				editProfile = new Profile({
					_id: pid,
					uid: req.user_id,
					dob:dob,
					interests: interests,
					skills: skills,
					availability: availability
				});
			}
			else {
				editProfile = new Profile({
					_id: pid,
					role: role,
					organization_name: organization_name
				});
			}

			Profile.updateProfile(req.user, editProfile, function(err, profile){
				if(err) throw err;
				console.log(profile);
			});

			req.flash('success_msg', 'You have successfully edited your profile.');

			res.redirect('/profile');

		});
	}
});


function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','Please register or log in to access this content.');
		res.redirect('/users/login');
	}
}

module.exports = router;