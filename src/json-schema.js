'use babel'

import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'

export const wrap = (schema, parent = null) => {
  if (!schema) {
    console.warn(`${schema} schema found`)
    return new AnySchema({}, parent)
  }

  if (!schema.allOf && !schema.anyOf && !schema.oneOf) {
    if (schema.type === 'object' || (isObject(schema.properties) && !schema.type)) {
      return new ObjectSchema(schema, parent)
    } else if (schema.type === 'array' || (isObject(schema.items) && !schema.type)) {
      return new ArraySchema(schema, parent)
    }
  }

  if (isArray(schema.oneOf)) {
    return new OneOfSchema(schema, parent)
  } else if (isArray(schema.anyOf)) {
    return new AnyOfSchema(schema, parent)
  } else if (isArray(schema.allOf)) {
    return new AllOfSchema(schema, parent)
  } else if (isObject(schema.enum)) {
    return new EnumSchema(schema, parent)
  }

  switch (schema.type) {
    case 'boolean': return new BooleanSchema(schema, parent)
    case 'number': return new NumberSchema(schema, parent)
    case 'integer': return new NumberSchema(schema, parent)
    case 'string': return new StringSchema(schema, parent)
    case 'null': return new NullSchema(schema, parent)
    default: break
  }
  console.warn(`Illegal schema part: ${JSON.stringify(schema)}`)
  return new AnySchema({}, parent)
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
      object[key] = wrap(properties[key], this)
      return object
    }, {})
    this.patternProperties = Object.keys(patternProperties)
      .map(key => [key, patternProperties[key]])
      .map(([pattern, rawSchema]) => new PatternProperty(new RegExp(pattern, 'g'), wrap(rawSchema, this)))
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
    this.itemSchema = wrap(this.schema.items, this)
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
    this.schemas = schema[keyWord].map(s => wrap(s, this))
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
