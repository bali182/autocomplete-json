'use babel'

import { schemaType, ALL_OF_TYPE, ANY_OF_TYPE, ARRAY_TYPE, BOOLEAN_TYPE, ENUM_TYPE, NULL_TYPE, NUMBER_TYPE, OBJECT_TYPE, ONE_OF_TYPE, STRING_TYPE } from './json-schema-types'
import uniq from 'lodash/uniq'

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
  constructor(schema, parent) {
    this.schema = schema
    this.parent = parent
    this.description = this.schema.description
    this.defaultValue = this.schema['default']
  }
}

export class PatternProperty {
  constructor(pattern, schema) {
    this.pattern = pattern
    this.schema = schema
  }
}

export class ObjectSchema extends BaseSchema {
  constructor(schema, parent) {
    super(schema, parent)
    const properties = this.schema.properties || {}
    this.keys = Object.keys(properties)
    this.properties = this.keys.reduce((object, key) => {
      object[key] = wrap(properties[key], this)
      return object
    }, {})
    this.patternProperties = Object.keys(this.schema.patternProperties || {})
      .map(key => [key, this.schema.patternProperties[key]])
      .map(([pattern, rawSchema]) => new PatternProperty(new RegExp(pattern, 'g'), wrap(rawSchema, this)))
    this.displayType = 'object'
  }

  accept(visitor, parameter) {
    return visitor.visitObjectSchema(this, parameter)
  }
}

export class ArraySchema extends BaseSchema {
  constructor(schema, parent) {
    super(schema, parent)
    this.itemSchema = wrap(this.schema.items, this)
    this.unique = Boolean(this.schema.uniqueItems || false)
    const itemDisplayType = this.itemSchema && this.itemSchema.displayType ? this.itemSchema.displayType : 'any'
    this.displayType = uniq(itemDisplayType.split('|').map(t => `${t.trim()}[]`)).join(' | ')
  }

  accept(visitor, parameter) {
    return visitor.visitArraySchema(this, parameter)
  }
}

export class EnumSchema extends BaseSchema {
  constructor(schema, parent) {
    super(schema, parent)
    this.values = this.schema.enum
    this.displayType = 'enum'
  }

  accept(visitor, parameter) {
    return visitor.visitEnumSchema(this, parameter)
  }
}

export class CompositeSchema extends BaseSchema {
  constructor(schema, parent, keyWord) {
    super(schema, parent)
    this.schemas = schema[keyWord].map(s => wrap(s, this))
    this.defaultValue = null
    this.displayType = uniq(this.schemas.map(s => s.displayType)).join(' | ')
  }
}

export class AnyOfSchema extends CompositeSchema {
  constructor(schema, parent) {
    super(schema, parent, 'anyOf')
  }

  accept(visitor, parameter) {
    return visitor.visitAnyOfSchema(this, parameter)
  }
}

export class AllOfSchema extends CompositeSchema {
  constructor(schema, parent) {
    super(schema, parent, 'allOf')
  }

  accept(visitor, parameter) {
    return visitor.visitAllOfSchema(this, parameter)
  }
}

export class OneOfSchema extends CompositeSchema {
  constructor(schema, parent) {
    super(schema, parent, 'oneOf')
  }

  accept(visitor, parameter) {
    return visitor.visitOneOfSchema(this, parameter)
  }
}

export class NullSchema extends BaseSchema {
  constructor(schema, parent) {
    super(schema, parent)
    this.defaultValue = null
    this.displayType = 'null'
  }

  accept(visitor, parameter) {
    return visitor.visitNullSchema(this, parameter)
  }
}

export class StringSchema extends BaseSchema {
  constructor(schema, parent) {
    super(schema, parent)
    this.displayType = 'string'
    this.defaultValue = this.defaultValue || ''
  }

  accept(visitor, parameter) {
    return visitor.visitStringSchema(this, parameter)
  }
}

export class NumberSchema extends BaseSchema {
  constructor(schema, parent) {
    super(schema, parent)
    this.displayType = 'number'
    this.defaultValue = this.defaultValue || 0
  }

  accept(visitor, parameter) {
    return visitor.visitNumberSchema(this, parameter)
  }
}

export class BooleanSchema extends BaseSchema {
  constructor(schema, parent) {
    super(schema, parent)
    this.displayType = 'boolean'
    this.defaultValue = this.defaultValue || false
  }

  accept(visitor, parameter) {
    return visitor.visitBooleanSchema(this, parameter)
  }
}

export class AnySchema extends BaseSchema {
  constructor(schema, parent) {
    super(schema, parent)
    this.displayType = 'any'
    this.defaultValue = null
  }

  accept(visitor, parameter) {
    return visitor.visitAnySchema(this, parameter)
  }
}
