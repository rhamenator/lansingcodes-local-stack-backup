const authorizeSync = require('./authorize-sync')

describe('sync authorization', () => {
  const prior = process.env.SYNC_SECRET
  afterEach(() => {
    if (prior === undefined) delete process.env.SYNC_SECRET
    else process.env.SYNC_SECRET = prior
  })

  test('rejects unsafe methods and unconfigured sync', () => {
    delete process.env.SYNC_SECRET
    expect(authorizeSync({ httpMethod: 'GET' }).statusCode).toBe(405)
    expect(authorizeSync({ httpMethod: 'POST' }).statusCode).toBe(503)
  })

  test('requires the configured bearer secret', () => {
    process.env.SYNC_SECRET = 'test-secret'
    expect(authorizeSync({ httpMethod: 'POST', headers: {} }).statusCode).toBe(
      401,
    )
    expect(
      authorizeSync({
        httpMethod: 'POST',
        headers: { authorization: 'Bearer wrong' },
      }).statusCode,
    ).toBe(401)
    expect(
      authorizeSync({
        httpMethod: 'POST',
        headers: { authorization: 'Bearer test-secret' },
      }),
    ).toBeNull()
  })
})
