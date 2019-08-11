require('dotenv').config()

exports.api = require('./api')
exports.apiHandler = require('./apiHandler').handler
exports.emailHandler = require('./emailHandler').handler
