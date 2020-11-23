/** @babel */

import minimatch from 'minimatch'

import { JsonSchemaProposalProvider } from '../../json-schema-proposal-provider'
import { CompoundProposalProvider } from './compound-provider'
import { resolve } from '../../json-schema-resolver'
import { wrap } from '../../json-schema'

export default class SchemaStoreProvider {
  constructor() {
    this.compoundProvier = new CompoundProposalProvider()
    this.blackList = {}
  }

  async getSchemaInfos() {
    if (!this.schemaInfos) {
      const response = await fetch('http://schemastore.org/api/json/catalog.json', { headers: { 'Cache-Control': 'no-cache' } })
      const data = await response.json()
      this.schemaInfos = data.schemas.filter(schema => Boolean(schema.fileMatch))
    }
    return this.schemaInfos
  }

  getProposals(request) {
    const file = request.editor.buffer.file
    if (this.blackList[file.getBaseName()]) {
      console.warn('schemas not available')
      return Promise.resolve([])
    }

    if (!this.compoundProvier.hasProposals(file)) {
      return this.getSchemaInfos()
        .then(schemaInfos => schemaInfos.filter(({ fileMatch }) => fileMatch.some(match => minimatch(file.getBaseName(), match))))
        .then(matching => {
          const promises = matching.map(schemaInfo => resolve(schemaInfo.url).then(schema => new JsonSchemaProposalProvider(
            schemaInfo.fileMatch,
            wrap(schema)
          )))
          return Promise.all(promises)
        })
        .then(providers => this.compoundProvier.addProviders(providers))
        .then(() => {
          if (!this.compoundProvier.hasProposals(file)) {
            this.blackList[file.getBaseName()] = true
          }
        })
        .then(() => this.compoundProvier.getProposals(request))
    }
    return this.compoundProvier.getProposals(request)
  }

  getFilePattern() {
    return '*'
  }
}
