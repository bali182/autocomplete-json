'use babel'

import uriJs from 'uri-js'
import isNil from 'lodash/isNil'
import isEmpty from 'lodash/isEmpty'
import assign from 'lodash/assign'
import clone from 'lodash/clone'
import isObject from 'lodash/isObject'
import isArray from 'lodash/isArray'
import values from 'lodash/values'

import { anySchemaLoader, loadSchema } from './json-schema-loader'

const updateSchema = node => schema => {
  // mutation, not pretty
  assign(node, schema)
  delete node['$ref']
}

const resolveInSameDocument = (schema, segments) => {
  if (isEmpty(segments)) {
    return schema
  }
  const [key, ...tail] = segments
  if (key === '#') {
    return resolveInSameDocument(schema, tail)
  }
  const subSchema = schema[key]
  return resolveInSameDocument(subSchema, tail)
}

const resolveDocument = (root, node) => {
  const { $ref } = node

  if (isNil($ref)) {
    return Promise.resolve(root)
  }

  const uri = uriJs.parse($ref)

  return uri.reference === 'same-document'
    ? Promise.resolve(updateSchema(node)(resolveInSameDocument(root, $ref.split('/'))))
    : anySchemaLoader(uri).then(updateSchema(node))
}

const findChildNodes = node => {
  // mutation, not pretty
  if (isArray(node.type)) {
    const childSchemas = node.type.map(type => assign(clone(node), { type }))
    delete node['type']
    node.oneOf = childSchemas
  }

  if (!node.allOf && !node.anyOf && !node.oneOf) {
    if (node.type === 'object' || (isObject(node.properties) && !node.type)) {
      return values(node.properties || {})
    } else if (node.type === 'array' || (isObject(node.items) && !node.type)) {
      return [node.items]
    }
  }

  if (isArray(node.oneOf)) {
    return node.oneOf
  } else if (isArray(node.anyOf)) {
    return node.anyOf
  } else if (isArray(node.allOf)) {
    return node.allOf
  }

  return []
}

const traverseResolve = (root, node) => {
  const resolvedNode = (node.$ref ? resolveDocument(root, node) : Promise.resolve())
  return resolvedNode.then(() => {
    const childNodes = findChildNodes(node)
    const childResolvePromises = childNodes.map(childNode => traverseResolve(root, childNode))
    return Promise.all(childResolvePromises)
  })
}

export const resolve = uri => {
  return loadSchema(uri)
    .then(root => traverseResolve(root, root).then(() => root))
}
