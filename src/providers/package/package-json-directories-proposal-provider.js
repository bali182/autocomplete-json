'use babel'

import { request, path } from '../../matchers'
import { StorageType } from '../../utils'

const MATCHER = request().value().path(path().key('directories').key())

const provider = {
  getFileExtensions() {
    return null
  },

  getStorageType() {
    return StorageType.FOLDER
  },

  getMatcher() {
    return MATCHER
  },

  getFilePattern() {
    return 'package.json'
  }
}

export default provider
