const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
} = process.env

const stripe = require('stripe')(STRIPE_SECRET_KEY)

const products = require('../models/products')

module.exports = (api) => {
  api.post('/cart', async (req, res) => {
    const {
      cartId,
      items: cartItems,
    } = req.body

    // Lets not trust the client to supply the actual price.
    const mergedProducts = await Promise.all(cartItems.map((item) => products.getBySlug(item.sku).then(product => product && ({ inCart: item.quantity, ...product }))))
    const sumTotal = mergedProducts.reduce((total, product) => {
      return total + (product.inCart * product.price * 100)
    }, 0)

    // Either update an existing intent or create a new one.
    let paymentIntent
    if (req.body.paymentIntent) {
      paymentIntent = await stripe.paymentIntents.update(req.body.paymentIntent, { amount: sumTotal })
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: sumTotal,
        currency: 'SEK',
        statement_descriptor: 'GEJA',
        metadata: {
          cartId,
        },
      })
    }
    return {
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
      },
    }
  })

  api.post('/webhook', async (req, res) => {
    let event = req.body
    req.log.debug('Webhook received', { webhook: event })

    // Verify the signature originated at Stripe before proceeding.
    try {
      const signatureHeader = req.headers['stripe-signature']
      event = stripe.webhooks.constructEvent(req.body, signatureHeader, STRIPE_WEBHOOK_SECRET)
    }
    catch (err) {
      req.log.error(err)
      return res.status(400).send(`Error: ${err.message}`)
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        // TODO: emit SNS
        break
      default:
        // Unexpected event type
        return res.status(400)
    }
    return { received: true }
  })
}
