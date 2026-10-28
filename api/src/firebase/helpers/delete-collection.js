const { getFirestore } = require('firebase-admin/firestore')

module.exports = (firebaseAdmin, collection) => {
  const collectionRef = getFirestore(firebaseAdmin).collection(collection)
  return collectionRef.listDocuments().then((docs) => {
    const deletions = docs.map((doc) => doc.delete())
    return Promise.all(deletions)
  })
}
