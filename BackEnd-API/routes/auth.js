var jwt = require('express-jwt');
var secret = require('../config').secret;
//helper middleware function used to extract JWT from Authorization Header
function getTokenFromHeader(req){
     return((req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
        req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') ? 
       req.headers.authorization.split(' ')[1] : null );
  }
  
  var auth = {
    required: jwt({
      secret: secret,
      userProperty: 'payload',
      getToken: getTokenFromHeader
    }),
    optional: jwt({
      secret: secret,
      userProperty: 'payload',
      credentialsRequired: false,
      getToken: getTokenFromHeader
    })
  };
  
  module.exports = auth;