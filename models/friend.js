var mongoose = require('mongoose');

var FrienderSchema = mongoose.Schema({
	username: {
		type: String,
		index: {unique: true, dropDups: true}
	},
	friends_list:[{	
		friend_name:{
			type: String,
			index: {unique: true, dropDups: true}
		},
		friend_profile:{
			type: String
		},
		"_id": false
	}],
	created_time: { type: Date, default: Date.now },
});

var Friend = module.exports = mongoose.model('Friend', FrienderSchema);

module.exports.addFriend = function(currUser, friendUser, friendUserURL, callback){
	var friendsAdd = new Friend({username:currUser,
		friends_list:[{friend_name:friendUser, friend_profile:friendUserURL}]});
	console.log(friendsAdd.friends_list[0].friend_name);
	friendsAdd.save(function(err,friendsAdd){
		if(err)return console.error(err);
		console.log("NEW FRIEND SUCCESS");
		console.log(friendsAdd.friends_list[0].friend_name);
	});

	var queryAdd = {username: currUser};
	Friend.findOneAndUpdate(queryAdd, {$addToSet: {friends_list:{friend_name:friendUser, friend_profile:friendUserURL}}},
		function(err){
    		if (err) return console.log ("ADD FAIL");
    		return console.log ("ADD GOOD");
	});
}

module.exports.removeFriend = function(currUser, friendUser, callback){
	var queryDel = {username: currUser};
	Friend.findOneAndUpdate(queryDel, {$pull: {friends_list:{friend_name:friendUser}}},
		function(err){
    		if (err) return console.log ("DEL FAIL");
    		return console.log ("DEL GOOD");
	});
}