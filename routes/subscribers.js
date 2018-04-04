var express = require('express');
var router = express.Router();

var Subscriber = require('../models/subscriber');

router.get('/:uid/:answer', function(req, res){
    console.log("Subscriber req is " + req);
    var uid = req.params.uid;
    var answer = req.params.answer;

    var success = false;

    Subscriber.findById(uid,function(err,entry) {
        if(err) throw err;

        console.log("sub is " + JSON.stringify(entry));

        if (entry == null) {
            res.redirect('/');

        }
        else{
        //check what the status is currnetly 

        if (entry.status == 'rejected' || entry.status == 'accepted') {

            console.log("offer already rejected or accepted, nothing to do ");

            var msg;
    if (success) {
        msg = 'Successfully registered for event';
        req.flash('success_msg', msg);


    }else
    {
        msg  = "Didn't respond in time, sorry";
        req.flash('error_msg', msg);

    }
    console.log('Subscriber received ' + uid + ' ' + answer);
    var context = {user : req.user};
    res.render('home',context)

        }else
        {

                    if(answer == 'yes') {
                        entry.status = 'accepted';
                        entry.save();
                        success = true;

                    } else if(answer == 'no') {
                        entry.status = 'rejected';
                        entry.save();
                        //also need to send another email
                     }

                     var msg;
    if (success) {
        msg = 'Successfully registered for event';
        req.flash('success_msg', msg);


    }else
    {
        msg  = "Didn't respond in time, sorry";
        req.flash('error_msg', msg);

    }
    console.log('Subscriber received ' + uid + ' ' + answer);
    var context = {user : req.user};
    res.render('home',context)
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
}

    });

    
});




module.exports = router;