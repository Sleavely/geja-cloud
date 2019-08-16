
const { encodeAddress, renderReceipt, sendMail } = require('./utils/email')
const makeLogger = require('./utils/logger')
const locale = require('./utils/locale')

exports.handler = async (event, context) => {
  const logger = makeLogger(event, context)
  logger.debug('Emailhandler was called!', { event, context })

  // Some fuckery to unwrap the order from SNS message from Lambda-managed SQS batch
  return Promise.all(event.Records.map(async (sqsMessage) => {
    const snsNotification = JSON.parse(sqsMessage.body)
    const order = JSON.parse(snsNotification.Message)

    // Map event data to an object that corresponds to what the template expects
    const templateVariables = {
      receipt_id: order.id,
      customer: order.customer,
      purchase_date: locale.dateString(order.createdAt),
      items: order.items,
      total_price: locale.amount(order.amount / 100),
      support_url: 'https://geja.se/kontakt',
    }
    const htmlBody = await renderReceipt(templateVariables)

    // Send it
    logger.debug('Sending receipt', { email: templateVariables })

    const emailResponse = await sendMail({
      recipient: encodeAddress(
        `${order.customer.firstname} ${order.customer.lastname}`,
        order.customer.email
      ),
      subject: 'Orderbekräftelse',
      html: htmlBody,
    })
    logger.debug('Got response from SES sendMail()', { emailResponse })
    logger.info('Send email for order', { orderId: order.id, toEmail: order.customer.email })
  })).catch((err) => {
    logger.error('Could not send email.', { error: err })
    throw err
  })
}
