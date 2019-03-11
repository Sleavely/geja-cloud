require('dotenv').config()

exports.api = require('./api')
exports.handler = require('./lambda').handler
