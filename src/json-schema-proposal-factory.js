'use babel'

import flatten from 'lodash/flatten'
import { KeyProposalVisitor, ValueProposalVisitor, SnippetProposalVisitor } from './json-schema-visitors'
import { resolveObject } from './utils'

class KeyProposalFactory {
  createProposals(request, schema) {
    const {contents, segments} = request
    const unwrappedContents = resolveObject(segments, contents)
    const visitor = new KeyProposalVisitor(unwrappedContents, new SnippetProposalVisitor())
    const proposals = schema.getPossibleTypes(segments)
      .map(s => s.accept(visitor, request))
    return flatten(proposals)
  }
}

class ValueProposalFactory {
  createProposals(request, schema) {
    const {segments} = request
    const schemas = schema.getPossibleTypes(segments)
    const visitor = new ValueProposalVisitor(new SnippetProposalVisitor())
    return flatten(schemas.map(s => s.accept(visitor, request)))
  }
}

export class JsonSchemaProposalFactory {
  constructor() {
    this.keyProposalFactory = new KeyProposalFactory()
    this.valueProposalFactory = new ValueProposalFactory()
  }

  createProposals(request, schema) {
    const visitor = new ValueProposalVisitor(new SnippetProposalVisitor())

    const {isKeyPosition, isValuePosition, isFileEmpty} = request
    if (isFileEmpty) {
      return flatten(schema.getPossibleTypes([]).map(s => s.accept(visitor, request)))
    }
    if (isKeyPosition) {
      return this.keyProposalFactory.createProposals(request, schema)
    } else if (isValuePosition) {
      return this.valueProposalFactory.createProposals(request, schema)
    }
    return []
  }
}
