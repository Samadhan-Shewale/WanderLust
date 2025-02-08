const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const methodOverride  =  require("method-override"); 
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");   // custom express-error handler class
const session = require("express-session");                
const flash = require("connect-flash");             // special area of session used for storing msg
const passport = require( "passport" );
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./Router/listing.js");    // contain the methods of listings
const reviewRouter = require("./Router/review.js");      // // contain the methods of reviews
// const { connected } = require("process");
const userRouter = require("./Router/user.js");

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

const sessionOptions = {
    secret : "mysupersrcretcode",
    resave : false,
    saveUninitialized : true,
    cookie:{
        expires : Date.now() + 7 *24* 60 * 60 * 1000,
        maxAge : 7 *24* 60 * 60 * 1000,
        httpOnly : true,
    },
}

app.get("/", (req,res) =>{
    res.send("App is working!!");
})

app.use(session( sessionOptions ));
app.use( flash() );

//  passport strategy implemetation 
app.use(passport.initialize() );   // initialize the passport
app.use( passport.session() );    // every request has to know that they are part of which type of session
passport.use( new LocalStrategy( User.authenticate() ));
passport.serializeUser( User.serializeUser() );         // to serialize user into session
passport.deserializeUser( User.deserializeUser() );      // to deserialize user into session


app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/demouser", async (req,res, next) =>{
    let fakeUser = {
        email : "student@gmail.com",
        username: "demo-student",
    }
    let registedUser = await User.register( fakeUser, "pass123");
    res.send(registedUser );
})

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews",reviewRouter );
app.use("/", userRouter);



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
