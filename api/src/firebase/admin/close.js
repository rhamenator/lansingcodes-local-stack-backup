const { deleteApp } = require('firebase-admin/app')

module.exports = (firebaseAdmin) => deleteApp(firebaseAdmin)
