module.exports = () => {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured')
  }
  return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
}
