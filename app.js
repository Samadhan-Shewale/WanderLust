const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const methodOverride  =  require("method-override"); 
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");   // custom express-error handler class

const listings = require("./Router/listing.js");    // contain the methods of listings
const reviews = require("./Router/review.js");      // // contain the methods of reviews


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



app.use("/listings", listings);
app.use("/listings/:id/reviews",reviews );



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

});

app.listen( 8080, () =>{
    console.log("Surver is listening on port 8080");
})
