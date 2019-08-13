const {
  AWS_REGION = 'eu-west-1',
} = process.env
const SES = require('aws-sdk/clients/ses')
const emailClient = new SES({ apiVersion: '2010-12-01', region: AWS_REGION })
const makeLogger = require('./utils/logger')
const { renderReceipt } = require('./email')

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
      purchase_date: (new Date(order.createdAt)).toLocaleDateString('sv-SE'),
      items: order.items,
      total_price: Number(order.amount / 100).toLocaleString('sv-SE'),
      support_url: 'https://geja.se/kontakt',
    }
    const htmlBody = await renderReceipt(templateVariables)

    // Send it
    const sesParams = {
      Destination: {
        ToAddresses: [
          `${order.customer.firstname} ${order.customer.lastname} <${order.customer.email}>`,
        ],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: htmlBody,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Orderbekräftelse',
        },
      },
      Source: 'GEJA Smycken <info@geja.se>',
      ReplyToAddresses: [
        'GEJA Smycken <info@geja.se>',
      ],
    }
    const emailResponse = await emailClient.sendEmail(sesParams).promise()
    logger.debug('Got response from SES sendMail()', { emailResponse })
    logger.info('Send email for order', { orderId: order.id, toEmail: order.customer.email })
  })).catch((err) => {
    logger.error('Could not send email.', { error: err })
    return Promise.reject(err)
  })
}
