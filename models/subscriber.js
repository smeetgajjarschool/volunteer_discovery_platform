var mongoose = require('mongoose');

// User Schema
var SubscriberSchema = mongoose.Schema({
	event_id: {
		type: String,
		index:true
    },
	email_data: [
		{
            user_id: {
                type: String
            },
            responded: {
                type: Boolean
            },
            response: {
                type: Boolean
            }
        }
    ],
	created_time: { type: Date, default: Date.now }
});


var Subscriber = module.exports = mongoose.model('Subscriber', SubscriberSchema);


module.exports.createSubscriber = function(newSubscriber, callback){

	        newSubscriber.save(callback);
}
