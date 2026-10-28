const { getFirestore } = require('firebase-admin/firestore')

module.exports = (firebaseAdmin, collection, data) => {
  const ref = getFirestore(firebaseAdmin).collection(collection)
  const promises = Object.keys(data).map((key) => ref.doc(key).set(data[key]))
  return Promise.all(promises)
}
