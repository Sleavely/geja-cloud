
const carts = require('./carts')

exports.normalizeFromPaymentIntent = async (paymentIntent) => {
  const cart = await carts.getById(paymentIntent.id)

  // The first entry is the latest
  const paidAt = Math.floor(paymentIntent.charges.data[0].created * 1000)

  const normalized = {
    id: paymentIntent.id.substring(3),
    createdAt: paidAt,
    customer: {
      // temporarily splits full name when firstname not available:
      // https://github.com/Sleavely/geja-cloud/issues/4
      firstname: paymentIntent.metadata.customer_firstname || paymentIntent.shipping.name.split(' ')[0],
      lastname: paymentIntent.metadata.customer_lastname || paymentIntent.shipping.name.split(' ').slice(1).join(' '),
      email: paymentIntent.receipt_email,
      phone: paymentIntent.shipping.phone,
    },
    address: {
      street: paymentIntent.shipping.address.line1,
      zipcode: paymentIntent.shipping.address.postal_code,
      city: paymentIntent.shipping.address.city,
      country: paymentIntent.shipping.address.country,
    },
    items: cart.items,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  }
  return normalized
}
