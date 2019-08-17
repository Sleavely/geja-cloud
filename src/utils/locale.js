
const dayjs = require('./dayjs')
const numeral = require('./numeral')

module.exports = exports = {
  dayjs,
  numeral,
  dateString: (constructor) => dayjs(constructor).format('YYYY-MM-DD'),
  amount: (number) => numeral(number).format('0,0[.]00'),
}
