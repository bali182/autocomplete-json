'use babel'

import fs from 'fs'
import os from 'os'
import uriJs from 'uri-js'
import axios from 'axios'
import { trimLeft } from 'lodash'

export const fileSchemaLoader = {
  normalizePath(path) {
    if (os.platform() === 'win32') {
      return trimLeft(path, '/')
    }
    return path
  },

  load(uri) {
    return new Promise((resolve, reject) => {
      fs.readFile(this.normalizePath(uri.path), 'UTF-8', /* TODO think about detecting this */(error, data) => {
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
  }
}

export const httpSchemaLoader = {
  load(uri) {
    return axios.get(uriJs.serialize(uri)).then(response => response.data)
  }
}

export const anySchemaLoader = {
  load(uri) {
    switch (uri.scheme) {
      case 'file': return fileSchemaLoader.load(uri)
      case 'http': return httpSchemaLoader.load(uri)
      default: throw new Error(`Unknown URI format ${JSON.stringify(uri)}`)
    }
  }
}

export function loadSchema(uri) {
  return anySchemaLoader.load(uriJs.parse(uri))
}
