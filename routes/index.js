var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');


var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

var Event = require('../models/events');

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	console.log("req.user is " + req.user);

	var events;

	Event.find(function(err, events){
   	if(err) {
   		console.log("ERROR trying to find events");

   		throw err;
   	}
   	if(!events){
   		return done(null, false, {message: 'Event not found'});
   	}

   	console.log("events is " + JSON.stringify(events));

  var context = {user : req.user, events: events}
	res.render('index', context);

   });

	//var context = {user : req.user}
	//res.render('index', context);
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