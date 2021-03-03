/** @babel */

import * as packagist from '../src/packagist-package-lookup'

describe('packagist-package-lookup tests', () => {
  it('should find packages by name', () => packagist.searchByName('monolog').then(result => {
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBeGreaterThan(0)
    result.forEach(element => {
      expect(typeof element.name).toBe('string')
      expect(typeof element.description).toBe('string')
      expect(typeof element.url).toBe('string')
      expect(typeof element.repository).toBe('string')
    })
  }))

  it('should find packages by vendor', () => packagist.searchByVendor('monolog').then(result => {
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBeGreaterThan(0)
    result.forEach(element => {
      expect(typeof element).toBe('string')
    })
  }))

  it('should list package versions', () => packagist.versions('monolog/monolog').then(result => {
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBeGreaterThan(0)
    result.forEach(element => {
      expect(typeof element).toBe('string')
    })
  }))
})
