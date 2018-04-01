var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var path = require('path');


var Profile = require('../models/profile');
var Event = require('../models/events');
var Application = require('../models/applications');
var User = require('../models/user.js');
var Review = require('../models/review');

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
	var pending_reviews = {};

	Profile.find(query, function(err, profile){
		if(err) {
	   		console.log("ERROR trying to find profiles");
	   		throw err;
   		}
   		console.log("profile is " + JSON.stringify(profile));
   		console.log("user is " + JSON.stringify(req.user));

   		if (profile.length === 0) {
			console.log("Redirecting to /profile/new");
			res.redirect("/profile/new");
		}
		else {			   		
			if (user_type === "volunteer"){
				//User type is volunteer
		   		volunteer = 1;
		   		organization = 0;

		   		query = {
		   			volunteer_id: req.user.id,
		   			status: "completed"
		   		}
		   		Application.find(query, "_id event_id volunteer_id", function(err, completed_applications){
					if(err) {
				   		console.log("ERROR trying to find applications");
				   		throw err;
			   		}

					if (completed_applications.length !== 0){

				   		completed_applications.forEach(function(entry, index){

				   			if (completed_applications.length === index+1){
				   				//Last iteration of the completed applications array. Render the view after this.
							   	query = {
						   			_id: entry.event_id
						   		}
						   		Event.find(query, "_id event_name organization_id", function(err, event){
									if(err) {
								   		console.log("ERROR trying to find events");
								   		throw err;
							   		}

									console.log("Found event: " + JSON.stringify(event))

							   		User.getUserById(event[0].organization_id, function(err, user_review_for){
										if(err) {
									   		console.log("ERROR trying to find user");
									   		throw err;
								   		}
										console.log("Found user: " + JSON.stringify(user_review_for))

									   	query = {
								   			review_by_id: req.user.id,
											review_for_id: user_review_for._id,
											event_id: entry.event_id
									   	}
								   		Review.find(query, function(err, review){
											if(err) {
										   		console.log("ERROR trying to find reviews");
										   		throw err;
									   		}

							   				if (user_review_for !== null && review.length === 0 && user_review_for.length !== 0){
							   					console.log("index" + index)
							   					console.log("pending_reviews" + pending_reviews)
							   					pending_reviews[index] = [];
										   		pending_reviews[index].push({
										   			review_by_id: req.user.id,
													review_for_id: user_review_for._id,
													event_id: entry.event_id,
													event_name: event[0].event_name, 
													review_for_name: user_review_for.name
										   		});

										   		console.log("pending_reviews = " + JSON.stringify(pending_reviews))
											}

										   	dob = formatDate(profile[0].dob, "/", 0)

										   	var context = {
												profile: profile[0], 
												error_msg: req.flash('error_msg'),
												volunteer: volunteer,
												organization: organization,
												user: req.user,
												dob: dob,
												pending_reviews: pending_reviews
											};
											console.log("context" + JSON.stringify(context))

											console.log("Loading current user's profile")
											res.render('profile', context);

										});											
									});
						   		});
						   	}
						   	else{
						   		//If this is not the last completed application of the array
							   	query = {
						   			_id: entry.event_id
						   		}
						   		Event.find(query, "_id event_name organization_id", function(err, event){
									if(err) {
								   		console.log("ERROR trying to find events");
								   		throw err;
							   		}
									console.log("Found event: " + JSON.stringify(event))

							   		query = {
							   			_id: event.organization_id
							   		}
							   		User.find(query, "_id name", function(err, user_review_for){
										if(err) {
									   		console.log("ERROR trying to find events");
									   		throw err;
								   		}	

										console.log("Found user_review_for: " + JSON.stringify(user_review_for))

									   	query = {
								   			review_by_id: req.user.id,
											review_for_id: user_review_for._id,
											event_id: entry.event_id
									   	}
								   		Review.find(query, function(err, review){
											if(err) {
										   		console.log("ERROR trying to find events");
										   		throw err;
									   		}

							   				if (user_review_for !== null && review.length === 0 && user_review_for.length !== 0){
							   					pending_reviews[index] = [];
										   		pending_reviews[index].push({
										   			review_by_id: req.user.id,
													review_for_id: user_review_for._id,
													event_id: entry.event_id,
													event_name: event.event_name, 
													review_for_name: user_review_for.name
										   		});
										   	}
										});
									});	
								   	
						   		});
						   	}
				   		});
				   	}
				   	else
				   	{
				   		//If there's no completed applications
				   		dob = formatDate(profile[0].dob, "/", 0)

					   	var context = {
							profile: profile[0], 
							error_msg: req.flash('error_msg'),
							volunteer: volunteer,
							organization: organization,
							user: req.user,
							dob: dob,
							pending_reviews: pending_reviews
						};

						console.log("Loading current user's profile")
						res.render('profile', context);

				   	}
			   	});

		   	}
		   	else {
		   		//User type is organization
		   		volunteer = 0;
		   		organization = 1;

		   		query = {
		   			organization_id: req.user.id,
		   			status: "completed"
		   		}
		   		Event.find(query, "_id event_name organization_id", function(err, completed_events){
					if(err) {
				   		console.log("ERROR trying to find applications");
				   		throw err;
			   		}

			   		console.log("Found events " + completed_events)
					if (completed_events.length !== 0){

				   		completed_events.forEach(function(entry, index){

				   			if (completed_events.length === index+1){
				   				//Last iteration of the completed applications array. Render the view after this.
							   	query = {
						   			event_id: entry._id
						   		}
						   		Application.find(query, "_id event_id volunteer_id", function(err, application){
									if(err) {
								   		console.log("ERROR trying to find events");
								   		throw err;
							   		}

									console.log("Found application: " + JSON.stringify(application))

									application.forEach(function(entry2, index2){

								   		User.getUserById(application[index2].volunteer_id, function(err, user_review_for){
											if(err) {
										   		console.log("ERROR trying to find user");
										   		throw err;
									   		}
											console.log("Found user: " + JSON.stringify(user_review_for))

										   	query = {
									   			review_by_id: req.user.id,
												review_for_id: user_review_for._id,
												event_id: entry2.event_id
										   	}
									   		Review.find(query, function(err, review){
												if(err) {
											   		console.log("ERROR trying to find reviews");
											   		throw err;
										   		}

								   				if (user_review_for !== null && review.length === 0 && user_review_for.length !== 0){
								   					console.log("index" + index)
								   					console.log("pending_reviews" + pending_reviews)
								   					pending_reviews[index] = [];
											   		pending_reviews[index].push({
											   			review_by_id: req.user.id,
														review_for_id: user_review_for._id,
														event_id: entry2.event_id,
														event_name: entry.event_name, 
														review_for_name: user_review_for.name
											   		});

											   		console.log("pending_reviews = " + JSON.stringify(pending_reviews))
												}

											   	dob = formatDate(profile[0].dob, "/", 0)

											   	var context = {
													profile: profile[0], 
													error_msg: req.flash('error_msg'),
													volunteer: volunteer,
													organization: organization,
													user: req.user,
													dob: dob,
													pending_reviews: pending_reviews
												};
												console.log("context" + JSON.stringify(context))

												console.log("Loading current user's profile")
												res.render('profile', context);

											});											
										});
								   	});
						   		});
						   	}
						   	else{
						   		//If this is not the last completed application of the array
							   	query = {
						   			event_id: entry._id
						   		}
						   		Application.find(query, "_id event_id volunteer_id", function(err, application){
									if(err) {
								   		console.log("ERROR trying to find events");
								   		throw err;
							   		}

									console.log("Found application: " + JSON.stringify(application))

									application.forEach(function(entry2, index2){

								   		User.getUserById(application[index2].volunteer_id, function(err, user_review_for){
											if(err) {
										   		console.log("ERROR trying to find user");
										   		throw err;
									   		}
											console.log("Found user: " + JSON.stringify(user_review_for))

										   	query = {
									   			review_by_id: req.user.id,
												review_for_id: user_review_for._id,
												event_id: entry2.event_id
										   	}
									   		Review.find(query, function(err, review){
												if(err) {
											   		console.log("ERROR trying to find reviews");
											   		throw err;
										   		}

								   				if (user_review_for !== null && review.length === 0 && user_review_for.length !== 0){
								   					console.log("index" + index)
								   					console.log("pending_reviews" + pending_reviews)
								   					pending_reviews[index] = [];
											   		pending_reviews[index].push({
											   			review_by_id: req.user.id,
														review_for_id: user_review_for._id,
														event_id: entry2.event_id,
														event_name: event[0].event_name, 
														review_for_name: user_review_for.name
											   		});
												}
											});											
										});
								   	});
						   		});
						   	}
				   		});
				   	}
				   	else
				   	{
				   		//If there's no completed applications
				   		dob = formatDate(profile[0].dob, "/", 0)

					   	var context = {
							profile: profile[0], 
							error_msg: req.flash('error_msg'),
							volunteer: volunteer,
							organization: organization,
							user: req.user,
							dob: dob,
							pending_reviews: pending_reviews
						};

						console.log("Loading current user's profile")
						res.render('profile', context);

				   	}
			   	});
		   	}		   	
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

	   	if (user_type === "volunteer"){
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
		if (profile.length === 0){
			res.redirect('/profile/new');
		}
		else {
		   	if (user_type === "volunteer"){
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

			res.render('edit_profile', context);
		}
	});
});

// New Profile
router.post('/create', function(req, res){
	console.log(req.user)
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
				uid: req.user.id,
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