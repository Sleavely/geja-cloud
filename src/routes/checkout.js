const {
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY,
} = process.env

const stripe = require('stripe')(STRIPE_SECRET_KEY)

const products = require('../models/products')

module.exports = (api) => {

  api.post('/cart', async (req, res) => {
    const {
      cartId,
      cartItems,
    } = req.body

    // Lets not trust the client to supply the actual price.
    const products = await Promise.all(cartItems.map((item) => products.getBySlug(item.sku).then(product => product && ({ inCart: item.quantity, ...product }))))
    const sumTotal = products.reduce((total, product) => {
      return total + (product.inCart * product.price * 100)
    }, 0)

    // Either update an existing intent or create a new one.
    if (req.body.paymentIntent) {
      return stripe.paymentIntents.update(req.body.paymentIntent, { amount: sumTotal }
        )
    } else {
      return stripe.paymentIntents.create({
        amount: sumTotal,
        currency: 'SEK',
        statement_descriptor: 'GEJA',
        metadata: {
          cartId,
        },
      })
    }
  })
}
