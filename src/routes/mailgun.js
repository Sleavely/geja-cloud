const {
  MAILGUN_APIKEY,
  MAILGUN_DOMAIN,
} = process.env

const mailgun = require('mailgun-js')({ apiKey: MAILGUN_APIKEY, domain: MAILGUN_DOMAIN })

module.exports = (api) => {
  api.get('/email', async (req) => {
  // TODO: https://help.mailgun.com/hc/en-us/articles/360007512013-Can-I-migrate-my-domain-to-EU-
    const mail = {
      from: `J Bear <postmaster@${MAILGUN_DOMAIN}>`,
      to: 'Joakim Hedlund <mailgun.com@cip.nu>',
      subject: 'Hello',
      text: 'Testing some Mailgun awesomeness!',
    }
    req.log.error('Sending email', mail)
    const response = await mailgun.messages().send(mail).then(res => res)
    return response
  })
}
