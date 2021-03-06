/**
 * New node file
 */
var Offer		 = require('../app/models/offer');
var OfferHistory = require('../app/models/offerHistory');
var Comment		 = require('../app/models/comment');
var fun =  require('../app/funcations');
var Product =  require('../app/models/product');


//for test
exports.testSaveOffer = function(req, res){
		
	var newOffer=new Offer();
	//newOffer.offerId="1";
	newOffer.offerId=fun.guid();
	newOffer.buyingQty=100;
	
	newOffer.save(function(err){
		if(err){
			res.status(500).json({status:'failure'});
			console.log("failure to save");
		}
		else{
			res.send('saveResult', {
				status: "success",
				offerId: newOffer.offerId
			});
		}
	});
	
	
};


//for test
exports.testGetAllOffer = function(req, res){
	Offer.find()
	.exec(function(err,result){
		if(err){
			res.status(500).json({status:'failure'});
		}
		else{
			res.send('allOfferDetails', {
				allOfferDetails: result
			});
		}
	});
	
};

//GET
//'/category/:categoryId/product/:productId/offer/:offerId'
exports.getOfferDetail = function(req, res){
	var offerId = req.param('offerId');
		
	Offer.findOne({"offerId": offerId}, function(err,result){
		if(err){
			res.status(500).json({status:'failure'});
		}
		else if(result===null){
			res.send("could not find offer with this offerId");
		}
		else{			
			var offer=result;
			
			//find last event of found offer
			//TODO need to optimize the search parameter to find last history
			OfferHistory.findOne({"offerId": offerId,
								"lastModified": offer.lastModified
								},
							function(err,foundHistory){
				var foundLastEvent=null;
				
				//if(foundHistory===null){
				if(foundHistory===null||foundHistory ===undefined){
					console.log("no update history found for this offer");
				}
				else{
					foundLastEvent =foundHistory.modified;
					//foundLastEvent="lastEvent";
					
				}
				//find all the comments of this offer
				Comment.find({"offerId": offerId}, function(err,foundComments){
					//show offer details
					res.status(200).json({
						offerId : offer.offerId,
						buyingQty : offer.buyingQty,
						offeredDetails : offer.offeredDetails,
						buyerStatus : offer.buyerStatus,
						sellerStatus : offer.sellerStatus,
						offerExpiry : offer.offerExpiry,
						productId : offer.productId,
						buyerId : offer.buyerId,
						lastModified : offer.lastModified,
						//add last Event here
						lastEvent : foundLastEvent,
						// add comments here
						comments : foundComments
					});
				
				});
			});
			
		}
	});
	
};

//PUT
//'/category/:categoryId/product/:productId/offer/:offerId'
exports.updateOffer = function(req, res){
	var offerId = req.param('offerId');
	Offer.findOne({"offerId": offerId}, function(err,offer){
		if(err){
			res.status(500).json({status:'failure'});
		}
		else if(offer===null){
			res.send("could not find offer with this offerId");
		}
		else{
			//update found offer
			offer.offerId=req.param('offerId');
			offer.buyingQty=req.param('buyingQty');
			offer.offeredDetails=req.param('offeredDetails');
			offer.buyerStatus=req.param('buyerStatus');
			offer.sellerStatus=req.param('sellerStatus');
			offer.offerExpiry=req.param('offerExpiry');
			offer.productId=req.param('productId');
			offer.buyerId=req.param('buyerId');
			offer.lastModified=new Date();
			offer.save(function(err){
				if(err){
					res.status(500).json({status:'failure'});
					console.log("failure to update found offer");
				}
				else{
					//insert a record in OfferHistory
					var newHistory= new OfferHistory();
					OfferHistory.count({ offerHistoryId:{$exists: true} },
							function (err, count){
								newHistory.offerHistoryId = count+1;
								newHistory.offerId = offer.offerId;
								//TODO need to decide what should be stored
								// for newHistory.modified
								newHistory.modified = offer;
								//newHistory.lastModified = new Date();
								// or store the time that offer is updated
								newHistory.lastModified = offer.lastModified;
								newHistory.save(function(err){
									 if(err){
										 console.log("failure to save history"); 
									 }
								});
							}
					);
					
					//find all the comments of this offer
					Comment.find({"offerId": offerId}, function(err,foundComments){
						//show update result
						res.status(200).json({
							offerId : offer.offerId,
							buyingQty : offer.buyingQty,
							offeredDetails : offer.offeredDetails,
							buyerStatus : offer.buyerStatus,
							sellerStatus : offer.sellerStatus,
							offerExpiry : offer.offerExpiry,
							productId : offer.productId,
							buyerId : offer.buyerId,
							lastModified : offer.lastModified,
							// add comments here
							comments : foundComments
						});
					
					});
				}
			});
		
		}
		
	});
	
	
};

//DELETE
//'/category/:categoryId/product/:productId/offer/:offerId'
exports.deleteOffer = function(req, res){
	var offerId = req.param('offerId');
	Offer.remove({ "offerId": offerId }, function(err) {
	    if (!err) {
	    	var removeOffer=true;
	    	var removeHistory=true;
	    	var removeComment=true;
	    	OfferHistory.remove({ "offerId": offerId }, function(err) {
	    			if(err){
	    				removeHistory=false;
	    			}
	    			Comment.remove({ "offerId": offerId }, function(err) {
	    				if(err){
	    					removeComment=false;
	    				}
	    			});
	    	});
	    	
	    	res.status(200)
	    		.json({
	    		status:'success',
		    	removeOffer : removeOffer,
	    		removeHistory : removeHistory,
	    		removeComment: removeComment
	    		});    
	    }
	    else {
	    	res.status(500).json({status:'delete offer failure'});     
	    }
	});
	
	
};

//POST
//'/category/:categoryId/product/:productId/offer/:offerId/comment'
exports.addOfferComment = function(req, res){
	var newComment= new Comment();
	Comment.count({ commentId:{$exists: true} },
			function (err, count){
				newComment.commentId = count+1;
				newComment.offerId = req.param('offerId');
				newComment.userId = req.param('userId');
				newComment.commentDesc = req.param('commentDesc');
				newComment.lastUpdated = new Date();
				
				newComment.save(function(err){
					if(err){
						res.status(500).json({status:'failure'});
						console.log("failure to save");
					}
					else{
						res.status(200).json({
							_id : newComment._id,
							commentId :newComment.commentId,
							comment : newComment.commentDesc,
							userId : newComment.userId
								
						});
					}
			});
		
	});
	

};

//for test
//GET
//'/category/:categoryId/product/:productId/offer/:offerId/comment'
exports.getOfferComment = function(req, res){
	var offerId = req.param('offerId');
	Comment.find({"offerId": offerId}, function(err,result){
		if(err){
			res.status(500).json({status:'failure'});
		}
		else if(result===null){
			res.send("could not find comment with this offerId");
		}
		else{
			res.status(200).json({
				comments: result
			});
		}
	});
	

};

//for test
//POST  
//'/category/:categoryId/product/:productId/offer/:offerId/history'
exports.addOfferHistory = function(req, res){
	var newHistory= new OfferHistory();
	OfferHistory.count({ offerHistoryId:{$exists: true} },
			function (err, count){
				newHistory.offerHistoryId = count+1;
				newHistory.offerId = req.param('offerId');
				newHistory.modified = req.param('modified');
				newHistory.lastModified  = new Date();
				
				newHistory.save(function(err){
					if(err){
						res.status(500).json({status:'failure'});
						console.log("failure to save");
					}
					else{
						res.status(200).json({
							_id : newHistory._id,
							offerHistoryId :newHistory.offerHistoryId,
							offerId : newHistory.offerId,
							modified : newHistory.modified,
							lastModified : newHistory.lastModified 
								
						});
					}
			});
		
	});
	

};


//GET
//'/category/:categoryId/product/:productId/offer/:offerId/history'
exports.getOfferHistory = function(req, res){
	var offerId = req.param('offerId');
	OfferHistory.find({"offerId": offerId}, function(err,result){
		if(err){
			res.status(500).json({status:'failure'});
		}
		else if(result===null){
			res.send("could not find comment with this offerId");
		}
		else{
			res.status(200).json({
				offerHistory: result
			});
		}
	});

};

//Create a offer
//Post
///category/:categoryId/product/:productId/offer
exports.addOffer = function(req, res){
	  var offer = new Offer();
      var productId = req.param('productId');
      Product.findOne({"productId": productId},
    		function (err, result){
    		console.log(result);
            if(result===null||result===undefined){
			res.send("could not find product for this offer");
			}
			else{
			offer.offerId=fun.guid();
			offer.buyingQty=req.param('buyingQty');
			offer.offeredDetails=req.param('offeredDetails');
			offer.buyerStatus=req.param('buyerStatus');
			offer.sellerStatus=req.param('sellerStatus');
			offer.offerExpiry=req.param('offerExpiry');
			offer.productId=req.param('productId');
			offer.buyerId=req.param('buyerId');
			offer.lastModified=new Date();
			}
			offer.save(function(err){
				if(err){
					res.status(500).json({status:'failure'});
					console.log("failure to update found offer");
				}
				else{
					res.status(200).json({
						offerId : offer.offerId,
						buyingQty : offer.buyingQty,
						offeredDetails : offer.offeredDetails,
						buyerStatus : offer.buyerStatus,
						sellerStatus : offer.sellerStatus,
						offerExpiry : offer.offerExpiry,
						productId : offer.productId,
						buyerId : offer.buyerId,
						lastModified : offer.lastModified
					});
								
							}
					
				
				});
      });
 };	
 
 

//list all offer
//'/category/:categoryId/product/:productId/offer'
exports.listOffers = function (req, res) {
	 var productId = req.param('productId');
	 Offer.find({'productId': productId}, function(err, offers){
	 	console.log(offers.length);
			if(err) {
				res.status(500).json({status:'failure'});
				console.log("Get all offers error!" + " productId: " + productId);
			} else if(offers.length===0) {

				res.send("could not find any offer from productId: " + productId);
				//console.log("could not find any product from category Id: " + categoryId);
			} else {
				var offerlist = [];
				
				offers.forEach(function(offer) {
					offerlist.push(offer);
				});
				
				res.status(200).json({offers:offerlist});
			}
		});
}
