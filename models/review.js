var mongoose = require('mongoose');

// Reviews Schema
var ReviewSchema = mongoose.Schema({
	review_by_id: {
		type: String
	},
	review_for_id: {
		type: String
	},
	event_id: [{
		type: String
	}],
	review: [{
		type: String
	}],
	rating: {
		type: Number
	},
	created_time: { type: Date, default: Date.now },
});

var Review = module.exports = mongoose.model('Review', ReviewSchema);


module.exports.createReview = function(currUser, newReview, callback){
	var reviewCreate = new Review({
		review_by_id: newReview.review_by_id, 
		review_for_id: newReview.review_for_id, 
		event_id: newReview.event_id, 
		review: newReview.review, 
		rating: newReview.rating
	});

	reviewCreate.save(function(err, reviewCreate){
		if(err) {
			return console.error(err);
		}
		console.log("Review has been created.");
	});
}

module.exports.updateReview = function(currUser, editReview, callback){
	console.log("*****" + editReview._id + "******")
	Review.findOne({_id: editReview._id}, function(err, review) {
		if(err) {
			return console.error(err);
		}
		else {
			review.review = editReview.review
			review.rating = editReview.rating
				
			review.save(function(err, review) {
				if (err){
					console.log(err)
				}
				
				console.log("Review has been updated.");
			});
		}
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