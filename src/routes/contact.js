const {
  AWS_REGION = 'eu-west-1',
  CONTACTREQUESTS_TOPIC_ARN = '',
} = process.env

const AWS_SNS = require('aws-sdk/clients/sns')
const sns = new AWS_SNS({ apiVersion: '2010-03-31', region: AWS_REGION })

module.exports = (api) => {
  api.post('/contact', async (req, res) => {
    const {
      email,
      message,
    } = req.body

    const contactRequest = { senderEmail: email, message }

    req.log.info('Incoming contact request')
    req.log.debug('Complete contact request', { contactRequest })

    await sns
      .publish({
        Message: JSON.stringify(contactRequest),
        TopicArn: CONTACTREQUESTS_TOPIC_ARN,
      })
      .promise()
    req.log.debug('Published request to SNS', { contactRequest })

    return { received: true }
  })
}
