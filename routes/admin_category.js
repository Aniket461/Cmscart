var express= require('express');

var router = express.Router();

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;


//get category model

var Category = require('../models/category')

//Get category index

router.get('/', isAdmin,  function(req,res){

	Category.find(function(err, categories){

		if(err) return console.log(err);

res.render('admin/categories',{


	categories: categories


});

	});

	//Page.find({}).sort({sorting:1}).exec(function(err, pages){

	//	res.render('admin/pages', {

	//		pages: pages


	//	});


	//});
});



//add category

router.get('/add-category', isAdmin, function(req,res){

var title = "";


res.render('admin/add_category',{

title: title

});


});


//Post add categroy

router.post('/add-category', function(req,res){


 req.checkBody('title', 'title must have a value').notEmpty();

 var title= req.body.title;
 var slug= title.replace(/\s+/g, '-').toLowerCase();
 
 var errors= req.validationErrors();

 if(errors){

 
res.render('admin/add_category',{
errors: errors,
title: title




});


 } else{

 		
 		Category.findOne({slug: slug}, function(err, category){


 			if(category){

 				req.flash('danger', 'Category slug exists, choose another, ');
 				res.render('admin/add_category',{
					
					title: title
					});

 			}

 			else{

 				var category = new Category({

 					title: title,
 					slug: slug

 				});

 				category.save(function(err){

 					if(err) return console.log(err);

 					Category.find(function(err, categories){

	if(err){
		console.log(err);
	}
	else{
		req.app.locals.categories = categories;
	}


	});


 					req.flash('success','Category added!');
 					res.redirect('/admin/categories');


 				});
 			}

 		});


 }

});



//get edit category

router.get('/edit-category/:id',isAdmin, function(req,res){


Category.findById(req.params.id, function(err, category){

if(err) return console.log(err);

else{

	res.render('admin/edit_category',{

title: category.title,
id: category._id

});

}
});

});


//page edit save

router.post('/edit-category/:id', function(req,res){


 req.checkBody('title', 'title must have a value').notEmpty();
 
 var title= req.body.title;
 var slug= title.replace(/\s+/g, '-').toLowerCase();
 var id= req.params.id;
 var errors= req.validationErrors();

 if(errors){

 
res.render('admin/edit_category',{
errors: errors,
title: title,
id: id




});


 } else{

 		
 		Category.findOne({slug: slug,_id: {'$ne':id}}, function(err, category){


 			if(category){

 				req.flash('danger', 'Category title exists, choose another, ');
 				res.render('admin/edit_category',{
					
					title: title,
					
					id:id
					});

 			}

 			else{

Category.findById(id, function(err,category){


if(err) return console.log(err);

category.title = title,
category.slug = slug



 				category.save(function(err){

 					if(err) return console.log(err);

 					Category.find(function(err, categories){

	if(err){
		console.log(err);
	}
	else{
		req.app.locals.categories = categories;
	}


	});


 					req.flash('success','Category Updated!');
 					res.redirect('/admin/categories');


 				});


});


 			}

 		});


 }

});




//delete category

router.get('/delete-category/:id',isAdmin, function(req,res){

Category.findByIdAndRemove(req.params.id, function(err){

	if(err){
		return console.log(err);

	}

	else{
		Category.find(function(err, categories){

	if(err){
		console.log(err);
	}
	else{
		req.app.locals.categories = categories;
	}


	});

		req.flash('success', 'Category Deleted');
		res.redirect('/admin/categories')
	}

})
});



//export
module.exports= router;