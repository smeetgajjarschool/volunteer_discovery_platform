var mongoose = require('mongoose');

// User Schema
var SubscriberSchema = mongoose.Schema({
	event_id: {
		type: String,
		index:true
    },
    volunteer_id: {
        type: String
    },
    status: {
        type: String,
        default: 'tbd'
    },
    type: {
        type: String,
        default: 'interest'
    },
    offer_number :{
        type: Number,
        default: -1
    },
	created_time: { type: Date, default: Date.now }
});


var Subscriber = module.exports = mongoose.model('Subscriber', SubscriberSchema);


module.exports.createSubscriber = function(newSubscriber, callback){

	        newSubscriber.save(callback);
}
