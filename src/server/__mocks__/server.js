function createServer (config, app) {
  return require('http').createServer(app)
}

module.exports = { createServer }
