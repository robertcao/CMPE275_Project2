/**
 * New node file
 */
var Product 	 = require('../app/models/product');

//GET
//'/category/:categoryId/product/'
/*
exports.getAllProduct = function(req, res){
	Product.find({}, function(err, products){
		if(err) {
			res.status(500).json({status:'failure'});
			console.log("Get all product error!");
		} else if(products===null) {
			res.send("could not find any product");
			console.log("could not find any product");
		} else {
			var productlist = [];
			
			products.forEach(function(product) {
				console.log(product);
				productlist.push(product);
			});
			
			res.status(200).json(productlist);
		}
	});
};
*/

//GET
//Yuan
//with category Id
//'/category/:categoryId/product/'
exports.getAllProduct = function(req, res){
	var categoryId = req.param('categoryId');
	
	Product.find({'categoryId': categoryId}, function(err, products){
		if(err) {
			res.status(500).json({status:'failure'});
			console.log("Get all product error!" + " category Id: " + categoryId);
		} else if(products === null) {
			res.send("could not find any product from category Id: " + categoryId);
			console.log("could not find any product from category Id: " + categoryId);
		} else {
			var productlist = [];
			
			products.forEach(function(product) {
				console.log(product);
				productlist.push(product);
			});
			
			res.status(200).json(productlist);
		}
	});
};

//Post
//Yuan
//'/category/:categoryId/product/'
exports.addProduct = function(req, res){
	var newProduct = new Product();
	Product.count({ productId:{$exists: true} },
			function (err, count){
				newProduct.productId 		 = count + 1;
				newProduct.productName 		 = req.param('productName');
				newProduct.quantity 		 = req.param('quantity');
				newProduct.userId 			 = req.param('userId');
				newProduct.expectedOffer 	 = req.param('expectedOffer');
				newProduct.productExpiryDate = req.param('productExpiryDate');
				newProduct.isValid 			 = req.param('isValid');
				newProduct.categoryId 		 = req.param('categoryId');
				newProduct.lastUpdated 		 = req.param('lastUpdated');
				
				newProduct.save(function(err){
					if(err){
						res.status(500).json({status:'failure'});
						console.log(err);
						console.log("failure to save new product");
					}
					else{
						res.status(200).json({
							productId 			: newProduct.productId,
							productName 		: newProduct.productName,
							quantity 			: newProduct.quantity,
							userId 				: newProduct.userId,
							expectedOffer 		: newProduct.expectedOffer,
							productDesc 		: newProduct.productDesc,
							productExpiryDate 	: newProduct.productExpiryDate,
							isValid 			: newProduct.isValid,
							categoryId 			: newProduct.categoryId,
							lastUpdated 		: newProduct.lastUpdated
						});
					}
			});
		
	});
	
};



//GET
//Yuan
//'/category/:categoryId/product/:productId'

//PUT
//Yuan
//'/category/:categoryId/product/:productId'

//DELETE
//Yuan
//'/category/:categoryId/product/:productId'


