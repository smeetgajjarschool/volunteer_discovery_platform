var mongoose = require('mongoose');

// Profile Schema
var ProfileSchema = mongoose.Schema({
	dob: {
		type: Date,
		index:true
	},
	created_time: { type: Date, default: Date.now },
});




var Profile = module.exports = mongoose.model('Profile', ProfileSchema);


module.exports.createProfile = function(newProfile, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}


module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}