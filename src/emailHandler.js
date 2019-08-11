
const makeLogger = require('./utils/logger')
const { renderReceipt } = require('./email')

exports.handler = async (event, context) => {
  const logger = makeLogger(event, context)
  logger.debug('Emailhandler was called!', { event, context })
  // TODO: import makeLogger from its-batches

  const templateVariables = {
    customer: {
      firstname: 'Jay',
      lastname: 'Alco',
    },
    purchase_date: 'YYYY-MM-DD',
    future_discounts: [],
  }

  // Map event data to an object that

  return renderReceipt({ user: templateVariables })
}
