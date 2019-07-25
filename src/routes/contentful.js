const {
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_DELIVERY_API_ACCESS_TOKEN,
} = process.env

const Contentful = require('contentful')
const contentful = Contentful.createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_DELIVERY_API_ACCESS_TOKEN,
})
const Resentful = require('resentful')
const resentful = new Resentful()

const products = require('../models/products')

module.exports = (api) => {
  api.get('/categories', async (req, res) => {
    const apiData = await contentful.getEntries({ content_type: 'category' })
    const reduced = apiData.items.map(item => resentful.reduce([item]))
    return reduced
  })

  api.get('/categories/:path/products', async (req, res) => {
    return products.getByCategoryPath(req.params.path)
  })

  api.get('/products', async (req, res) => {
    return products.getAll()
  })
  api.get('/products/:slug', async (req, res) => {
    const product = products.getBySlug(req.params.slug)

    if(!product) return res.sendStatus(404)
    return product
  })
  api.get('/entry/:entryId', async (req, res) => {
    const apiData = await contentful.getEntry(req.params.entryId).catch((err) => {
      if (err.sys && err.sys.id === 'NotFound') return undefined
      return err
    })
    if (!apiData) return res.sendStatus(404)
    const reduced = resentful.reduce([apiData])
    return reduced
  })
}
