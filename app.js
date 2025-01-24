const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const app = express();
const path = require("path");
const methodOverride  =  require("method-override"); 
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");  // custom express-error handler class
const {listingSchema } = require("./schema.js");          // schema validator surver side ( Joi )
const Review = require("./models/review.js");              

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded( {extended : true }));   // parse the data in the url 
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use( express.static( path.join(__dirname, "/public") ));  

const MONGO_URL = "mongodb://127.0.0.1:27017/wander";
main()
    .then( (res) => {
        console.log("Connected to DB ");
    })
    .catch( (err) => {
        console.log(err);
    })

async function main(){
   await mongoose.connect(MONGO_URL);
}

// converting validation into middleware
const validateListing = (req,res, next ) =>{
    let {error } = listingSchema.validate(req.body);
    if( error ){
        throw new ExpressError(400, error );
    }else{
        next();
    }
}

// index route 
app.get("/listings", wrapAsync ( async (req,res) =>{
    const allListing = await Listing.find();
    res.render("./listings/index.ejs",{allListing });
}))


// Create route 
app.get("/listings/new",(req,res) => {
    res.render("./listings/new.ejs");
})

// show route
app.get("/listings/:id", wrapAsync (async (req,res) =>{
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", {listing});
}));

// new route 
app.post("/listings", validateListing , wrapAsync (async (req,res, next)  => {
        
        
        const newListing = new Listing( req.body.listing );
        await newListing.save();
        res.redirect("/listings");
}))

// edit and update route
app.get("/listings/:id/edit", wrapAsync ( async(req, res) =>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs",{ listing});
}))

// update route
app.put("/listings/:id", validateListing, wrapAsync ( async (req, res) =>{
    // if(! req.body.listing ){
    //     throw new ExpressError(400, "Send valid data for listing ");
    // }
    const {id} = req.params;
    await Listing.findByIdAndUpdate( id, {...req.body.listing })
    res.redirect(`/listings/${id}`);

}))

// delete route  
app.delete("/listings/:id", wrapAsync ( async (req, res) =>{
   const {id} = req.params ;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}))

// Reviews 
//  Post Route 
app.post("/listings/:id/reviews", async (req,res) =>{
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    
    listing.reviews.push(newReview );

    await newReview.save();
    await listing.save();

   res.redirect(`/listings/${listing._id}`)
})


// app.post("listings/:id/reviews", async (req,res) => {
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);

//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();

//     console.log("New Review saved");

//     res.send("New Review saved ");
//     // res.redirect()
// });


app.get("/", (req,res) =>{
    res.send("App is working!!");
})

app.all("*", (req,res,next) =>{
    next(new ExpressError(403, "Page Not Found"));
})

// custom error handler middleware 
app.use((err,req,res,next)=>{
   let {status = 500, message = "Something went wrong!" } = err;
   res.status(status).render("error.ejs", {message});
    //   res.status(status).send(message);
})

app.listen( 8080, () =>{
    console.log("Surver is listening on port 8080");
})


