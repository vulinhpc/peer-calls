const { version, getVersion } = require('../version.js')

describe('server/version.js', () => {

  describe('version', () => {
    it('should be a string', () => {
      expect(typeof version).toBe('string')
    })
  })

  describe('getVersion', () => {

    it('attempts to use git describe version by default', () => {
      expect(typeof getVersion()).toBe('string')
    })

    it('uses version from package.json as a fallback', () => {
      const v = require('../../../package.json').version
      expect(getVersion('a-totally-non-existing-command'))
      .toEqual(v)
    })

  })

})
