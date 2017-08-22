var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

router.post('/users', (req,res,next) => {
    var user = new User();

    user.username = req.body.user.username;
    user.email = req.body.user.email;
    user.setPassword(req.body.user.password);
//mongoose validation, if promise is resolved user saved successfully. returns users auth JSON
    user.save().then(()=>{
        return res.json({
            user: user.toAuthJSON()
        }).catch(next);
    })
});

router.post('/users/login', (req,res,next) =>{
    if(!req.body.user.email){
        return res.status(422).json({errors: {email: "can't be blank"}});
      }
    
      if(!req.body.user.password){
        return res.status(422).json({errors: {password: "can't be blank"}});
      }
    
      passport.authenticate('local', {session: false}, (err, user, info) => {
        if(err){ return next(err); }
    
        if(user){
          user.token = user.generateJWT();
          return res.json({user: user.toAuthJSON()});
        } else {
          return res.status(422).json(info);
        }
      })(req, res, next);
})




module.exports = router;