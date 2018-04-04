var mongoose = require('mongoose');

// Profile Schema
var ProfileSchema = mongoose.Schema({
	uid: {
		type: String,
		index: {unique: true}
	},
	interests: [{
		type: String
	}],
	skills: [{
		type: String
	}],
	dob: {
		type: Date
	},
	availability: {
		monday: {
			from: {
				type: String
			},
			to: {
				type: String
			}
		},
		tuesday: {
			from: {
				type: String
			},
			to: {
				type: String
			}
		},
		wednesday: {
			from: {
				type: String
			},
			to: {
				type: String
			}
		},
		thursday: {
			from: {
				type: String
			},
			to: {
				type: String
			}
		},
		friday: {
			from: {
				type: String
			},
			to: {
				type: String
			}
		},
		saturday: {
			from: {
				type: String
			},
			to: {
				type: String
			}
		},
		sunday: {
			from: {
				type: String
			},
			to: {
				type: String
			}
		}
	},
	type_org: {
		type: String
	},
	description: {
		type: String
	},
	phone_number: {
		type: String
	},
	created_time: { type: Date, default: Date.now }
});

var Profile = module.exports = mongoose.model('Profile', ProfileSchema);


module.exports.createProfile = function(currUser, newProfile, callback){
	var profileCreate = new Profile({
		uid: newProfile.uid, 
		interests: newProfile.interests, 
		skills: newProfile.skills, 
		dob: newProfile.dob, 
		availability: newProfile.availability, 
		type_org: newProfile.type_org,
		description: newProfile.description,		
		phone_number: newProfile.phone_number
	});

	profileCreate.save(function(err, profileCreate){
		if(err) {
			return console.error(err);
		}
		console.log("Profile has been created.");
	});
}

module.exports.updateProfile = function(currUser, editProfile, callback){
	console.log("*****" + editProfile._id + "******")
	Profile.findOne({_id: editProfile._id}, function(err, profile) {
		if(err) {
			return console.error(err);
		}
		else {
			profile.interests = editProfile.interests
			profile.skills = editProfile.skills
			profile.dob = editProfile.dob
			profile.availability = editProfile.availability
			profile.type_org = editProfile.type_org
			profile.description = editProfile.description,					
			profile.phone_number = editProfile.phone_number			
			profile.save(function(err, profile){
				if(err) {
					return console.error(err);
				}
				console.log("Profile has been updated.");
			});
		}
	});
}

module.exports.getProfileByUId = function(uid, callback){
	var query = {uid: uid};
	Profile.findOne(query, callback);
}

module.exports.getProfileById = function(id, callback){
	Profile.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}