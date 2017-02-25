'use babel'

import flatten from 'lodash/flatten'
import { matches } from '../../utils'

export class CompoundProposalProvider {
  constructor() {
    this.providers = []
  }

  addProvider(provider) {
    this.addProviders([provider])
  }

  addProviders(providers) {
    this.providers = this.providers.concat(providers)
  }

  hasProposals(file) {
    return this.providers.some(provider => matches(file, provider.getFilePattern()))
  }

  getProposals(request) {
    const file = request.editor.buffer.file
    return Promise.all(
      this.providers
        .filter(provider => matches(file, provider.getFilePattern()))
        .map(provider => provider.getProposals(request))
    ).then(results => flatten(results))
  }

  getFilePattern() {
    return undefined // not used
  }
}
