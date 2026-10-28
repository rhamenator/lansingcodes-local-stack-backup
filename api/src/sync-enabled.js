module.exports = () =>
  !process.env.DATA_SYNC_OWNER || process.env.DATA_SYNC_OWNER === 'api'
