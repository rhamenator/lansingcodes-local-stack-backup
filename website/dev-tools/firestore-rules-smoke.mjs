import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

const testEnv = await initializeTestEnvironment({
  projectId: 'demo-lansingcodes-rules',
  firestore: { rules: readFileSync('firestore.rules', 'utf8') }
})

try {
  await testEnv.withSecurityRulesDisabled(async context => {
    const db = context.firestore()
    for (const name of ['events', 'groups', 'sponsors', 'private']) {
      await setDoc(doc(db, name, 'sample'), { title: name })
    }
  })

  const db = testEnv.unauthenticatedContext().firestore()
  for (const name of ['events', 'groups', 'sponsors']) {
    const result = await assertSucceeds(getDocs(collection(db, name)))
    assert.equal(result.size, 1, `${name} should be publicly readable`)
    await assertSucceeds(getDoc(doc(db, name, 'sample')))
    await assertFails(setDoc(doc(db, name, 'unwanted'), { title: 'no' }))
  }
  await assertFails(getDocs(collection(db, 'private')))
  await assertFails(getDoc(doc(db, 'private', 'sample')))
  await assertFails(setDoc(doc(db, 'private', 'unwanted'), { title: 'no' }))
  console.log('Firestore rules: public collection reads allowed; all tested writes and private reads denied')
} finally {
  await testEnv.cleanup()
}
