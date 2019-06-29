const {
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY,
} = process.env

const stripe = require('stripe')(STRIPE_SECRET_KEY)

module.exports = (api) => {
  api.get('/token', async (req, res) => {
    return res.status(200).send(STRIPE_PUBLISHABLE_KEY)
  })

  api.post('/charge', async (req, res) => {
    let amount = 500

    const customer = await stripe.customers.create({
      email: req.body.stripeEmail,
      source: req.body.stripeToken,
    })
    const charge = await stripe.charges.create({
      amount,
      description: 'Sample Charge',
      currency: 'usd',
      customer: customer.id,
    })

    console.log(charge)
    return charge.status
  })
}
