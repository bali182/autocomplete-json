'use babel'

import flatten from 'lodash/flatten'
import { resolveObject } from './utils'
import {
  ArraySchema, ObjectSchema, AnyOfSchema
} from './json-schema'

/** Base implementation for JSON schema visitor. Applies the parameter function as all non-overwritten methods. */
export class DefaultSchemaVisitor {
  constructor(defaultVisit) {
    this.defaultVisit = defaultVisit
  }
  // Complex schemas
  visitObjectSchema(schema, parameter) {
    return this.defaultVisit(schema, parameter)
  }
  visitArraySchema(schema, parameter) {
    return this.defaultVisit(schema, parameter)
  }
  visitOneOfSchema(schema, parameter) {
    return this.defaultVisit(schema, parameter)
  }
  visitAllOfSchema(schema, parameter) {
    return this.defaultVisit(schema, parameter)
  }
  visitAnyOfSchema(schema, parameter) {
    return this.defaultVisit(schema, parameter)
  }

  // Simple schemas
  visitEnumSchema(schema, parameter) {
    return this.defaultVisit(schema, parameter)
  }
  visitStringSchema(schema, parameter) {
    return this.defaultVisit(schema, parameter)
  }
  visitNumberSchema(schema, parameter) {
    return this.defaultVisit(schema, parameter)
  }
  visitBooleanSchema(schema, parameter) {
    return this.defaultVisit(schema, parameter)
  }
  visitNullSchema(schema, parameter) {
    return this.defaultVisit(schema, parameter)
  }
  visitAnySchema(schema, parameter) {
    return this.defaultVisit(schema, parameter)
  }
}

/** Visitor for finding the child schemas of any schema. */
export class SchemaInspectorVisitor extends DefaultSchemaVisitor {

  constructor() {
    super(() => [])
  }

  visitObjectSchema(schema, segment) {
    const childSchema = schema.getProperty(segment)
    if (childSchema) {
      return [childSchema]
    }
    return schema.getPatternProperties()
      .filter(p => p.getPattern().test(segment))
      .map(p => p.getSchema())
  }

  visitArraySchema(schema) {
    return [schema.getItemSchema()]
  }

  visitOneOfSchema(schema, segment) {
    return flatten(schema.getSchemas().map(s => s.accept(this, segment)))
  }

  visitAllOfSchema(schema, segment) {
    return flatten(schema.getSchemas().map(s => s.accept(this, segment)))
  }

  visitAnyOfSchema(schema, segment) {
    return flatten(schema.getSchemas().map(s => s.accept(this, segment)))
  }
}

/** Visitor for flattening nested schemas. */
export class SchemaFlattenerVisitor extends DefaultSchemaVisitor {
  constructor() {
    super((schema, parameter) => parameter.push(schema))
  }

  visitOneOfSchema(schema, collector) {
    schema.getSchemas().forEach(childSchema => childSchema.accept(this, collector))
  }

  visitAllOfSchema(schema, collector) {
    schema.getSchemas().forEach(childSchema => childSchema.accept(this, collector))
  }

  visitAnyOfSchema(schema, collector) {
    schema.getSchemas().forEach(childSchema => childSchema.accept(this, collector))
  }
}

/** Visitor for providing value snippets for the given schema. */
export class SnippetProposalVisitor extends DefaultSchemaVisitor {
  constructor() {
    super(() => SnippetProposalVisitor.DEFAULT)
  }

  comma(request) {
    return request.shouldAddComma ? ',' : ''
  }

  visitStringLike(schema, request) {
    const {isBetweenQuotes} = request
    const q = isBetweenQuotes ? '' : '"'
    return `${q}\${1:${schema.getDefaultValue() || ''}}${q}${this.comma(request)}`
  }

  visitStringSchema(schema, request) {
    return this.visitStringLike(schema, request)
  }

  visitNumberSchema(schema, request) {
    return request.isBetweenQuotes
      ? this.defaultVisit(schema, request)
      : `\${1:${schema.getDefaultValue() || '0'}}${this.comma(request)}`
  }

  visitBooleanSchema(schema, request) {
    return request.isBetweenQuotes
      ? this.defaultVisit(schema, request)
      : `\${1:${schema.getDefaultValue() || 'false'}}${this.comma(request)}`
  }

  visitNullSchema(schema, request) {
    return request.isBetweenQuotes
      ? this.defaultVisit(schema, request)
      : `\${1:null}${this.comma(request)}`
  }

  visitEnumSchema(schema, request) {
    return this.visitStringLike(schema, request)
  }

  visitArraySchema(schema, request) {
    return request.isBetweenQuotes
      ? this.defaultVisit(schema, request)
      : `[$1]${this.comma(request)}`
  }

  visitObjectSchema(schema, request) {
    return request.isBetweenQuotes
      ? this.defaultVisit(schema, request)
      : `{$1}${this.comma(request)}`
  }
}

SnippetProposalVisitor.DEFAULT = '$1'

/** Visitor for providing an array of IProposal s for any schema. */
export class ValueProposalVisitor extends DefaultSchemaVisitor {

  constructor(snippetVisitor) {
    super(() => [])
    this.snippetVisitor = snippetVisitor
  }

  createBaseProposalFor(schema) {
    return {
      description: schema.getDescription(),
      rightLabel: schema.getDisplayType(),
      type: 'value'
    }
  }

  visitObjectSchema(schema, request) {
    const proposal = this.createBaseProposalFor(schema)
    proposal.displayText = '{}'
    proposal.snippet = schema.accept(this.snippetVisitor, request)
    return [proposal]
  }

  visitArraySchema(schema, request) {
    const proposal = this.createBaseProposalFor(schema)
    proposal.displayText = '[]'
    proposal.snippet = schema.accept(this.snippetVisitor, request)
    return [proposal]
  }

  visitStringSchema(schema, request) {
    if (request.isBetweenQuotes) {
      return []
    }
    const proposal = this.createBaseProposalFor(schema)
    proposal.displayText = schema.getDefaultValue() ? `"${schema.getDefaultValue()}"` : '""'
    proposal.snippet = schema.accept(this.snippetVisitor, request)
    return [proposal]
  }

  visitNumberSchema(schema, request) {
    if (request.isBetweenQuotes) {
      return []
    }
    const proposal = this.createBaseProposalFor(schema)
    proposal.displayText = schema.getDefaultValue() ? `${schema.getDefaultValue()}` : '0'
    proposal.snippet = schema.accept(this.snippetVisitor, request)
    return [proposal]
  }

  visitBooleanSchema(schema, request) {
    if (request.isBetweenQuotes) {
      return []
    }
    return [true, false].map(bool => {
      const proposal = this.createBaseProposalFor(schema)
      proposal.displayText = bool ? 'true' : 'false'
      proposal.snippet = `${proposal.displayText}\${1}${this.snippetVisitor.comma(request)}`
      return proposal
    })
  }

  visitNullSchema(schema, request) {
    if (request.isBetweenQuotes) {
      return []
    }
    const proposal = this.createBaseProposalFor(schema)
    proposal.displayText = schema.getDefaultValue() ? `${schema.getDefaultValue()}` : 'null'
    proposal.snippet = schema.accept(this.snippetVisitor, request)
    return [proposal]
  }

  visitEnumSchema(schema, request) {
    const {segments, contents} = request
    const parent = schema.getParent()
    let possibleValues = schema.getValues()

    if ((parent instanceof ArraySchema) && parent.hasUniqueItems()) {
      const alreadyPresentValues = resolveObject(segments.slice(0, segments.length - 1), contents) || []
      possibleValues = possibleValues.filter(value => alreadyPresentValues.indexOf(value) < 0)
    }

    return possibleValues.map(enumValue => {
      const proposal = this.createBaseProposalFor(schema)
      proposal.displayText = enumValue
      if (request.isBetweenQuotes) {
        proposal.text = enumValue
      } else {
        proposal.snippet = `"${enumValue}\${1}"${this.snippetVisitor.comma(request)}`
      }
      return proposal
    })
  }

  visitCompositeSchema(schema, request) {
    return flatten(schema.getSchemas()
      .filter(s => !(s instanceof AnyOfSchema))
      .map(s => s.accept(this, request).filter(r => r.snippet !== SnippetProposalVisitor.DEFAULT))
    )
  }

  visitAllOfSchema(schema, request) {
    return this.visitCompositeSchema(schema, request)
  }

  visitAnyOfSchema(schema, request) {
    return this.visitCompositeSchema(schema, request)
  }

  visitOneOfSchema(schema, request) {
    return this.visitCompositeSchema(schema, request)
  }
}

/** Visitor for providing an array of IProposal, when editing key position */
export class KeyProposalVisitor extends DefaultSchemaVisitor {

  constructor(unwrappedContents, snippetVisitor) {
    super((() => []))
    this.unwrappedContents = unwrappedContents
    this.snippetVisitor = snippetVisitor
  }

  visitObjectSchema(schema, request) {
    const {prefix, isBetweenQuotes} = request
    return schema.getKeys()
      .filter(key => !this.unwrappedContents || (key.indexOf(prefix) >= 0 && !this.unwrappedContents.hasOwnProperty(key)))
      .map(key => {
        const valueSchema = schema.getProperty(key)
        const proposal = {}

        proposal.description = valueSchema.getDescription()
        proposal.type = 'property'
        proposal.displayText = key
        proposal.rightLabel = valueSchema.getDisplayType()
        if (isBetweenQuotes) {
          proposal.text = key
        } else {
          const value = schema.getProperty(key).accept(this.snippetVisitor, request)
          proposal.snippet = `"${key}": ${value}`
        }
        return proposal
      })
  }

  visitCompositeSchema(schema, request) {
    const proposals = schema.getSchemas()
      .filter(s => s instanceof ObjectSchema)
      .map(s => s.accept(this, request))
    return flatten(proposals)
  }

  visitAllOfSchema(schema, request) {
    return this.visitCompositeSchema(schema, request)
  }

  visitAnyOfSchema(schema, request) {
    return this.visitCompositeSchema(schema, request)
  }

  visitOneOfSchema(schema, request) {
    return this.visitCompositeSchema(schema, request)
  }
}
