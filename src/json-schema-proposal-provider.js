'use babel'

import { JsonSchemaProposalFactory } from './json-schema-proposal-factory'
import { resolve } from './json-schema-resolver'
import { wrap } from './json-schema'

export class JsonSchemaProposalProvider {
  constructor(filePattern, schema) {
    this.filePattern = filePattern
    this.schema = schema
    this.proposalFactory = new JsonSchemaProposalFactory()
  }

  getProposals(request) {
    return Promise.resolve(this.proposalFactory.createProposals(request, this.schema))
  }

  getFilePattern() {
    return this.filePattern
  }

  static createFromProvider(schemaProvider) {
    return resolve(schemaProvider.getSchemaURI()).then(schema => new JsonSchemaProposalProvider(
      schemaProvider.getFilePattern(),
      wrap(schema)
    ))
  }
}
