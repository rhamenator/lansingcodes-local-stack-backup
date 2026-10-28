import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchEventsForGroup } from './fetchEventsForGroup'
import { icalToEvents } from './icalToEvents'

test('failed group feed aborts a replacement sync', async () => {
  await assert.rejects(
    fetchEventsForGroup('group', { slug: 'group' }, async () => {
      throw new Error('Meetup unavailable')
    }),
    /Meetup unavailable/,
  )
})

test('invalid calendar aborts a replacement sync', () => {
  assert.throws(() => icalToEvents('group', 'not a calendar'))
})

test('a valid empty calendar has no events', () => {
  assert.deepEqual(icalToEvents('group', 'BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR'), {})
})
