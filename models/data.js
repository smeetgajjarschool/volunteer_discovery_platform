var mongoose = require('mongoose');

// User Schema
var DataSchema = mongoose.Schema({
	name: {
		type: String,
		index:true
	},
	skills: {
		type: Array,
	},
		interests: {
		type: Array,
	},
	past_events: {
		type: Array,
	},
		lat: {
		type: Number
	},
		lng: {
		type: Number
	},
	created_time: { type: Date, default: Date.now }
});




var Data = module.exports = mongoose.model('Data', DataSchema);


module.exports.createData = function(newData, callback){

	        newData.save(callback);
}
