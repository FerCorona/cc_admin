const dotenv = require('dotenv').config();

module.exports = {
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'tokenultrasecreto',
  URI_POSTGRES: process.env.URI_POSTGRES || null
};