const jwt = require('jwt-simple');
const moment = require('moment');
const config = require('./config');

exports.ensureAuthenticated = (req, res, next) => {
  if (!req.headers.authorization) {
    return res
      .status(403)
      .send({ status: false });
  }
  let payload = null;
  try {
    const token = req.headers.authorization.split(' ')[1];
    payload = jwt.decode(token, config.TOKEN_SECRET, false, 'HS256');
  } catch(e) {
    return res.status(401).send({ status: 'unauthorized' });
  }
  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ status: 'unauthorized' });
  }
  req.user = payload.sub;
  next();
};