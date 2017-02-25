'use babel'

import fs from 'fs'
import os from 'os'
import uriJs from 'uri-js'
import axios from 'axios'
import trimStart from 'lodash/trimStart'
import memoize from 'lodash/memoize'
import omit from 'lodash/omit'

export const loadFileSchema = uri => new Promise((resolve, reject) => {
  const path = os.platform() === 'win32' ? trimStart(uri.path, '/') : uri.path
  fs.readFile(path, 'UTF-8', /* TODO think about detecting this */(error, data) => {
    if (error) {
      reject(error)
    } else {
      try {
        resolve(JSON.parse(data))
      } catch (e) {
        reject(e)
      }
    }
  })
})

export const loadHttpSchema = uri => {
  const url = uriJs.serialize(omit(uri, ['fragment']))
  return axios.get(url).then(response => response.data)
}

export const anySchemaLoader = uri => {
  switch (uri.scheme) {
    case 'file': return loadFileSchema(uri)
    case 'http': return loadHttpSchema(uri)
    default: throw new Error(`Unknown URI format ${JSON.stringify(uri)}`)
  }
}

export const loadSchema = memoize(uri => anySchemaLoader(uriJs.parse(uri)))
