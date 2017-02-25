'use babel'

import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import isNil from 'lodash/isNil'

export const ANY_TYPE = 'any'
export const OBJECT_TYPE = 'object'
export const ARRAY_TYPE = 'array'
export const ONE_OF_TYPE = 'oneOf'
export const ANY_OF_TYPE = 'anyOf'
export const ALL_OF_TYPE = 'allOf'
export const ENUM_TYPE = 'enum'
export const BOOLEAN_TYPE = 'boolean'
export const NUMBER_TYPE = 'number'
export const STRING_TYPE = 'string'
export const NULL_TYPE = 'null'

export const schemaType = schema => {
  if (isNil(schema)) {
    return ANY_TYPE
  }

  if (!schema.allOf && !schema.anyOf && !schema.oneOf) {
    if (schema.type === 'object' || (isObject(schema.properties) && !schema.type)) {
      return OBJECT_TYPE
    } else if (schema.type === 'array' || (isObject(schema.items) && !schema.type)) {
      return ARRAY_TYPE
    }
  }

  if (isArray(schema.oneOf)) {
    return ONE_OF_TYPE
  } else if (isArray(schema.anyOf)) {
    return ANY_OF_TYPE
  } else if (isArray(schema.allOf)) {
    return ALL_OF_TYPE
  } else if (isObject(schema.enum)) {
    return ENUM_TYPE
  }

  switch (schema.type) {
    case 'boolean': return BOOLEAN_TYPE
    case 'number': return NUMBER_TYPE
    case 'integer': return NUMBER_TYPE
    case 'string': return STRING_TYPE
    case 'null': return NULL_TYPE
    default: break
  }

  return ANY_TYPE
}
