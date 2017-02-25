'use babel'

import { request, path, or } from '../../matchers'
import { StorageType } from '../../utils'

const MATCHER = or(
  request().value().path(path().key('ignore').index()),
  request().value().path(path().key('ignore')),
  request().value().path(path().key('main').index()),
  request().value().path(path().key('main'))
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
    return 'bower.json'
  }
}

export default provider
