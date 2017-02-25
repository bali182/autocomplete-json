'use babel'

import minimatch from 'minimatch'
import axios from 'axios'
import { JsonSchemaProposalProvider } from '../../json-schema-proposal-provider'
import { SchemaRoot } from '../../json-schema'
import { CompoundProposalProvider } from './compound-provider'

export default class SchemaStoreProvider {
  constructor() {
    this.compoundProvier = new CompoundProposalProvider()
    this.blackList = {}
  }

  getSchemaInfos() {
    if (this.schemaInfos) {
      return Promise.resolve(this.schemaInfos)
    }
    return axios.get('http://schemastore.org/api/json/catalog.json')
      .then(response => response.data)
      .then(data => data.schemas.filter(schema => Boolean(schema.fileMatch)))
      .then(schemaInfos => {
        this.schemaInfos = schemaInfos
        return schemaInfos
      })
  }

  getProposals(request) {
    const file = request.editor.buffer.file
    if (this.blackList[file.getBaseName()]) {
      console.warn('schemas not available')
      return Promise.resolve([])
    }

    if (!this.compoundProvier.hasProposals(file)) {
      return this.getSchemaInfos()
        .then(schemaInfos => schemaInfos.filter(({fileMatch}) => fileMatch.some(match => minimatch(file.getBaseName(), match))))
        .then(matching => {
          const promises = matching.map(schemaInfo => axios.get(schemaInfo.url)
            .then(result => result.data)
            .then(schema => new JsonSchemaProposalProvider(
              schemaInfo.fileMatch,
              new SchemaRoot(schema)
            ))
          )
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
