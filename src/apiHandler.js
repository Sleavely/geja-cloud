
const api = require('./utils/api')

// Declare your Lambda handler
exports.handler = async (event, context) => {
  // Run the request
  return api.run(event, context)
}
