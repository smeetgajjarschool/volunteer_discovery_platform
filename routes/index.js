var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');

var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var cron = require('cron');
var ObjectId = require('mongoose').Types.ObjectId; 
var mongo = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});


//mongoose.connect('mongodb://user2:password@ds251588.mlab.com:51588/volunteer-cloud');
//var db = mongoose.connection;

var Event = require('../models/events');
var Application = require('../models/applications');
var User = require('../models/user.js');
var Data = require('../models/data.js');
var Subscriber = require('../models/subscriber');
var GlobalSubscriber = require('../models/global_subscriber_num.js');

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

				var promises = applications.map(function(application){

					return new Promise(function(resolve, reject) {

									console.log("starting promise");
									//get event name, start, and end date		
									if (application.event_id != '') {


												Event.findById(application.event_id, function(err, event){
												
												if (err) {
									        reject(err);
									      } 

									      	if (event == null)
									      	{
									      		console.log("event is null");
									      		resolve("done");
									      	}else {

													console.log("bad event is " + JSON.stringify(event));

													User.findById(event.organization_id, function(err, organization) {
																						
															if (err) {
												        reject(err);
												      } 

															console.log("organization is " + JSON.stringify(organization.name));
															
															x = {};
															x['application'] = application;
															x['event'] =  event;
															x['organization_name'] = organization.name;
															console.log("x is " + JSON.stringify(x));
															
															user_apps.push(x);
															console.log("user apps is " + JSON.stringify(user_apps));
															resolve(x);
													});
												}

												});
									}		
									else
									{
											resolve();
									}	

				});

				});
				
		    Promise.all(promises).then(function () {
					console.log("all applications are " + JSON.stringify(applications));
					var context = {user : req.user, applications: JSON.stringify(applications), user_apps: user_apps};
					res.render('volunteer_dashboard', context);
		    });

		});
	
	}
	else if (user_type == 'organization'){

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
	else{

						var context = {user : req.user};
						res.render('home', context);

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
	var max_volunteers = req.body.max_volunteers;
	var subscriber_model = req.body.subscriber_model

	var skills = [];
	var interests = [];
	var eventids = [];

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

		for (var key in req.body) {
			console.log(key);
			if (key.indexOf("skill") !== -1){
					skills.push(key.replace("skill_",""));

			}
			else if (key.indexOf("interest") !== -1){
					interests.push(key.replace("interest_",""));

			}
		}

		console.log("subscriber_model is  " + subscriber_model);


		if (subscriber_model != "on"){
			subscriber_model = false;
		}

		var newEvent = new Event({
			event_name: name,
			event_start_date: start_date,
			event_end_date: end_date,
			lat: lat,
			lng: lng,
			organization_id: organization_id,
			skills: skills,
			interests: interests,
			subscriber_model: subscriber_model,
			max_volunteers: max_volunteers
		});


		Event.createEvent(newEvent, function(err, user){
			if(err) throw err;
			console.log(user);



		if (subscriber_model != true){

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

			}


			//expects id from user table
			var candidate = findSuitableCandidate(newEvent);
			User.findById(candidate,function(err, user){
				if(err) throw err;
				var name = user.name;
				var email = user.email;
			
				var htmlEmail = 'Email will be sent to ' + email +'\n<p>Hi '+ name +'</p><h3>Please consider this new volunteer opportunity recommended for you!</h3><br/><table><tr><td style="background-color: #4ecdc4;border-color: #4c5764;border: 2px solid #45b7af;padding: 10px;text-align: center;"><a style="display: block;color: #ffffff;font-size: 12px;text-decoration: none;text-transform: uppercase;" href="localhost:3050/subscribe/'+newEvent.id+'/yes">Yes</a></td><td style="background-color: #cd4e9c;border-color: #4c5764;border: 2px solid #cd4e9c;padding: 10px;text-align: center;"><a style="display: block;color: #ffffff;font-size: 12px;text-decoration: none;text-transform: uppercase;" href="localhost:3050/subscribe/'+newEvent.id+'/no">No</a></td></tr></table>';
				//send email to subscriber
				nodemailerMailgun.sendMail({
					from: 'team@volunteer.ga',
					to: email, // An array if you have multiple recipients.
					subject: 'New Volunteer Opportunity',
					//'h:Reply-To': 'eventCreator@company.com',
					//You can use "html:" to send HTML email content. It's magic!
					html: htmlEmail,
					//You can use "text:" to send plain-text content. It's oldschool!
				//text: 'Mailgun rocks, pow pow!'
				}, function (err, info) {
					if (err) {
						console.log('Error: ' + err);
					}
					else {
						console.log('Response: ' + info);
					}
				});
				//add subscription event to database
				var newSubscriber = new Subscriber({
					event_id: newEvent.id,
					email_data: [{
						user_id: candidate,
						responded: false,
						response: null
					}]
				});
				Subscriber.createSubscriber(newSubscriber, function(err,user) {

				});

			});
			
			req.flash('success_msg', 'Event was created');
			var context = {user : req.user}
			res.render('events', context);

		});

};

});


router.get('/data',  function(req, res){

	Event.find({}, function(err, events){


					var context = {user : req.user, events : events };
					res.render('data', context);
	});


	});

router.post('/data', function(req, res){

		console.log("ML data received: " + JSON.stringify(req.params) + " " + JSON.stringify(req.body));

		var skills = [];
		var interests = [];
		var eventids = [];

		for (var key in req.body) {
			console.log(key);

			if (key.indexOf("skill") !== -1){
				skills.push(key.replace("skill_",""));

			}
			else if (key.indexOf("interest") !== -1){
				interests.push(key.replace("interest_",""));

			}
			else if (key.indexOf("eventid") !== -1){
				eventids.push(key.replace("eventid_",""));
			}
		}


	console.log("skills are: " + JSON.stringify(skills) + " interests are: " +  JSON.stringify(interests) + " eventids are: " + JSON.stringify(eventids));
	req.checkBody('name', 'Event Name is required').notEmpty();
	req.checkBody('lat', 'Location is required').notEmpty();
	req.checkBody('lng', 'Location is required').notEmpty();

		var newData = new Data({
			name: req.body.name,
			lat: req.body.lat,
			lng: req.body.lng,
			skills: skills,
			interests: interests,
			past_events: eventids,
		});

			Data.createData(newData, function(err, user){

						res.redirect('/data');

			})


});


function test_sub(){

    console.info('cron job starting');

    //get all events that are subscriber and status active
    var query = {subscriber_model: true, status: 'active', _id: ObjectId('5ab174b4e480420202507aed')};
		Event.find(query,function(err, events){

			console.log("events is " + JSON.stringify(events));
				if(err) throw err;

				//get global offer number and find the ones that didn't reply to set to 'offered'
				GlobalSubscriber.findOne( function(err, global_sub_obj){
							if(err) throw err;

					    var global_sub_num = global_sub_obj['sub_num'];
					    console.log("global_sub_obj is  "  + global_sub_num);


							for (var p = 0; p < events.length; p++) {

								var event = events[p];

								if (event == null){
									continue;
								}

								console.log("finding subs for " + event['event_name']);


								//mark these subs as rejected, the user didn't respond to them
								var query = {event_id: event['_id'], status: 'tbd', offer_number: global_sub_num};
								Subscriber.find(query, function(err, sent_subs){
									if(err) throw err;

									console.log("sent subs is " + JSON.stringify(sent_subs));

									for (var s = 0; s < sent_subs.length; s++ ){

										var sent_sub = sent_subs[s];

										console.log("rejecting sub is " + JSON.stringify(sent_sub));
										//mark status are rejected
										//sent_sub.status = 'rejected';

										Subscriber.update({_id: sent_sub._id}, { status: 'rejected' }, function(err, updatedSub) {
											if(err) throw err;
										});
									
									}
									
											//now if the number of accepted subs is less than max number of volunteers allowed then send this to best volunteer
											var query = {event_id: event['_id'], status: 'accepted'};
											Subscriber.find(query, function(err, accepted_subs){
												if(err) throw err;

												console.log("accepted_subs length is " + accepted_subs.length);

												if (accepted_subs.length < event['max_volunteers']){
													console.log("sending a subscription!");
													//find best person to send a subscription to

													var candidates_list = find_and_send_to_best_canditate(event['_id'],global_sub_num);

															
												}
												

											});


								});
							
							}//end of for each event
							//update global number here
							global_sub_obj['sub_num'] = global_sub_num + 1;
							global_sub_obj.save();

				});
		});

}

//test_sub();


mongoose.model('ml_stage1', 
               new Schema({ _id: Number, names: [{
    type: String
}], event_id: String }));

var ml_collection = mongoose.model('ml_stage1');


function find_and_send_to_best_canditate(event_id, offer_number){

console.log("event_id is " + event_id);
//get list of best canditates from database, loop through and use the one that is vacant


ml_collection.find({event_id: event_id}, async function (err, ml_object) {
	if(err) throw err;

	console.log("ml_object from ml stage 1 is " + JSON.stringify(ml_object[0]['names']));
	names = ml_object[0]['names'];
	var available = null;

	//check if person is available
	for(var p = 0; p < names.length; p++)
	{
		var username = names[p];
		var result = await name_available(username, offer_number);

		console.log("result is " + JSON.stringify(result));

		 if (result) {
		   console.log("sending " + username + " an offer");

		 		//sending offer
		 		send_offer(event_id, result[0]['_id'],offer_number);


		 	return true;
		 }
	}

 });

}

function send_offer(event_id, volunteer_id, global_offer_number) {

	return new Promise(function(resolve,reject) {

		//create new subscriber offer

		//add subscription event to database
		var newSubscriber = new Subscriber({
			event_id: event_id,
			volunteer_id: volunteer_id,
			offer_number: global_offer_number + 1
		});


		User.findById(volunteer_id, function(err,volunteer) {

				var name = volunteer.name;
				var email = volunteer.email;

				Event.findById(event_id, function(err, event) {

							//var htmlEmail = 'Email will be sent to ' + email +'\n<p>Hi '+ name +'</p><h3>Please consider this new volunteer opportunity recommended for you!</h3><br/><table><tr><td style="background-color: #4ecdc4;border-color: #4c5764;border: 2px solid #45b7af;padding: 10px;text-align: center;"><a style="display: block;color: #ffffff;font-size: 12px;text-decoration: none;text-transform: uppercase;" href="localhost:3050/subscribe/'+newEvent.id+'/yes">Yes</a></td><td style="background-color: #cd4e9c;border-color: #4c5764;border: 2px solid #cd4e9c;padding: 10px;text-align: center;"><a style="display: block;color: #ffffff;font-size: 12px;text-decoration: none;text-transform: uppercase;" href="localhost:3050/subscribe/'+newEvent.id+'/no">No</a></td></tr></table>';
							//send email to subscriber
							var htmlEmail = '<!DOCTYPE html> <html> <head> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" /> <link href="https://fonts.googleapis.com/css?family=Rajdhani" rel="stylesheet"> <script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script> <style> body { font-family: "Rajdhani", sans-serif; } hr { margin-top: 0px; margin-bottom: 0px; } #button1 , #button2 { display:inline-block; /**other codes**/ } </style> </head> <body> <div class="container"> <div class="row"> <h3>Hi,' +  name +'</h3> <h3>Please consider this new volunteer opportunity recommended for you.</h3> <br> <p>Organization Name: Sick Kids Hospital </p> <p>Event Name: ' +  event.event_name + ' </p> <p>Event Location (Lat/Lon): ' + event.lat + '/' + event.lon  +' </p> <p>Event Date: ' + event.event_start_date +' to ' + event.event_end_date + '</p> <br> <form action="http://localhost:3050/subscribe/'  + newSubscriber._id + '/yes" id="button1" method="get"> <input type="submit" class="btn btn-success" id="button1" value="Accept"/> </form> <form method="get" action="http://localhost:3050/subscribe/' + newSubscriber._id +'/no" id="button2"> <input type="submit" class="btn btn-danger" id="button1" value="Decline"/> </form> </div> <br><br> <br> <footer class="footer"> <p>© 2017 Volunteer Discovery Platform.</p> </footer> </div> </body> </html>';

							nodemailerMailgun.sendMail({
								from: 'team@volunteer.ga',
								to: 'smeetgajjarwork@gmail.com', // An array if you have multiple recipients.
								subject: 'Volunteer Discovery Platform: New Oppurtunity',
								//'h:Reply-To': 'eventCreator@company.com',
								//You can use "html:" to send HTML email content. It's magic!
								html: htmlEmail,
								//You can use "text:" to send plain-text content. It's oldschool!
							//text: 'Mailgun rocks, pow pow!'
							}, function (err, info) {
								if (err) {
									console.log('Error: ' + err);
								}
								else {
									console.log('Response: ' + info);
								}
							});

							Subscriber.createSubscriber(newSubscriber, function(err,user) {
									if (err) reject(err);
									resolve(user);

							});


			  });
			

		});

	});
}

function name_available(username, global_offer_number){

return new Promise(function(resolve, reject) {

				//make query to find id 
				User.find({username: username}, async function(err, volunteer) {
					if (err) reject(err);

				//console.log("volunteer is " + JSON.stringify(volunteer) + " global offer number is " + global_offer_number);

						//find if we sent this person an offer
						var available = await sub_offer_not_sent_check(volunteer[0]._id, global_offer_number);

						console.log("available is " + available);

						if (available){
							resolve(volunteer);
						}else{
							resolve(false);
						}

				});

});
}

function sub_offer_not_sent_check(volunteer_id, global_offer_number) {
		return new Promise(function(resolve, reject) {

		console.log("volunteer_id is " + volunteer_id);
			 Subscriber.findOne( {volunteer_id: volunteer_id, offer_number: global_offer_number}, function(err, sub_offer){
					if (err) throw err;
					console.log("sub offer is " + JSON.stringify(sub_offer));
					if (sub_offer == null) {
						resolve(true);
					}
					else {
						resolve(false);
					}

				});
	
			});
}


//runs every 10 minutes
var cronJob = cron.job("*/30 * * * * *", test_sub);

//cronJob.start();

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		//res.render('/users/login');

						var context = {user : req.user};
						res.render('home', context);
	}
}


var mailgunAuth = {
    auth: {
      api_key: '//',
      domain: 'sandbox091e9e5e429d4b24aae968453fe23f11.mailgun.org'
    }//,
    //proxy: 'http://user:pass@localhost:8080' // optional proxy, default is false
  };
  var nodemailerMailgun = nodemailer.createTransport(mg(mailgunAuth));

//given event, select a suitable candidate to send email to
function findSuitableCandidate(eventData) {
	//for now just return a uid 
	//TODO - actually recommend a proper candidate based on event
	return '5a5b8bb79c77e933ac651ff2';
}




module.exports = router;
