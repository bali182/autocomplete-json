'use babel'

import { schemaType, ALL_OF_TYPE, ANY_OF_TYPE, ARRAY_TYPE, BOOLEAN_TYPE, ENUM_TYPE, NULL_TYPE, NUMBER_TYPE, OBJECT_TYPE, ONE_OF_TYPE, STRING_TYPE } from './json-schema-types'

export const wrap = (schema, parent = null) => {
  switch (schemaType(schema)) {
    case ALL_OF_TYPE: return new AllOfSchema(schema, parent)
    case ANY_OF_TYPE: return new AnyOfSchema(schema, parent)
    case ARRAY_TYPE: return new ArraySchema(schema, parent)
    case BOOLEAN_TYPE: return new BooleanSchema(schema, parent)
    case ENUM_TYPE: return new EnumSchema(schema, parent)
    case NULL_TYPE: return new NullSchema(schema, parent)
    case NUMBER_TYPE: return new NumberSchema(schema, parent)
    case OBJECT_TYPE: return new ObjectSchema(schema, parent)
    case ONE_OF_TYPE: return new OneOfSchema(schema, parent)
    case STRING_TYPE: return new StringSchema(schema, parent)
    default: return new AnySchema({}, parent)
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
