const { initializeApp, cert } = require('firebase-admin/app')
const projectId = require('../constants/project-id')
const getServiceAccount = require('../constants/service-account')

module.exports = () => {
  const options = {
    projectId,
    databaseURL: `https://${projectId}.firebaseio.com`,
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    options.credential = cert(getServiceAccount())
  } else if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured')
  }
  return initializeApp(options)
}
