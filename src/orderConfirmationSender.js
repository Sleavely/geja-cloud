
const {
  ENVIRONMENT = 'dev',
} = process.env

const { encodeAddress, renderAdminOrderNotification, renderReceipt, sendMail } = require('./utils/email')
const makeLogger = require('./utils/logger')
const locale = require('./utils/locale')

exports.handler = async (event, context) => {
  const logger = makeLogger(event, context)

  // Some fuckery to unwrap the order from SNS message from Lambda-managed SQS batch
  return Promise.all(event.Records.map(async (sqsMessage) => {
    const snsNotification = JSON.parse(sqsMessage.body)
    const order = JSON.parse(snsNotification.Message)

    // Map event data to an object that corresponds to what the template expects
    const templateVariables = {
      receipt_id: order.id,
      customer: order.customer,
      address: order.address,
      purchase_date: locale.dateString(order.createdAt),
      items: order.items,
      total_price: locale.amount(order.amount / 100),
      support_url: 'https://geja.se/kontakt',
    }
    const receiptHtml = await renderReceipt(templateVariables)

    // Send it
    logger.debug('Sending receipt', { email: templateVariables })

    const receiptResponse = await sendMail({
      recipient: encodeAddress(
        `${order.customer.firstname} ${order.customer.lastname}`,
        order.customer.email
      ),
      subject: 'Orderbekräftelse',
      html: receiptHtml,
    })
    logger.debug('Sent receipt', { receiptResponse })

    // send an admin notification as well
    const adminHtml = await renderAdminOrderNotification(templateVariables)

    const adminResponse = await sendMail({
      recipient: ENVIRONMENT === 'dev'
        ? 'Joakim Hedlund <contact@joakimhedlund.com>'
        : 'GEJA Smycken <info@geja.se>',
      subject: 'Ny Beställning',
      html: adminHtml,
    })
    logger.debug('Sent admin notification', { adminResponse })

    logger.info('Sent emails for order', { orderId: order.id, toEmail: order.customer.email })
  })).catch((err) => {
    logger.error('Could not send email.', { error: err })
    throw err
  })
}
