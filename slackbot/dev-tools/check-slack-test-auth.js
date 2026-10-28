const expectedTeamId = 'T0CCAQ20G0P'

async function main () {
  const response = await fetch('https://slack.com/api/auth.test', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.HUBOT_SLACK_BOT_TOKEN}` }
  })
  const result = await response.json()
  if (!result.ok || result.team_id !== expectedTeamId) {
    throw new Error('The bot token does not belong to the Lansing Codes System test workspace')
  }
  console.log('Verified bot token belongs to Lansing Codes System')
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
