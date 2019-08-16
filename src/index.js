require('dotenv').config()

exports.api = require('./utils/api')
exports.apiHandler = require('./apiHandler').handler
exports.emailHandler = require('./orderConfirmationSender').handler
