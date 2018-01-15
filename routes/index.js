var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');


var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

var Event = require('../models/events');
var Application = require('../models/applications');
var User = require('../models/user.js');

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	console.log("req.user is " + req.user);

	var user_type = req.user.user_type;
	var events;

	if(user_type == 'volunteer'){

		//find all applications this person has done
		var query = {volunteer_id: req.user.id};

		Application.find(query,function(err, applications){
				if(err) throw err;

				var user_apps = [];

				applications.forEach(function(application){

					//get event name, start, and end date		

					if (application.event_id != '') {

								Event.findById(application.event_id, function(err, event){
									if(err) throw err;

									User.findById(event.organization_id, function(err, organization) {
											if(err) throw err;

											console.log("organization is " + JSON.stringify(organization.name));
											
											x = {};
											x['application'] = application;
											x['event'] =  event;
											x['organization_name'] = organization.name;
											console.log("x is " + JSON.stringify(x));
											
											user_apps.push(x);
											console.log("user apps is " + JSON.stringify(user_apps));
									});

								});
					}			

				});

				console.log("all applications are " + JSON.stringify(applications));
				var context = {user : req.user, applications: JSON.stringify(applications), user_apps: user_apps};
				res.render('volunteer_dashboard', context);
		});
	
	}
	else{

	var query = {organization_id: req.user.id}
	Event.find(query, function(err, events){
   	if(err) {
   		console.log("ERROR trying to find events");

   		throw err;
   	}
   	if(!events){
   		return done(null, false, {message: 'Event not found'});
   	}

   	//console.log("events is " + JSON.stringify(events));


				  //find all applications 
					Application.find(function(err, applications){

						if(err) throw err;

						console.log("all applications are " + JSON.stringify(applications));

						var context = {user : req.user, events: events, applications: applications};
						res.render('index', context);

					});

   });

	}

	//var context = {user : req.user}
	//res.render('index', context);
});

router.post('/applications/:id', ensureAuthenticated, function(req, res){

	console.log("application accept/reject id is " + JSON.stringify(req.params) + " " + JSON.stringify(req.body));

	//find the application
	query = {_id: req.params.id};

	Application.find(query, function(err, application){
			if(err) throw err;
			var application = application[0];

			console.log("application is " + JSON.stringify(application));

			if (req.body.application_action == "accept"){
				application.status = "accepted";
			} else if (req.body.application_action == "decline") {
				application.status = "declined";
			}

			Application.update(query, application, function(err) {
					if(err) throw err;

					var event_id = application.event_id;
					res.redirect('/events/' + event_id);
			})

	});


});


router.post('/applications',ensureAuthenticated, function(req, res){

	console.log("application posted! req params is " + JSON.stringify(req.params) + " req body is " + JSON.stringify(req.body));

	Event.find(function(err, events){
   	if(err) {
   		console.log("ERROR trying to find events");

   		throw err;
   	}
   	if(!events){
   		return done(null, false, {message: 'Event not found'});
   	}

			console.log("event_id is " + req.body.event_id);

   	 	var query = {_id : req.body.event_id};

   	 	//finding the event that the user is applying to - we don't need to do this but just testing query
			Event.find(query, function(err, event){

		  		console.log("event is " + JSON.stringify(event));
				  var newApplication = new Application({
						event_id: req.body.event_id,
						volunteer_id: req.user.id,
					});


				  //creating the application
					Application.createApplication(newApplication, function(err){
						
						if(err) throw err;
				
								//find all applications for this user
								var query = {volunteer_id : req.user.id}
								Application.find(query, function(err, applications){

									if(err) throw err;

									console.log("all applications are " + JSON.stringify(applications));

									req.flash('success_msg', 'Application Created!');
									//var context = {user : req.user, applications: JSON.stringify(applications)};
									res.redirect('/');

								});

					});
   		 });
		});
});

router.get('/events/:id', ensureAuthenticated, function(req, res){

	console.log("events/id get id is " + req.params.id);

  var query = {_id : req.params.id};

		Event.find(query, function(err, event){		

				console.log("event is " + JSON.stringify(event));
											
				var query = {event_id : req.params.id}
				
				var user_apps = [];
				var user_accepted =[];

				Application.find(query).sort({created_time: -1}).exec(function(err, applications){

						if(err) throw err;

						console.log("applications are " + JSON.stringify(applications));

						applications.forEach(function(application){
							//find the user's information

								var user_query = {_id: application.volunteer_id};


								User.find(user_query, function(err, volunteer) {
									if(err) throw err;


									x = {};
									x['volunteer'] = volunteer[0];
									x['application'] = application;
									console.log("volunteer is " + JSON.stringify(volunteer));
									console.log("x is " + JSON.stringify(x));

									if (application.status =="tbd") {
										user_apps.push(x);
									}else if (application.status =="accepted") {
										user_accepted.push(x);
									}

									console.log("user_apps is " + JSON.stringify(x));
								});
						});

					var context = {user : req.user, event: event[0], applications: JSON.stringify(applications), user_apps: user_apps, user_accepted: user_accepted};
					res.render('event_page', context);

				});
		 });
});



router.get('/events', ensureAuthenticated, function(req, res){
	console.log("req.user is " + req.user);
	//get all events

// client.search({
//   index: 'test_events',
//   type: 'event',
//   body: {
//     query: {
//       match_all: {}
//     }
//     }
//   }

// ).then(function (body) {
//   console.log("search body is " + JSON.stringify(body));
// }, function (error) {
//   console.trace(error.message);
// });




	var events;
	var query = {organization_id: req.user._id}

	Event.find(query, function(err, events){
   	if(err) {
   		console.log("ERROR trying to find events");

   		throw err;
   	}
   	if(!events){
   		return done(null, false, {message: 'Event not found'});
   	}



   	console.log("events is " + JSON.stringify(events));
   	//console.log("event is " +  events[2]['event_name']);

  //  	client.index({
  // 		index: 'test_events2',
 	// 	  type: 'event',
  // 		body: {
  //  			title: 'Test 1',
  //  			name: 'name',
  //  			start_date: 'date',
  //  			end_date: 'date',
  //  			recurring: 'recurring',
  //  			lat: 'lat',
  //  			lon: 'lon',
  //  			organization_id: 'organization_id',
  //  			admin_ids: [14,4,54]

  //  			 		 }
		// }, function (error, response) {
		// 	if (error){
		// 		console.log("ERROR when trying to index new document");
		// 	}
		// 	else{
		// 		console.log("response from indexing new document is " + JSON.stringify(response));
		// 	}


		// });

  var context = {user : req.user, events: events}
	res.render('events', context);

   });


});

function dateToString(Date) {
	now = Date;
  year = "" + now.getFullYear();
  month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
  day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
  hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
  minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
  second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
  return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

router.post('/events', function(req, res){

	console.log("request is " + JSON.stringify(req.body));

	var start_date = req.body.start_date;
	var end_date = req.body.end_date;
	var name = req.body.name;
	var lat = req.body.lat;
	var lng = req.body.lng;
	var organization_id = req.body.organization_id;
	var event_type = req.body.event_type;

	// Validation
	req.checkBody('name', 'Event Name is required').notEmpty();
	req.checkBody('lat', 'Location is required').notEmpty();
	req.checkBody('lng', 'Location is required').notEmpty();
	req.checkBody('start_date', 'Start Date is required').notEmpty();
	req.checkBody('end_date', 'Start Date is required').notEmpty();
	req.checkBody('organization_id', 'organization_id is required').notEmpty();
	req.checkBody('event_type', 'event_type is required').notEmpty();


	var errors = req.validationErrors();

	if(errors){
		res.render('events',{
			errors:errors
		});
	} else {
		var newEvent = new Event({
			event_name: name,
			event_start_date: start_date,
			event_end_date: end_date,
			lat: lat,
			lng: lng,
			organization_id: organization_id
		});


		Event.createEvent(newEvent, function(err, user){
			if(err) throw err;
			console.log(user);

						   	client.index({
						  		index: 'test_events4',
						 		  type: 'event',
						  		body: {
						   			name: name,
						   			start_date: newEvent.event_start_date,
						   			end_date: newEvent.event_end_date,
						   			recurring: 'recurring',
						   			location: { lat:lat, lon: lng},
						   			organization_name: req.user.name,
						   			event_type: event_type,
						   			event_id: newEvent.id,
						   			admin_ids: [14,4,54]
						   			 		 }
								}, function (error, response) {
									if (error){
										console.log("ERROR when trying to index new document");
									}
									else{
										console.log("response from indexing new document is " + JSON.stringify(response));
									}


								});

								req.flash('success_msg', 'Event was created');
								var context = {user : req.user}
								res.render('events', context);

		});

};

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