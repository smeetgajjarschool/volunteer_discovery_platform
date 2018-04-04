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

    if (format == 1){
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

							   			if (completed_applications.length === index+1){
							   				//Last iteration of the completed applications array. Render the view after this.

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
										}
									});											
								});
					   		});						   		
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

						var iter = 0;
				   		completed_events.forEach(function(entry, index){

						   	query = {
					   			event_id: entry._id
					   		}
					   		Application.find(query, "_id event_id volunteer_id", function(err, application){
								if(err) {
							   		console.log("ERROR trying to find events");
							   		throw err;
						   		}

								console.log("Found application: " + JSON.stringify(application))

								if (application.length !== 0){

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

		   										console.log("1111111 - user_review_for "+ user_review_for.name +" review" + review)
								   				if (user_review_for !== null && review.length === 0 && user_review_for.length !== 0){
								   					console.log("index" + index)
								   					console.log("pending_reviews" + pending_reviews)
								   					pending_reviews[iter] = [];
											   		pending_reviews[iter].push({
											   			review_by_id: req.user.id,
														review_for_id: user_review_for._id,
														event_id: entry2.event_id,
														event_name: entry.event_name, 
														review_for_name: user_review_for.name
											   		});
											   		iter++
											   		console.log("pending_reviews = " + JSON.stringify(pending_reviews))
												}

									   			if (application.length === index2+1 && completed_events.length === index+1){
									   				//Last iteration of the completed applications array. Render the view after this.

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
												}
											});											
										});
								   	});
								}
								else{
						   			if (completed_events.length === index+1){
						   				//Last iteration of the completed applications array. Render the view after this.

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
									}
								}
					   		});
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
	var skills = req.body.skills
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

	var type_org = req.body.type_org;
	console.log(availability);
	var description = req.body.description;

	// Validation
	if (user_type == "volunteer"){
		req.checkBody('name', 'Name is required').notEmpty();
		req.checkBody('dob', 'Date of Birth is required').notEmpty();
		req.checkBody('interests', 'An interest is required').notEmpty();
		req.checkBody('skills', 'A skill is required').notEmpty();
	}
	else {
		req.checkBody('description', 'Organization Description is required').notEmpty();
		req.checkBody('type_org', 'Type of Organization is required').notEmpty();
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
				type_org: type_org,
				description: description
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
		console.log(skills[0]);
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

	var type_org = req.body.type_org;
	var description = req.body.description;
	console.log(availability);

	// Validation
	if (user_type == "volunteer"){
		req.checkBody('name', 'Name is required').notEmpty();
		req.checkBody('dob', 'Date of Birth is required').notEmpty();
		req.checkBody('interests', 'An interest is required').notEmpty();
		req.checkBody('skills', 'A skill is required').notEmpty();
	}
	else {
		req.checkBody('description', 'Organization Description is required').notEmpty();
		req.checkBody('type_org', 'Type of Organization is required').notEmpty();
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
					type_org: type_org,
					description: description
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

router.get('/resume/:username', ensureAuthenticated, function(req, res){
	var username = req.params.username
	var user;
	var profile;
	var reviews;
	var average_rating = 0;
	var apps = [];
	var events;
	var num_reviews = 0;

	User.getUserByUsername(username, function(err, user){
		if(err) {
	   		console.log("ERROR trying to find user");
	   		throw err;
		}
		console.log("Found user: " + JSON.stringify(user))
		
		if (user !== null && user.user_type === "volunteer"){ 
			var query = {
				uid: user.id
			}
			Profile.find(query, function(err, profile){
				if(err) {
			   		console.log("ERROR trying to find profiles");
			   		throw err;
		   		}
				console.log("Found profile: " + JSON.stringify(profile))

				query = {
					volunteer_id: user.id,
					status: "completed"
				}
				Application.find(query, function(err, completed_applications){
					if(err) {
				   		console.log("ERROR trying to find applications");
				   		throw err;
			   		}

			   		if (completed_applications.length !== 0){
			   			completed_applications.forEach(function(entry, index){

			   				query = {
			   					_id: entry.event_id
			   				}
						   	Event.find(query, function(err, event){
								if(err) {
							   		console.log("ERROR trying to find events");
							   		throw err;
						   		}
								console.log("Found event: " + JSON.stringify(event))

						   		User.getUserById(event[0].organization_id, function(err, user2){
									if(err) {
								   		console.log("ERROR trying to find events");
								   		throw err;
							   		}
									console.log("Found user2: " + JSON.stringify(user2))

							   		query = {
							   			review_for_id: user.id, 
							   			review_by_id: user2.id, 
							   			event_id: event[0].id
							   		}

									Review.find(query, function(err, review){
										if(err) {
									   		console.log("ERROR trying to find reviews");
									   		throw err;
										}

										if (review.length !== 0){
											average_rating += (review[0].rating)
											num_reviews = num_reviews + 1;
										}

								   		var app = {};
								   		app["event"] = event[0];
								   		app["user"] = user2;
								   		app["application"] = entry;
								   		app["review"] = review[0];
								   		apps.push(app);

								   		if (index+1 === completed_applications.length){
								   			average_rating = parseFloat(average_rating)/num_reviews;
									   		var context = {
									   			user: user,
									   			profile: profile[0],
									   			reviews: reviews,
									   			average_rating: average_rating,
									   			apps: apps,
									   			events: events,
									   			num_reviews: num_reviews						
									   		}
									   		console.log("context= " + JSON.stringify(context))
									   		res.render("resume", context)
										}
									});
						   		});
					   		});
				   		});
					}
					else{
				   		var context = {
				   			user: user,
				   			profile: profile[0],
				   			reviews: reviews,
				   			average_rating: average_rating,
				   			apps: apps,
				   			events: events,
							num_reviews: num_reviews						
				   		}
				   		res.render("resume", context)
					}
				});
			});
		}
		else{
			console.log(username + "is not a volunteer or user! Redirecting to /")
			res.redirect("/")
		}
	});			

});

router.get('/:username', ensureAuthenticated, function(req, res){
	var username = req.params.username
	var user;
	var profile;
	var reviews;
	var average_rating = 0;
	var apps = [];
	var events;
	var num_reviews = 0;

	User.getUserByUsername(username, function(err, user){
		if(err) {
	   		console.log("ERROR trying to find user");
	   		throw err;
		}
		console.log("Found user: " + JSON.stringify(user))
		
		if (user !== null){ 
			var query = {
				uid: user.id
			}
			Profile.find(query, function(err, profile){
				if(err) {
			   		console.log("ERROR trying to find profiles");
			   		throw err;
		   		}
				console.log("Found profile: " + JSON.stringify(profile))

				if (user.user_type === "volunteer"){
					query = {
						volunteer_id: user.id,
						status: "completed"
					}
					Application.find(query, function(err, completed_applications){
						if(err) {
					   		console.log("ERROR trying to find applications");
					   		throw err;
				   		}

				   		if (completed_applications.length !== 0){
				   			completed_applications.forEach(function(entry, index){

				   				query = {
				   					_id: entry.event_id
				   				}
							   	Event.find(query, function(err, event){
									if(err) {
								   		console.log("ERROR trying to find events");
								   		throw err;
							   		}
									console.log("Found event: " + JSON.stringify(event))

							   		User.getUserById(event[0].organization_id, function(err, user2){
										if(err) {
									   		console.log("ERROR trying to find events");
									   		throw err;
								   		}
										console.log("Found user2: " + JSON.stringify(user2))

								   		query = {
								   			review_for_id: user.id, 
								   			review_by_id: user2.id, 
								   			event_id: event[0].id
								   		}

										Review.find(query, function(err, review){
											if(err) {
										   		console.log("ERROR trying to find reviews");
										   		throw err;
											}
											console.log("B4 44444 num_reviews=" + num_reviews)
											console.log("review= "+ review)
											console.log("review.length = "+ review.length)
											if (review.length !== 0){
												average_rating += (review[0].rating)
												num_reviews = num_reviews + 1;
												console.log("num_reviews=" + num_reviews)
											}

									   		var app = {};
									   		app["event"] = event[0];
									   		app["user"] = user2;
									   		app["application"] = entry;
									   		app["review"] = review[0];
									   		apps.push(app);

									   		if (index+1 === completed_applications.length){
									   			average_rating = parseFloat(average_rating)/num_reviews;
										   		var context = {
										   			user: user,
										   			profile: profile[0],
										   			reviews: reviews,
										   			average_rating: average_rating,
										   			apps: apps,
										   			events: events,
										   			num_reviews: num_reviews						
										   		}
										   		console.log("context= " + JSON.stringify(context))
										   		res.render("public_profile", context)
											}
										});
							   		});
						   		});
					   		});
						}
						else{
					   		var context = {
					   			user: user,
					   			profile: profile[0],
					   			reviews: reviews,
					   			average_rating: average_rating,
					   			apps: apps,
					   			events: events,
								num_reviews: num_reviews						
					   		}
					   		res.render("public_profile", context)
						}
					});
				}
				else {
	   				query = {
	   					organization_id: user.id,
	   					status: "completed"
	   				}
				   	Event.find(query, function(err, events){
						if(err) {
					   		console.log("ERROR trying to find events");
					   		throw err;
				   		}

				   		query = {
				   			review_for_id: user.id
				   		}

						Review.find(query, function(err, reviews){
							if(err) {
						   		console.log("ERROR trying to find reviews");
						   		throw err;
							}

							num_reviews = reviews.length
								
							if (reviews.length !== 0){
								reviews.forEach(function(entry, index){

							   		average_rating += (entry.rating/num_reviews)

									query = {
					   					organization_id: user.id,
					   					status: "completed"
					   				}
								   	Event.find(query, function(err, event){
										if(err) {
									   		console.log("ERROR trying to find events");
									   		throw err;
								   		}

								   		User.getUserById(event[0].organization_id, function(err, user2){
											if(err) {
										   		console.log("ERROR trying to find events");
										   		throw err;
									   		}
											console.log("Found user2: " + JSON.stringify(user2))

											var app = {};
											app["user"] = user2;
											app["event"] = event[0];
											app["review"] = entry;
											apps.push(app);

									   		if (index+1 === reviews.length){								
									   			var context = {
										   			user: user,
										   			profile: profile[0],
										   			reviews: reviews,
										   			average_rating: average_rating,
										   			apps: apps,
										   			events: events,
										   			num_reviews: num_reviews						
										   		}
										   		res.render("public_profile", context)
											}
										});
								   	});
								});
							}
							else{
						   		var context = {
						   			user: user,
						   			profile: profile[0],
						   			reviews: reviews,
						   			average_rating: average_rating,
						   			apps: apps,
						   			events: events,
						   			num_reviews: num_reviews						
						   		}
						   		res.render("public_profile", context)
							}

						});
				   	});
				}					
			});
		}
		else{
			console.log("No username " + username + " found! Redirecting to /")
			res.redirect("/")
		}
	});
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