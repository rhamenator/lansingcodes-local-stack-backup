const initializeFirebaseAdmin = require('./firebase/admin/initialize')
const closeFirebaseAdmin = require('./firebase/admin/close')
const reloadAllGroups = require('./firebase/groups/reload-all')
const authorizeSync = require('./authorize-sync')
const syncEnabled = require('./sync-enabled')

module.exports.handler = function (event, context, callback) {
  const rejected = authorizeSync(event)
  if (rejected) return callback(null, rejected)
  if (!syncEnabled())
    return callback(null, { statusCode: 409, body: 'API sync is disabled' })
  const firebaseAdmin = initializeFirebaseAdmin()

  reloadAllGroups(firebaseAdmin)
    .then(() => closeFirebaseAdmin(firebaseAdmin))
    .then(() => {
      callback(null, { statusCode: 200, body: 'successfully loaded groups' })
    })
    .catch((error) => {
      closeFirebaseAdmin(firebaseAdmin).then(() => callback(error))
    })
}
