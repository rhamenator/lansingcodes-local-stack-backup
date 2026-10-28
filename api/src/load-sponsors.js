const initializeFirebaseAdmin = require('./firebase/admin/initialize')
const closeFirebaseAdmin = require('./firebase/admin/close')
const reloadAllSponsors = require('./firebase/sponsors/reload-all')
const authorizeSync = require('./authorize-sync')
const syncEnabled = require('./sync-enabled')

module.exports.handler = function (event, context, callback) {
  const rejected = authorizeSync(event)
  if (rejected) return callback(null, rejected)
  if (!syncEnabled())
    return callback(null, { statusCode: 409, body: 'API sync is disabled' })
  const firebaseAdmin = initializeFirebaseAdmin()

  reloadAllSponsors(firebaseAdmin)
    .then(() => closeFirebaseAdmin(firebaseAdmin))
    .then(() => {
      callback(null, { statusCode: 200, body: 'successfully loaded sponsors' })
    })
    .catch((error) => {
      closeFirebaseAdmin(firebaseAdmin).then(() => callback(error))
    })
}
