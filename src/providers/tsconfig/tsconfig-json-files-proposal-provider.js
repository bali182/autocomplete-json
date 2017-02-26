'use babel'

import { request, path, or } from '../../matchers'
import { StorageType } from '../../utils'

const MATCHER = or(
  request().value().path(path().key('files').index()),
  request().value().path(path().key('exclude').index())
)

const provider = {
  getFileExtensions() {
    return ['.ts', '.tsx']
  },

  getStorageType() {
    return StorageType.BOTH
  },

  getMatcher() {
    return MATCHER
  },

  getFilePattern() {
    return 'tsconfig.json'
  }
}

export default provider
