const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email : {
        type : String,
        required : true,
    }
});

userSchema.plugin(passportLocalMongoose );  // autumatically implements the username, hashing, salting and password. so we don't need to implement from scratch

module.exports = mongoose.model( "User", userSchema );