
const api = require('./utils/api')

api.register(require('./routes/checkout'), { prefix: '/checkout' })
api.register(require('./routes/contact'))
api.register(require('./routes/contentful'))

// Declare actual Lambda handler
exports.handler = async (event, context) => {
  // Run the request
  return api.run(event, context)
}
