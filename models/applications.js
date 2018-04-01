var mongoose = require('mongoose');

// User Schema
var ApplicationSchema = mongoose.Schema({
	event_id: {
		type: String,
		index:true
	},
	volunteer_id: {
		type: String,
	},
	status: {
		type: String,
		default: "tbd"
		/* Types: 
			"tbd" = Inital state after applying
			"accepted" = Accepted by organization 
			"rejected" = Rejected by organization
			"cancelled_org" = Cancelled by organization
			"cancelled_vol" = Cancelled by organization
			"completed" = Completed
		*/

	},
	created_time: { type: Date, default: Date.now },
	rating: {
		type: Number,
		default: -1
	}
});


var Application = module.exports = mongoose.model('Application', ApplicationSchema);


module.exports.createApplication = function(newApplication, callback){

	        newApplication.save(callback);
}
