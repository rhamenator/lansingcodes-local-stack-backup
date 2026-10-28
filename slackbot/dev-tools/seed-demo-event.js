const path = require('node:path')
const { createRequire } = require('node:module')

if (process.env.GCLOUD_PROJECT !== 'demo-lansingcodes' ||
    !['127.0.0.1:8085', 'localhost:8085'].includes(process.env.FIRESTORE_EMULATOR_HOST)) {
  throw new Error('Demo event seeding requires the local demo-lansingcodes Firestore emulator')
}

const apiRequire = createRequire(path.resolve(__dirname, '../../api/package.json'))
const { initializeApp, deleteApp } = apiRequire('firebase-admin/app')
const { getFirestore } = apiRequire('firebase-admin/firestore')

async function main () {
  const app = initializeApp({ projectId: 'demo-lansingcodes' }, 'slack-live-demo-seed')
  try {
    await getFirestore(app).doc('events/local-slack-live-demo').set({
      group: 'devops',
      name: 'Local Slackbot demo event (not a real meetup)',
      url: 'https://example.test/local-slackbot-demo',
      startTime: Date.now() + 3 * 24 * 60 * 60 * 1000
    })
    console.log('Seeded one demo event in the Firestore emulator')
  } finally {
    await deleteApp(app)
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
