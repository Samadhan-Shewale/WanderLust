const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const app = express();
const path = require("path");
const methodOverride  =  require("method-override"); 
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");  // custom express-error handler class


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
app.post("/listings", wrapAsync (async (req,res, next)  => {
        if(! req.body.listing){
            throw new ExpressError(400, "Send valid data for listings");
        }
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
app.put("/listings/:id", wrapAsync ( async (req, res) =>{
    if(! req.body.listing ){
        throw new ExpressError(400, "Send valid data for listing ");
    }
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


