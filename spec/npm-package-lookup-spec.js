/** @babel */

import * as npm from '../src/npm-package-lookup'

describe('npm-package-lookup tests', () => {
  it('should find packages by name', () => npm.search('axios').then(result => {
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBeGreaterThan(0)
    result.forEach(element => {
      expect(typeof element.name).toBe('string')
      expect(typeof element.description).toBe('string')
    })
  }))

  it('should versions of a package', () => npm.versions('axios').then(result => {
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBeGreaterThan(0)
    result.forEach(version => {
      expect(typeof version).toBe('string')
    })
  }))
})
