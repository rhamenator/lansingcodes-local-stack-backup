const syncEnabled = require('./sync-enabled')

describe('API sync ownership', () => {
  const prior = process.env.DATA_SYNC_OWNER
  afterEach(() => {
    if (prior === undefined) delete process.env.DATA_SYNC_OWNER
    else process.env.DATA_SYNC_OWNER = prior
  })

  test('preserves legacy API sync by default', () => {
    delete process.env.DATA_SYNC_OWNER
    expect(syncEnabled()).toBe(true)
  })

  test('disables API writes when website owns sync', () => {
    process.env.DATA_SYNC_OWNER = 'website'
    expect(syncEnabled()).toBe(false)
  })
})
