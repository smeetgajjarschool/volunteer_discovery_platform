var express = require('express');
var router = express.Router();

var Subscriber = require('../models/subscriber');

router.get('/:uid/:answer', function(req, res){
    console.log("Subscriber req is " + req);
    var uid = req.params.uid;
    var answer = req.params.answer;

    Subscriber.findById(uid,function(err,entry) {
        if(err) throw err;

        if(answer == 'yes') {
            Subscriber.update( {_id: entry.id} ,function(err, updatedEntry) {
                if (err) throw err;
            });
        } else if(answer == 'no') {
            Subscriber.update( {_id: entry.id} ,function(err, updatedEntry) {
                if (err) throw err;
            });
            //also need to send another email
        }


    });



    console.log('Subscriber received ' + uid + ' ' + answer);
});




module.exports = router;