const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");


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

async function initDB(){
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
}

initDB()
    .then( ()=>{
        console.log("Data inserted successully");
    })
    .catch( (err) => console.log(err));
