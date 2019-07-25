
require('dotenv').config()
const {
  API_BASE_PATH = '',
  LOG_LEVEL = 'warn',
} = process.env

// Require the framework and instantiate it
const api = require('lambda-api')({
  base: API_BASE_PATH,
  logger: {
    level: LOG_LEVEL,
    access: true,
    detail: false,
    timestamp: false,
    stack: true,
  },
})

// Add CORS headers
api.options('/*', (req, res) => {
  res.cors().send({})
})
api.use((req, res, next) => {
  res.cors()
  next()
})
api.use((err, req, res, next) => {
  res.cors()
  next()
})

api.register(require('./routes/checkout'), { prefix: '/checkout' })

api.register(require('./routes/stripe'), { prefix: '/stripe' })
api.register(require('./routes/contentful'), { prefix: '/contentful' })
api.register(require('./routes/mailgun'), { prefix: '/mailgun' })

api.get('/routes', async () => {
  return api.routes()
})

// Catch-all doesn't actually catch root when using base path,
// so we bind its listener in two routes
const catchAll = async (req, res) => {
  // Cognito or GTFO!
  if (req.auth.type === 'none') return res.sendStatus(404)

  return {
    message: 'Hello world!',
    // req: reqInfo(req),
  }
}
api.any('/', catchAll)
api.any('/*', catchAll)

module.exports = exports = api
