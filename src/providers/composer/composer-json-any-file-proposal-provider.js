'use babel'

import { request, path, or } from '../../matchers'
import { StorageType } from '../../utils'

const MATCHER = or(
  request().value().path(path().key('bin').index())
)


const provider = {
  getFileExtensions() {
    return null
  },

  getStorageType() {
    return StorageType.BOTH
  },

  getMatcher() {
    return MATCHER
  },

  getFilePattern() {
    return 'composer.json'
  }
}

export default provider
