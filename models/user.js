var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
			age: {
		type: Number
	},
		lat: {
		type: Number
	},
		lng: {
		type: Number
	},
	info : {
		type: String,
		default: ''
	},
	user_type: {
		type: String,
		default: 'not_set'
	},
	created_time: { type: Date, default: Date.now },
	subscriber_model: { type: Boolean, default: false},
			skills: {
		type: Array,
	},
		interests: {
		type: Array,
	},
		address:{
			type: String
	}

});


var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        console.log("NEW USERRRRR " + newUser)
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