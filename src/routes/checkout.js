const {
  AWS_REGION = 'eu-west-1',
  ORDERS_TOPIC_ARN = '',
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
} = process.env

const AWS_SNS = require('aws-sdk/clients/sns')
const sns = new AWS_SNS({ apiVersion: '2010-03-31', region: AWS_REGION })
const stripe = require('stripe')(STRIPE_SECRET_KEY)

const carts = require('../models/carts')
const orders = require('../models/orders')
const products = require('../models/products')

module.exports = (api) => {
  api.post('/cart', async (req, res) => {
    const {
      cartId,
      items: cartItems,
    } = req.body

    // Lets not trust the client to supply the actual price.
    const shippingCost = 63 * 100
    const mergedProducts = await Promise.all(cartItems.map((item) => products.getBySlug(item.sku).then(product => product && ({ inCart: item.quantity, ...product }))))
    const sumTotal = mergedProducts.reduce((total, product) => {
      return total + (product.inCart * product.price * 100)
    }, 0) + shippingCost

    // Either update an existing intent or create a new one.
    let paymentIntent
    if (cartId) {
      paymentIntent = await stripe.paymentIntents.update(cartId, { amount: sumTotal })
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: sumTotal,
        currency: 'SEK',
        statement_descriptor: 'GEJA',
      })
    }
    await carts.put({
      id: paymentIntent.id,
      items: mergedProducts,
    })
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
      event = stripe.webhooks.constructEvent(req.rawBody, signatureHeader, STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      req.log.error(err)
      return res.status(400).send(`Error: ${err.message}`)
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        // TODO: emit SNS
        req.log.debug('Payment succeeded', { paymentIntent })

        // Prepare a standardized order object to emit to service(s) that act on it.
        const normalizedOrder = await orders.normalizeFromPaymentIntent(paymentIntent)
        await sns
          .publish({
            Message: JSON.stringify(normalizedOrder),
            TopicArn: ORDERS_TOPIC_ARN,
          })
          .promise()
        req.log.debug('Published order to SNS', { normalizedOrder })
        break
      default:
        // Unexpected event type
        return res.status(400)
    }
    return { received: true }
  })
}
