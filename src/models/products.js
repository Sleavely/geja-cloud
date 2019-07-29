
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

exports.getBySlug = async (slug) => {
  const apiData = await contentful.getEntries({
    content_type: 'product',
    'fields.slug': slug,
  })
  if (!apiData.items.length) return false
  const reduced = apiData.items.map(item => resentful.reduce([item]))
  return reduced[0]
}

exports.getAll = async () => {
  const apiData = await contentful.getEntries({ content_type: 'product' })
  const reduced = apiData.items.map(item => resentful.reduce([item]))
  return reduced
}

exports.getByCategoryPath = async (categoryPath) => {
  const { items: [category] } = await contentful.getEntries({
    content_type: 'category',
    'fields.path': categoryPath,
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
}
