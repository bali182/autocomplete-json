'use babel'

import flatten from 'lodash/flatten'

import { KeyProposalVisitor, ValueProposalVisitor, SnippetProposalVisitor, SchemaFlattenerVisitor, SchemaInspectorVisitor } from './json-schema-visitors'
import { CompositeSchema } from './json-schema'
import { resolveObject } from './utils'

const expandedSchemas = schema => {
  if (schema instanceof CompositeSchema) {
    const schemas = []
    schema.accept(new SchemaFlattenerVisitor(), schemas)
    return schemas
  }
  return [schema]
}

const possibleTypes = (schema, segments) => {
  if (segments.length === 0) {
    return expandedSchemas(schema)
  }
  const visitor = new SchemaInspectorVisitor()
  return segments.reduce((schemas, segment) => {
    const resolvedNextSchemas = schemas.map(s => expandedSchemas(s))
    const nextSchemas = flatten(resolvedNextSchemas).map(s => s.accept(visitor, segment))
    return flatten(nextSchemas)
  }, [schema])
}


class KeyProposalFactory {
  createProposals(request, schema) {
    const { contents, segments } = request
    const unwrappedContents = resolveObject(segments, contents)
    const visitor = new KeyProposalVisitor(unwrappedContents, new SnippetProposalVisitor())
    const possibleTpes = possibleTypes(schema, segments)
    const proposals = possibleTpes.map(s => s.accept(visitor, request))
    return flatten(proposals)
  }
}

class ValueProposalFactory {
  createProposals(request, schema) {
    const { segments } = request
    const schemas = possibleTypes(schema, segments)
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

    const { isKeyPosition, isValuePosition, isFileEmpty } = request
    if (isFileEmpty) {
      return flatten(possibleTypes(schema, []).map(s => s.accept(visitor, request)))
    }
    if (isKeyPosition) {
      return this.keyProposalFactory.createProposals(request, schema)
    } else if (isValuePosition) {
      return this.valueProposalFactory.createProposals(request, schema)
    }
    return []
  }
}
