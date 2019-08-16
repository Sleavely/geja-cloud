const {
  AWS_REGION = 'eu-west-1',
  CONTACTREQUEST_TOPIC_ARN = '',
} = process.env

module.exports = (api) => {
  api.post('/cart', async (req, res) => {
    const {
      email,
      message,
    } = req.body

    req.log.info('Incoming contact request')
    req.log.debug('Complete contact request', { contactRequest: { email, message } })

    return { received: true }
  })
}
