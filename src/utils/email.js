const {
  AWS_REGION = 'eu-west-1',
} = process.env
const SES = require('aws-sdk/clients/ses')
const emailClient = new SES({ apiVersion: '2010-12-01', region: AWS_REGION })
const handlebars = require('handlebars')
const path = require('path')
const { readFileAsync } = require('./fs')

exports.encodeAddress = (name, email) => {
  const base64Name = Buffer.from(name).toString('base64')
  return `=?UTF-8?B?${base64Name}?= <${email}>`
}

exports.renderContactMessage = async (templateVariables = {}) => {
  const template = await readFileAsync(path.join(__dirname, 'emails', 'contactmessage.html'), { encoding: 'utf8' })
  const renderContactMessage = handlebars.compile(template)
  return renderContactMessage(templateVariables)
}

exports.renderReceipt = async (templateVariables = {}) => {
  // TODO: this could be optimized by using global variables for in-memory caching
  const template = await readFileAsync(path.join(__dirname, 'emails', 'receipt.html'), { encoding: 'utf8' })
  // TODO: this could be optimized by, you know, using the handlebars implementation built-in to SES
  const renderReceipt = handlebars.compile(template)
  return renderReceipt(templateVariables)
}

exports.sendMail = async ({ recipient, replyTo = undefined, subject, html }) => {
  const sesParams = {
    Destination: {
      ToAddresses: [
        recipient,
      ],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: 'GEJA Smycken <info@geja.se>',
    ReplyToAddresses: [
      'GEJA Smycken <info@geja.se>',
    ],
  }

  if (replyTo) {
    sesParams.ReplyToAddresses = [
      replyTo,
    ]
  }

  return emailClient.sendEmail(sesParams).promise()
}
