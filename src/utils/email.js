
const Handlebars = require('handlebars')
const path = require('path')
const { readFileAsync } = require('./fs')

exports.encodeAddress = (name, email) => {
  const base64Name = Buffer.from(name).toString('base64')
  return `=?UTF-8?B?${base64Name}?= <${email}>`
}

exports.renderContactMessage = async () => {

}

exports.renderReceipt = async (templateVariables = {}) => {
  // TODO: this could be optimized by using global variables for in-memory caching
  const template = await readFileAsync(path.join(__dirname, 'emails', 'receipt.html'), { encoding: 'utf8' })
  const renderReceipt = Handlebars.compile(template)
  return renderReceipt(templateVariables)
}
