var mongoose = require('mongoose');

// User Schema
var GlobalSubscriberSchema = mongoose.Schema({
	sub_num: {
		type: Number,
		default: 0
    }
});


var GlobalSubscriber = module.exports = mongoose.model('GlobalSubscriber', GlobalSubscriberSchema);


module.exports.createSubscriber = function(newSubscriber, callback){

	        newSubscriber.save(callback);
}
