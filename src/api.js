
require('dotenv').config()
const {
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_DELIVERY_API_ACCESS_TOKEN,
} = process.env

const stripe = require('stripe')(STRIPE_SECRET_KEY)

const Contentful = require('contentful')
const contentful = Contentful.createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_DELIVERY_API_ACCESS_TOKEN
})
const Resentful = require('resentful')
const resentful = new Resentful()

// Require the framework and instantiate it
const api = require('lambda-api')({ logger: true })

// Add CORS headers
api.options('/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
  res.status(200).send({})
})

api.get('/token', async (req, res) => {
  return res.status(200).send(STRIPE_PUBLISHABLE_KEY)
})

api.post('/charge', async (req, res) => {
  let amount = 500

  const customer = await stripe.customers.create({
    email: req.body.stripeEmail,
    source: req.body.stripeToken
  })
  const charge = await stripe.charges.create({
    amount,
    description: 'Sample Charge',
    currency: 'usd',
    customer: customer.id
  })

  console.log(charge)
  res.status(201).send('Great success!')
})

api.get('/categories', async (req, res) => {
  const apiData = await contentful.getEntries({ content_type: 'category' })
  const reduced = apiData.items.map(item => resentful.reduce([item]))
  return reduced
})

api.get('/products', async (req, res) => {
  const apiData = await contentful.getEntries({ content_type: 'product' })
  const reduced = apiData.items.map(item => resentful.reduce([item]))
  return reduced
})
api.get('/products/:slug', async (req) => {
  const apiData = await contentful.getEntries({
    content_type: 'product',
    'fields.slug': req.params.slug,
  })
  const reduced = resentful.reduce(apiData.items)
  return reduced
})
api.get('/entry/:entryId', async (req, res) => {
  const apiData = await contentful.getEntry(req.params.entryId)
  const reduced = resentful.reduce([apiData])
  return reduced
})

api.get('/routes', async () => {
  return api.routes()
})

// Catch-all
api.get('/*', async (req, res) => {
  return { message: 'Hello world!' }
})

module.exports = exports = api
