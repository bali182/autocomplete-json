'use babel'

import { assign, clone, isEmpty, isArray, isObject, memoize, flatten } from 'lodash'
import { SchemaFlattenerVisitor, SchemaInspectorVisitor } from './json-schema-visitors'

export class SchemaRoot {

  getSchema() {
    return this.schema
  }

  constructor(schemaRoot) {
    this.schemaRoot = schemaRoot
    this.resolveRef = memoize(path => {
      const segments = path.split('/')
      function resolveInternal(partialSchema, refSegments) {
        if (isEmpty(refSegments)) {
          return partialSchema
        }
        const [key, ...tail] = refSegments
        if (key === '#') {
          return resolveInternal(partialSchema, tail)
        }
        const subSchema = partialSchema[key]
        return resolveInternal(subSchema, tail)
      }
      return resolveInternal(this.schemaRoot, segments)
    })
    this.schema = this.wrap(schemaRoot, null)
  }

  wrap(schema, parent) {
    if (!schema) {
      console.warn(`${schema} schema found`)
      return new AnySchema({}, parent, this)
    }

    if (schema.$ref) {
      schema = this.resolveRef(schema.$ref)
    }

    if (isArray(schema.type)) {
      const childSchemas = schema.type.map(type => assign(clone(schema), { type }))
      schema = {
        oneOf: childSchemas
      }
    }

    if (!schema.allOf && !schema.anyOf && !schema.oneOf) {
      if (schema.type === 'object' || (isObject(schema.properties) && !schema.type)) {
        return new ObjectSchema(schema, parent, this)
      } else if (schema.type === 'array' || (isObject(schema.items) && !schema.type)) {
        return new ArraySchema(schema, parent, this)
      }
    }

    if (isArray(schema.oneOf)) {
      return new OneOfSchema(schema, parent, this)
    } else if (isArray(schema.anyOf)) {
      return new AnyOfSchema(schema, parent, this)
    } else if (isArray(schema.allOf)) {
      return new AllOfSchema(schema, parent, this)
    } else if (isObject(schema.enum)) {
      return new EnumSchema(schema, parent, this)
    }

    switch (schema.type) {
      case 'boolean': return new BooleanSchema(schema, parent, this)
      case 'number': return new NumberSchema(schema, parent, this)
      case 'integer': return new NumberSchema(schema, parent, this)
      case 'string': return new StringSchema(schema, parent, this)
      case 'null': return new NullSchema(schema, parent, this)
    }
    console.warn(`Illegal schema part: ${JSON.stringify(schema)}`)
    return new AnySchema({}, parent, this)
  }

  getPossibleTypes(segments) {
    if (segments.length === 0) {
      return this.getExpandedSchemas(this.getSchema())
    }
    const visitor = new SchemaInspectorVisitor()
    return segments.reduce((schemas, segment) => {
      const resolvedNextSchemas = schemas.map(schema => this.getExpandedSchemas(schema))
      const nextSchemas = flatten(resolvedNextSchemas).map(schema => schema.accept(visitor, segment))
      return flatten(nextSchemas)
    }, [this.getSchema()])
  }

  getExpandedSchemas(schema) {
    if (schema instanceof CompositeSchema) {
      const schemas = []
      schema.accept(new SchemaFlattenerVisitor(), schemas)
      return schemas
    }
    return [schema]
  }
}

export class BaseSchema {
  constructor(schema, parent, schemaRoot) {
    this.schema = schema
    this.parent = parent
    this.schemaRoot = schemaRoot
  }

  getParent() {
    return this.parent
  }

  getSchemaRoot() {
    return this.schemaRoot
  }

  getDescription() {
    return this.schema.description
  }
}

export class PatternProperty {
  constructor(pattern, schema) {
    this.pattern = pattern
    this.schema = schema
  }

  getPattern() {
    return this.pattern
  }

  getSchema() {
    return this.schema
  }
}

export class ObjectSchema extends BaseSchema {

  constructor(schema, parent, schemaRoot) {
    super(schema, parent, schemaRoot)
    const properties = this.schema.properties || {}
    const patternProperties = this.schema.patternProperties || {}
    this.keys = Object.keys(properties)
    this.properties = this.keys.reduce((object, key) => {
      object[key] = this.getSchemaRoot().wrap(properties[key], this)
      return object
    }, {})
    this.patternProperties = Object.keys(patternProperties)
      .map(key => [key, patternProperties[key]])
      .map(([pattern, rawSchema]) => new PatternProperty(new RegExp(pattern, 'g'), this.getSchemaRoot().wrap(rawSchema, this)))
  }
  getKeys() {
    return this.keys
  }

  getProperty(name) {
    return this.properties[name] || null
  }

  getProperties() {
    return this.properties
  }

  getPatternProperties() {
    return this.patternProperties
  }

  getDefaultValue() {
    return this.schema['default'] || null
  }

  getDisplayType() {
    return 'object'
  }

  accept(visitor, parameter) {
    return visitor.visitObjectSchema(this, parameter)
  }
}

export class ArraySchema extends BaseSchema {

  constructor(schema, parent, schemaRoot) {
    super(schema, parent, schemaRoot)
    this.itemSchema = this.getSchemaRoot().wrap(this.schema.items, this)
  }

  getItemSchema() {
    return this.itemSchema
  }

  getDefaultValue() {
    return this.schema['default'] || null
  }

  accept(visitor, parameter) {
    return visitor.visitArraySchema(this, parameter)
  }

  hasUniqueItems() {
    return Boolean(this.schema.uniqueItems || false)
  }

  getDisplayType() {
    const itemSchemaType = this.getItemSchema() && this.getItemSchema().getDisplayType()
      ? this.getItemSchema().getDisplayType()
      : 'any'
    return itemSchemaType.split('|').map(t => `${t.trim()}[]`).join(' | ')
  }
}

export class EnumSchema extends BaseSchema {
  getValues() {
    return this.schema.enum
  }

  getDefaultValue() {
    return this.schema['default'] || null
  }

  accept(visitor, parameter) {
    return visitor.visitEnumSchema(this, parameter)
  }

  getDisplayType() {
    return 'enum'
  }
}

export class CompositeSchema extends BaseSchema {
  constructor(schema, parent, schemaRoot, keyWord) {
    super(schema, parent, schemaRoot)
    this.schemas = schema[keyWord].map(schema => this.getSchemaRoot().wrap(schema, this))
  }

  getSchemas() {
    return this.schemas
  }

  getDefaultValue() {
    return null
  }

  getDisplayType() {
    return this.getSchemas().map(s => s.getDisplayType()).join(' | ')
  }
}

export class AnyOfSchema extends CompositeSchema {
  constructor(schema, parent, schemaRoot) {
    super(schema, parent, schemaRoot, 'anyOf')
  }

  accept(visitor, parameter) {
    return visitor.visitAnyOfSchema(this, parameter)
  }
}

export class AllOfSchema extends CompositeSchema {
  constructor(schema, parent, schemaRoot) {
    super(schema, parent, schemaRoot, 'allOf')
  }

  accept(visitor, parameter) {
    return visitor.visitAllOfSchema(this, parameter)
  }
}

export class OneOfSchema extends CompositeSchema {
  constructor(schema, parent, schemaRoot) {
    super(schema, parent, schemaRoot, 'oneOf')
  }

  accept(visitor, parameter) {
    return visitor.visitOneOfSchema(this, parameter)
  }
}

export class NullSchema extends BaseSchema {
  accept(visitor, parameter) {
    return visitor.visitNullSchema(this, parameter)
  }

  getDefaultValue() {
    return null
  }

  getDisplayType() {
    return 'null'
  }
}

export class StringSchema extends BaseSchema {
  accept(visitor, parameter) {
    return visitor.visitStringSchema(this, parameter)
  }

  getDefaultValue() {
    return this.schema['default'] || null
  }

  getDisplayType() {
    return 'string'
  }
}

export class NumberSchema extends BaseSchema {
  accept(visitor, parameter) {
    return visitor.visitNumberSchema(this, parameter)
  }

  getDefaultValue() {
    return this.schema['default'] || null
  }

  getDisplayType() {
    return 'number'
  }
}

export class BooleanSchema extends BaseSchema {
  accept(visitor, parameter) {
    return visitor.visitBooleanSchema(this, parameter)
  }

  getDefaultValue() {
    return this.schema['default'] || null
  }

  getDisplayType() {
    return 'boolean'
  }
}

export class AnySchema extends BaseSchema {
  accept(visitor, parameter) {
    return visitor.visitAnySchema(this, parameter)
  }

  getDefaultValue() {
    return null
  }

  getDisplayType() {
    return 'any'
  }
}
