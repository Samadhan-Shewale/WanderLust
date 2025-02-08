const express = require("express");
const router = express.Router( );     //  { mergeParams : true } ---> merging parameters 
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

router.get("/signup", (req,res) =>{
    res.render("users/signup.ejs")
});

router.post("/signup", wrapAsync(async(req,res) =>{
    try{
        let { username, email, password } = req.body;
        let user = new User( {email, username });
        let registeredUser  = await User.register(user, password );
        console.log(registeredUser);
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
    }catch(err){
        req.flash("error", err.message );
        res.redirect("/signup");
    }

}));

router.get("/login", (req,res) =>{
    res.render("users/login.ejs");
});

router.post(
    "/login", 
    passport.authenticate("local",{failureRedirect : "/login", failureFlash : true }),
    async (req,res) =>{
        req.flash("success","Welcome back to wanderlust !");
        res.redirect("/listings");
})

module.exports = router;