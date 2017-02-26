'use babel'

import { request, path, or } from '../../matchers'
import { StorageType } from '../../utils'

const MATCHER = or(
  request().value().path(path().key('files').index()),
  request().value().path(path().key('man').index()),
  request().value().path(path().key('man'))
)

const provider = {
  getFileExtensions() {
    return null // any file is OK
  },

  getStorageType() {
    return StorageType.BOTH
  },

  getMatcher() {
    return MATCHER
  },

  getFilePattern() {
    return 'package.json'
  }
}

export default provider
