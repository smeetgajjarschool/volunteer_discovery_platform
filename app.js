var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs')
var exphbs = require('express-handlebars');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var elasticsearch = require('elasticsearch');
var cors = require('cors')


var mongo = require('mongodb');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;
//mongoose.connect('mongodb://user2:password@ds251588.mlab.com:51588/volunteer-cloud');
//var db = mongoose.connection;



var routes = require('./routes/index');
var users = require('./routes/users');
var profiles = require('./routes/profiles');
var friends = require('./routes/friends');
var subscribers = require('./routes/subscribers');
var reviews = require('./routes/reviews')

// Initializing app
var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// View Engine
//app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'handlebars');

var Handlebars = require('handlebars');

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

app.engine('handlebars', exphbs(

	{defaultLayout: 'layout', helpers: {

		ifEquals: function(arg1,arg2, options) {
			return (arg1 == arg2) ? options.fn(this) : options.inverse(this);

		}
	}}));

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});


// var mongo = require('mongodb');
// var mongoose = require('mongoose');

// //var db = mongojs('customerapp', ['users']);
// mongoose.connect('mongodb://localhost/loginapp');
// var db = mongoose.connection;


var routes = require('./routes/index');
var users = require('./routes/users');




// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

// Set Static Path
app.use(express.static(path.join(__dirname,'public')));


// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));


// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());


// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});


app.use('/', routes);
app.use('/users', users);
app.use('/profile', profiles);
app.use('/friends', friends);
app.use('/subscribe', subscribers);
app.use('/review', reviews)

var users = [

{
	id : 1,
	first_name: "John",
	last_name: "Doe",
	email: 'johndoe@gmail.com'
},
{
	id : 2,
	first_name: "Bob",
	last_name: "Smith",
	email: 'bobsmith@gmail.com'
},
{
	id : 1,
	first_name: "Phil",
	last_name: "Jackson",
	email: 'jacksonbarber@gmail.com'
},

]

/*app.get('/', function(req, res) {

	db.users.find(function(err, docs){

		console.log(docs);
		var title = 'Customers';
		var context = {title: title, users: users}

		res.render('index', context);

	})
}
);*/

app.post('/users/add', function(req, res){

	var newUser = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email
	}

	db.users.insert(newUser, function(err, response){
		if (err){
			console.log(err);
		}
			res.redirect('/');
	});

	console.log(newUser);


});

app.delete('/users/delete/:id', function(req,res){

	console.log("deleting " + req.params.id);

});

app.listen(3050, function() {
	console.log('Server started on Port 3050');
})
