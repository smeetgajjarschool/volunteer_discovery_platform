var mongoose = require('mongoose');

// User Schema
var EventSchema = mongoose.Schema({
	event_name: {
		type: String,
		index:true
	},
	organization_id: {
		type: String,
	},
		event_start_date: {
		type: Date
	},
		event_end_date: {
		type: Date
	},
		lat: {
		type: Number
	},
		lng: {
		type: Number
	},
	created_time: { type: Date, default: Date.now },
		skills: {
		type: Array,
	},
		interests: {
		type: Array,
	},
	subscriber_model: {
		type: Boolean

	},
	status:
	{
		type: String,
		default: 'active'
	},
	max_volunteers:
	{
		type: Number,
		default: 10
	}
});




var Event = module.exports = mongoose.model('Event', EventSchema);


module.exports.createEvent = function(newEvent, callback){

	        newEvent.save(callback);
}
