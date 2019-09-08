
describe('module', () => {
  it('can be loaded', async () => {
    require('..')
    return true
  })
  it('throw doesnt throw', async () => {
    throw new Error('winning')
  })
})
