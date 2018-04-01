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
	role: {
		type: String
	},
	organization_name: {
		type: String
	},
	created_time: { type: Date, default: Date.now },
});

var Profile = module.exports = mongoose.model('Profile', ProfileSchema);


module.exports.createProfile = function(currUser, newProfile, callback){
	var profileCreate = new Profile({
		uid: newProfile.uid, 
		interests: newProfile.interests, 
		skills: newProfile.skills, 
		dob: newProfile.dob, 
		availability: newProfile.availability, 
		role: newProfile.role,
		organization_name: newProfile.organization_name
	});

	profileCreate.save(function(err, profileCreate){
		if(err) {
			return console.error(err);
		}
		console.log("Profile has been created.");
	});
}

module.exports.updateProfile = function(currUser, editProfile, callback){
	var profileEdit = new Profile({
		uid: editProfile.uid, 
		interests: editProfile.interests, 
		skills: editProfile.skills, 
		dob: editProfile.dob, 
		availability: editProfile.availability, 
		role: editProfile.role,
		organization_name: editProfile.organization_name
	});

	_id = editProfile._id

	profileEdit.save({_id: _id}, function(err, profileEdit){
		if(err) {
			return console.error(err);
		}
		console.log("Profile has been updated.");
	});
}

module.exports.getProfileByUId = function(username, callback){
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