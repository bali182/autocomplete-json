'use babel'

import { SchemaRoot } from './json-schema'
import { JsonSchemaProposalFactory } from './json-schema-proposal-factory'
import { loadSchema } from './json-schema-loader'

export class JsonSchemaProposalProvider {
  constructor(filePattern, schemaRoot) {
    this.filePattern = filePattern
    this.schemaRoot = schemaRoot
    this.proposalFactory = new JsonSchemaProposalFactory()
  }

  getProposals(request) {
    return Promise.resolve(this.proposalFactory.createProposals(request, this.schemaRoot))
  }

  getFilePattern() {
    return this.filePattern
  }

  static createFromProvider(schemaProvider) {
    return loadSchema(schemaProvider.getSchemaURI()).then(schema => new JsonSchemaProposalProvider(
      schemaProvider.getFilePattern(),
      new SchemaRoot(schema)
    ))
  }
}
