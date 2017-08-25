var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

router.post('/users', (req, res, next) => {
  var user = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user.save().then(function () {
    return res.json({
      user: user.toAuthJSON()
    });
  }).catch(next);
});

router.post('/users/login', (req, res, next) => {
  if (!req.body.user.email) {
    return res.status(422).json({
      errors: {
        email: "can't be blank"
      }
    });
  }

  if (!req.body.user.password) {
    return res.status(422).json({
      errors: {
        password: "can't be blank"
      }
    });
  }

  passport.authenticate('local', {
    session: false
  }, function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (user) {
      user.token = user.generateJWT();
      return res.json({
        user: user.toAuthJSON()
      });
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
})

router.get('/user', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    return ((!user) ? res.sendStatus(401) : res.json({
      user: user.toAuthJSON()
    }))
  }).catch(next)
})

router.put('/user', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) return res.sendStatus(401);

    //make sure we only set fields on the user that were passed by the front-end
    if (typeof req.body.user.username !== 'undefined') {
      user.username = req.body.user.username;
    }
    if (typeof req.body.user.email !== 'undefined') {
      user.email = req.body.user.email;
    }
    if (typeof req.body.user.bio !== 'undefined') {
      user.bio = req.body.user.bio;
    }
    if (typeof req.body.user.image !== 'undefined') {
      user.image = req.body.user.image;
    }
    if (typeof req.body.user.password !== 'undefined') {
      user.setPassword(req.body.user.password);
    }

    return user.save().then(() => {
      return res.json({
        user: user.toAuthJSON()
      });
    });
  }).catch(next)
});

router.get('/:username', auth.optional, (req, res, next) => {
  if (req.payload) {
    User.findById(req.payload.id).then(function (user) {
      if (!user) {
        return res.json({
          profile: req.profile.toProfileJSONFor(false)
        });
      }

      return res.json({
        profile: req.profile.toProfileJSONFor(user)
      });
    });
  } else {
    return res.json({
      profile: req.profile.toProfileJSONFor(false)
    });
  }
})

module.exports = router;