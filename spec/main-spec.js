/** @babel */

// import pakage from '../src/main'

describe('main', () => {
  beforeEach(async () => {
    atom.packages.triggerActivationHook('language-json:grammar-used')
    atom.packages.triggerDeferredActivationHooks()

    await atom.packages.activatePackage('autocomplete-json')
  })

  it('activates the package', async () => {
    expect(atom.packages.isPackageLoaded('autocomplete-json')).toBeTruthy()
  })
})
