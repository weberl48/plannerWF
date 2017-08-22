var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy({
    usernameField: 'user[email]',
    passwordField: 'user[password'
},(email, password, done) => {
    User.findOne({email: email}).then((user) => {
       return( !user || !user.validPassword(password) ? done(null, false, {errors: {'email or password': 'is invalid'}}) :  done(null, user));
    }).catch(done);
}))

