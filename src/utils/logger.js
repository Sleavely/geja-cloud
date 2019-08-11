const api = require('./api')

/**
 * Reverse engineeering the lambda-api module to work in a non-HTTP setting.
 *
 * Creates a logger instance with the methods
 * trace(), debug(), info(), warn(), error(), fatal()
 */
const makeLogger = (event, context) => {
  const logger = api._logger
  const fakeReq = {
    id: context.awsRequestId,
    _start: Date.now(),
    coldStart: api._requestCount === 0,
    requestCount: ++api._requestCount
  }
  const fakeRes = {}

  Object.keys(api._logLevels).forEach((level) => {
    logger[level] = (msg, custom) => {
      if (api._logLevels[level] >= api._logLevels[logger.level]) {
        const logEntry = Object.assign(
          {},
          logger.log(level, msg, fakeReq, context, custom),
          {
            coldStart: fakeReq.coldStart,
            count: fakeReq.requestCount,
          },
        )

        console.log(JSON.stringify(logger.detail ? logger.format(logEntry, fakeReq, fakeRes) : logEntry))
        return logEntry
      }
      return undefined
    }
  })

  return logger
}


module.exports = exports = makeLogger
