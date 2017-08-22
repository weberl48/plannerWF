var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret; // to sign and validate JWT 
var uniqueValidator = require('mongoose-unique-validator'); //makes sure username and email are not already registerd 
//using built in mongoose validations for lowercase, required, match
var UserSchema = new mongoose.Schema({
    username: {type:String, lowercase: true, unique: true, required: [true, "can't be blank"],match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
    email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
    bio: String,
    image: String,
    hash :String,
    salt: String
},{timestamps: true}) //{timestamps: true} option creates a 'createdAt' and 'updatedAt' field

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

//using the pbkdf2 algorithm from crypto library built in with node to generate and validate hashes
UserSchema.methods.setPassword = (password) => {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};
//validating passwords against hash
UserSchema.methods.validPassword = (password) => {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
  
    return jwt.sign({
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000),
    }, secret);
};

UserSchema.methods.toAuthJSON = function()  {
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        bio: this.bio,
        image: this.image
    };
};

mongoose.model('User', UserSchema);