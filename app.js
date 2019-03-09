var express = require('express');
var path = require('path');
const mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport');



//connect to db

mongoose.connect(config.database, {useNewUrlParser: true});

var db= mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function(){

console.log('connected to mongo DB');

});

var app = express();

app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Set public folder

app.use(express.static(path.join(__dirname,'public')));



// body parser middleware

app.use(bodyParser.urlencoded({extended: false}));
//parse application/json
app.use(bodyParser.json());


//express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  //cookie: { secure: true }
}));


// express validator middleware

app.use(expressValidator({

errorFormatter: function(param,msg,value){

	var namespace= param.split('.')
	, root = namespace.shift()
	, formParam = root;

	while(namespace.length){
		formParam += '[' + namespace.shift() + ']';
	}
	return{

		param: formParam,
		msg: msg,
		value

	};
},

customValidators:{

	isImage: function(value, filename){
		var extension = (path.extname(filename)).toLowerCase();
		switch(extension){
			case '.jpg':
				return '.jpg';
			case '.jpeg':
				return '.jpeg';
			case '.png':
				return '.png';
			case '':
				return '.jpg';
			default:
				return false;


		}
	}
}

}));



// global errors

app.locals.errors = null;

//Get page model

var Page = require('./models/page');
//Get page model

var Category = require('./models/category');


// Get all Pages

Page.find({}).sort({sorting:1}).exec(function(err, pages){

	if(err){
		console.log(err);
	}
	else{
		app.locals.pages = pages;
	}


	});


// Get all Pages

Category.find(function(err, categories){

	if(err){
		console.log(err);
	}
	else{
		app.locals.categories = categories;
	}


	});



// express fileupload middleware

app.use(fileUpload());


//express messages middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


//passport config

require('./config/passport')(passport);

//Passport middleware

app.use(passport.initialize());

app.use(passport.session());

app.get('*', function(req,res,next){

	res.locals.cart = req.session.cart;
	res.locals.user = req.user || null;
	next();
});

//set routes

var pages = require('./routes/pages.js');
var products = require('./routes/products.js');

var cart = require('./routes/cart.js');
var users = require('./routes/users.js');
var adminPages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_category.js');
var adminProducts = require('./routes/admin_products.js');

app.use('/admin', adminPages);
app.use('/products', products);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/cart', cart);
app.use('/users', users);

app.use('/', pages);


//start the server

var port = 3000;
app.listen(port, function(){

	console.log('Server Started on port:' +port);
});