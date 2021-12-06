const jwt = require('jwt-simple');
const moment = require('moment');
const config = require('./config');

exports.ensureAuthenticated = (req, res, next) => {
  if (!req.headers.authorization) {
    return res
      .status(403)
      .send({ isAuth: false });
  }

  var token = req.headers.authorization.split(' ')[1];
  var payload = jwt.decode(token, config.TOKEN_SECRET, false, 'HS256');

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ isAuth: false });
  }

  req.user = payload.sub;
  next();
};