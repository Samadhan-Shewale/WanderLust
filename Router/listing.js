const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema, reviewSchema } = require("../schema.js");          // schema validator surver side ( Joi )
const ExpressError = require("../utils/ExpressError.js");   // custom express-error handler class




const validateListing = (req,res, next ) =>{
    let {error } = listingSchema.validate(req.body);
    if( error ){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg );
    }else{
        next();
    }
}

// index route 
router.get("/", wrapAsync ( async (req,res) =>{
    const allListing = await Listing.find();
    res.render("./listings/index.ejs",{allListing });
}))


// Create route 
router.get("/new",(req,res) => {
    res.render("./listings/new.ejs");
})

// show route
router.get("/:id", wrapAsync (async (req,res) =>{
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs", {listing});
}));

// new route 
router.post("/", validateListing , wrapAsync (async (req,res, next)  => {
        const newListing = new Listing( req.body.listing );
        await newListing.save();
        res.redirect("/listings");
}))

// edit and update route
router.get("/:id/edit", wrapAsync ( async(req, res) =>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs",{ listing});
}))

// update route
router.put("/:id", validateListing, wrapAsync ( async (req, res) =>{
    // if(! req.body.listing ){
    //     throw new ExpressError(400, "Send valid data for listing ");
    // }
    const {id} = req.params;
    await Listing.findByIdAndUpdate( id, {...req.body.listing })
    res.redirect(`/listings/${id}`);

}))

// delete route  
router.delete("/:id", wrapAsync ( async (req, res) =>{
   const {id} = req.params ;
   
   // approach 1 ( deleting )
//    let listing = await Listing.findById(id);
//    console.log(listing.reviews);
//     await Review.deleteMany({ _id: { $in : listing.reviews }});

    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));


module.exports = router ;