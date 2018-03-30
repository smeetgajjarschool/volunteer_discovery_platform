var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var path = require('path');


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

/*
router.get('/', ensureAuthenticated, function(req, res){
	var review;
	var query = {uid: req.user.id};
	var user_type = req.user.user_type;	

	Review.find(query, function(err, review){
		if(err) {
	   		console.log("ERROR trying to find reviews");
	   		throw err;
   		}
   		console.log("review is " + JSON.stringify(review));
   		console.log("user is " + JSON.stringify(req.user));

   		if (review.length === 0) {
			console.log("Redirecting to /review/new");
			res.redirect("/review/new");
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
		   	
			dob = formatDate(review[0].dob, "/", 0)

		   	var context = {
				review: review[0], 
				error_msg: req.flash('error_msg'),
				volunteer: volunteer,
				organization: organization,
				user: req.user,
				dob: dob
			};

			console.log("Loading current user's review")
			res.render('review', context);
		}

	});
});
*/

// New Review
router.get('/new', ensureAuthenticated, function(req, res){
	var review;
	var query = {
		event: req.body.event_id,
		review_by: req.user._id,
		review_for: req.body.review_for
	};
	var user_type = req.user.user_type;	

	Review.find(query, function(err, review){
	   	if(err) {
	   		console.log("ERROR trying to find reviews");
	   		throw err;
	   	}
	   	console.log("review is " + JSON.stringify(review));

		if (review.length === 0){

		   	var query2 = {
				_id: query.event
			};

			Event.find(query2, function(err, event){
			   	if(err) {
			   		console.log("ERROR trying to find events");
			   		throw err;
			   	}

			   	var query3 = {
					_id: query.review_for
				};

			   	User.find(query3, function(err, review_for){
				   	if(err) {
				   		console.log("ERROR trying to find user");
				   		throw err;
				   	}

					var context = {
						review: review[0], 
						review_for: review_for,
						event: event,
						error_msg: req.flash('error_msg'),
						user: req.user
					};

					res.render('new_review', context);

				});
		   	});

		}
		else {
			res.redirect("/review/edit");
		}
	});
});

// Edit Review
router.get('/edit', ensureAuthenticated, function(req, res){
	var review;
	var query = {uid: req.user.id};
	var user_type = req.user.user_type;
	var user_id = req.user.id;

	Review.find(query, function(err, review){
	   	if(err) {
	   		console.log("ERROR trying to find reviews");
	   		throw err;
	   	}
	   	console.log("review is " + JSON.stringify(review));
		if (review.length === 0){
			res.redirect('/review/new');
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

			dob = formatDate(review[0].dob, "-", 1)

			var context = {
				review: review[0], 
				user: req.user, 
				volunteer: volunteer,
				organization: organization,
				error_msg: req.flash('error_msg'),
				dob: dob
			};

			res.render('edit_review', context);
		}
	});
});

// New Review
router.post('/create', function(req, res){
	console.log(req.user)
	var review_by = req.user.id;
	var event_id = req.body.event_id;
	var review_for = req.body.review_for;
	var review = req.body.review;
	var rating = req.body.rating;

	// Validation
	req.checkBody('review', 'Review is required').notEmpty();
	req.checkBody('rating', 'Rating is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('new_review',{
			errors:errors, 
			name: name,
			user: req.user, 
			volunteer: volunteer,
			organization: organization,
			dob: dob
		});
	} 
	else {
		var newReview;
		newReview = new Review({
			review_by: review_by,
			event_id: event_id,
			review_for: review_for,
			review: review,
			rating: rating
		});

		Review.createReview(req.user, newReview, function(err, review){
			if(err) throw err;
			console.log(review);

			req.flash('success_msg', 'You have successfully created your review.');

			res.redirect('/review');

		});
	}
});

router.post('/update', function(req, res){

	console.log(req.user)
	var review_by = req.user.id;
	var event_id = req.body.event_id;
	var review_for = req.body.review_for;
	var review = req.body.review;
	var rating = req.body.rating;

	// Validation
	req.checkBody('review', 'Review is required').notEmpty();
	req.checkBody('rating', 'Rating is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('new_review',{
			errors:errors, 
			name: name,
			user: req.user, 
			volunteer: volunteer,
			organization: organization,
			dob: dob
		});
	} 
	else {
		var review;
		query = {
			review_by: review_by,
			event_id: event_id,
			review_for: review_for
		};

		Review.find(query, function(err, review){
		   	if(err) {
		   		console.log("ERROR trying to find reviews");
		   		throw err;
		   	}
		   	console.log("review is " + JSON.stringify(review));

			var editReview;
			editReview = new Review({
				_id: review._id,
				review_by: review_by,
				event_id: event_id,
				review_for: review_for,
				review: review,
				rating: rating
			});

			Review.updateReview(req.user, editReview, function(err, review){
				if(err) throw err;
				console.log(review);

				req.flash('success_msg', 'You have successfully edited your review.');
				res.redirect('/profile');

			});

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