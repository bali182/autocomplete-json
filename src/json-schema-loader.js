'use babel'

import fs from 'fs'
import os from 'os'
import uriJs from 'uri-js'
import axios from 'axios'
import trimStart from 'lodash/trimStart'

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

export const loadHttpSchema = uri => axios.get(uriJs.serialize(uri)).then(response => response.data)

export const anySchemaLoader = uri => {
  switch (uri.scheme) {
    case 'file': return loadFileSchema.load(uri)
    case 'http': return loadHttpSchema.load(uri)
    default: throw new Error(`Unknown URI format ${JSON.stringify(uri)}`)
  }
}

export const loadSchema = uri => anySchemaLoader.load(uriJs.parse(uri))
