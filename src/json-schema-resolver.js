'use babel'

import uriJs from 'uri-js'
import isNil from 'lodash/isNil'
import isEmpty from 'lodash/isEmpty'
import assign from 'lodash/assign'
import clone from 'lodash/clone'
import isArray from 'lodash/isArray'
import values from 'lodash/values'

import { loadSchema } from './json-schema-loader'
import { schemaType, ALL_OF_TYPE, ANY_OF_TYPE, ONE_OF_TYPE, OBJECT_TYPE, ARRAY_TYPE } from './json-schema-types'

const updateSchema = node => schema => {
  // mutation, not pretty
  delete node['$ref']
  assign(node, schema)
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

  if (uri.reference === 'same-document') {
    updateSchema(node)(resolveInSameDocument(root, $ref.split('/')))
    return resolveDocument(root, node)
  }

  return loadSchema($ref)
    .then(schema => resolveInSameDocument(schema, (uri.fragment || '').split('/')))
    .then(updateSchema(node))
    .then(() => node.$ref ? resolveDocument(root, node) : null)
}

const findChildNodes = node => {
  // mutation, not pretty but has to be done somewhere
  if (isArray(node.type)) {
    const childSchemas = node.type.map(type => assign(clone(node), { type }))
    delete node['type']
    node.oneOf = childSchemas
  }

  switch (schemaType(node)) {
    case ALL_OF_TYPE: return node.allOf
    case ANY_OF_TYPE: return node.anyOf
    case ONE_OF_TYPE: return node.oneOf
    case OBJECT_TYPE: return values(node.properties || {})
    case ARRAY_TYPE: return [node.items || {}]
    default: return []
  }
}

const traverseResolve = (root, node) => {
  const resolvedNode = (node.$ref ? resolveDocument(root, node) : Promise.resolve())
  return resolvedNode.then(() => {
    const childNodes = findChildNodes(node)
    const childResolvePromises = childNodes.map(childNode => traverseResolve(root, childNode))
    return Promise.all(childResolvePromises)
  })
}

export const resolve = uri => loadSchema(uri)
  .then(root => traverseResolve(root, root).then(() => root))

