const { timingSafeEqual } = require('node:crypto')

module.exports = (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }
  const secret = process.env.SYNC_SECRET
  if (!secret) {
    return { statusCode: 503, body: 'Sync is not configured' }
  }
  const supplied = (
    event.headers?.authorization ||
    event.headers?.Authorization ||
    ''
  ).replace(/^Bearer /i, '')
  const expected = Buffer.from(secret)
  const actual = Buffer.from(supplied)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return { statusCode: 401, body: 'Unauthorized' }
  }
  return null
}
