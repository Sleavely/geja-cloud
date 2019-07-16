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

module.exports = (api) => {
  api.get('/categories', async (req, res) => {
    const apiData = await contentful.getEntries({ content_type: 'category' })
    const reduced = apiData.items.map(item => resentful.reduce([item]))
    return reduced
  })

  api.get('/categories/:path/products', async (req, res) => {
    const { items: [category] } = await contentful.getEntries({
      content_type: 'category',
      'fields.path': req.params.path,
    })
    const products = await contentful.getEntries({
      content_type: 'product',
      links_to_entry: category.sys.id,
    })
    const reduced = products.items.map(item => resentful.reduce([item]))
      // Scrap categories from the product response
      .map(product => {
        delete product['categories']
        return product
      })
    return reduced
  })

  api.get('/products', async (req, res) => {
    const apiData = await contentful.getEntries({ content_type: 'product' })
    const reduced = apiData.items.map(item => resentful.reduce([item]))
    return reduced
  })
  api.get('/products/:slug', async (req, res) => {
    const apiData = await contentful.getEntries({
      content_type: 'product',
      'fields.slug': req.params.slug,
    })
    if (!apiData.items.length) return res.sendStatus(404)
    const reduced = apiData.items.map(item => resentful.reduce([item]))
    return reduced[0]
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
