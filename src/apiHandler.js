
const api = require('./utils/api')

api.register(require('./routes/checkout'), { prefix: '/checkout' })
api.register(require('./routes/stripe'), { prefix: '/stripe' })
api.register(require('./routes/contentful'), { prefix: '/contentful' })
api.register(require('./routes/contentful'))

// Declare actual Lambda handler
exports.handler = async (event, context) => {
  // Run the request
  return api.run(event, context)
}
