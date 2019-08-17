
const {
  ENVIRONMENT = 'dev',
} = process.env

const { renderContactMessage, sendMail } = require('./utils/email')
const makeLogger = require('./utils/logger')

exports.handler = async (event, context) => {
  const logger = makeLogger(event, context)

  // Some fuckery to unwrap the order from SNS message from Lambda-managed SQS batch
  return Promise.all(event.Records.map(async (sqsMessage) => {
    const snsNotification = JSON.parse(sqsMessage.body)
    const { senderEmail, message } = JSON.parse(snsNotification.Message)

    // Map event data to an object that corresponds to what the template expects
    const templateVariables = {
      senderEmail,
      message,
    }
    const htmlBody = await renderContactMessage(templateVariables)

    // Send it
    logger.debug('Sending contact form email', { email: templateVariables })

    const emailResponse = await sendMail({
      recipient: ENVIRONMENT === 'dev'
        ? 'Joakim Hedlund <contact@joakimhedlund.com>'
        : 'GEJA Smycken <info@geja.se>',
      subject: `Meddelande från ${senderEmail}`,
      html: htmlBody,
      replyTo: senderEmail,
    })

    logger.debug('Got response from SES sendMail()', { emailResponse })
    logger.info('Sent email', { replyToAddress: senderEmail })
  })).catch((err) => {
    logger.error('Could not send email.', { error: err })
    throw err
  })
}
