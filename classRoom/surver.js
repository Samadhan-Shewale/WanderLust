const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname , "views") );


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
    secret : "mysupersecretstring", 
    resave : false, 
    saveUninitialized : true 
}

app.use(session( sessionOptions ));
app.use( flash() );
app.use( (req,res,next ) =>{
    res.locals.success =  req.flash("success");
    res.locals.error =  req.flash("error");
    next();
});

app.get("/register", (req,res) =>{
    let {name = "anonymous"} = req.query;
    req.session.name = name;
    if( name === "anonymous"){
        req.flash("error","User not register");        
    }else{
        req.flash("success","user successfully  loged in ");
    }
    console.log(req.session.name);
    res.redirect("/hello");
});


app.get("/hello", (req,res) =>{
    res.render("page.ejs", { name : req.session.name } );
});




// app.get("/test", (req,res) =>{
//     res.send("test successful!");
// })

// app.get("/requestcount", (req,res) =>{
//     if(req.session.count){
//         req.session.count++;
//     }else{
//         req.session.count = 1;
//     }
//     res.send(`You send request ${req.session.count} times`);
// })





// app.use(cookieParser("secretcode"));

// app.get("/sendcookie", (req,res) =>{
//     res.cookie("greet", "Pranipath");
//     res.send("Send come cookie!");
// })

// app.get("/getsignedcookie", (req,res) =>{
//     res.cookie("made-in", "US", {signed : true });
//     res.send("signed cookie send");
// });

// app.get("/verify", (req,res) => {
//     console.log(req.cookies);
//     console.log(req.signedCookies);
//     res.send("verified");
// });


// app.get("/name", (req,res)=>{
//     let {name} = req.cookies;
//     res.send(`Hi ${name} welcome `);
// });


// app.get("/", (req,res) =>{{
//     console.dir(req.cookies)
//     res.send("Hi ia am root");
// }});

app.listen(3000, ()=>{
    console.log("Server is listening on port 3000");
});