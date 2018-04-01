var express = require('express');
var router = express.Router();

var Subscriber = require('../models/subscriber');

router.get('/:uid/:answer', function(req, res){
    console.log("Subscriber req is " + req);
    var uid = req.params.uid;
    var answer = req.params.answer;

    Subscriber.findById(uid,function(err,entry) {
        if(err) throw err;

        console.log("sub is " + JSON.stringify(entry));


        //check what the status is currnetly 

        if (entry.status == 'rejected' || entry.status == 'accepted') {

            console.log("offer already rejected or accepted, nothing to do ");

        }else
        {

                    if(answer == 'yes') {
                        entry.status = 'accepted';
                        entry.save();

                    } else if(answer == 'no') {
                        entry.status = 'rejected';
                        entry.save();
                        //also need to send another email
                     }
        }

        // if(answer == 'yes') {
        //     Subscriber.update( {_id: entry.id} ,function(err, updatedEntry) {
        //         if (err) throw err;
        //     });
        // } else if(answer == 'no') {
        //     Subscriber.update( {_id: entry.id} ,function(err, updatedEntry) {
        //         if (err) throw err;
        //     });
        //     //also need to send another email
        // }

        //check that number of offered + accepted is < max # of volunteers


    });



    console.log('Subscriber received ' + uid + ' ' + answer);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ a: 1 }, null, 3));
});




module.exports = router;