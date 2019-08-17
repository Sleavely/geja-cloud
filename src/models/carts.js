
const {
  ENVIRONMENT = 'dev',
  PROJECT,
} = process.env

const dynamo = require('../utils/dynamoClient')

const CARTS_TABLE = `${PROJECT}-carts-${ENVIRONMENT}`

exports.getById = async (id) => {
  return dynamo
    .get({
      TableName: CARTS_TABLE,
      Key: {
        id,
      },
    })
    .then(({ Item }) => Item)
}

exports.put = async (cart) => {
  return dynamo.put({
    TableName: CARTS_TABLE,
    Item: cart,
  })
}
