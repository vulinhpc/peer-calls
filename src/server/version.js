const childProcess = require('child_process')

const CMD = 'git describe --tag'

function getVersion (command = CMD) {
  try {
    return childProcess.execSync(command).toString('utf8').trim()
  } catch (err) {
    return require('../../package.json').version
  }
}

const version = getVersion()

module.exports = { version, getVersion }
