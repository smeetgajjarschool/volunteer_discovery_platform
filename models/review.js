var mongoose = require('mongoose');

// Reviews Schema
var ReviewSchema = mongoose.Schema({
	review_by_id: {
		type: String
	},
	review_for_id: {
		type: String
	},
	event_id: {
		type: String
	},
	review: {
		type: String
	},
	rating: {
		type: Number
	},
	created_time: { type: Date, default: Date.now }
});

var Review = module.exports = mongoose.model('Review', ReviewSchema);


module.exports.createReview = function(newReview, callback){
	newReview.save(callback);
}

module.exports.updateReview = function(editReview, callback){
	Review.findOne({_id: editReview._id}, function(err, review) {
		if(err) {
			return console.error(err);
		}
		review.review = editReview.review
		review.rating = editReview.rating
			
		review.save(callback);
	});
}

module.exports.getReviewByUId = function(uid, callback){
	var query = {uid: uid};
	Review.findOne(query, callback);
}

module.exports.getReviewById = function(id, callback){
	Review.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}