'use babel'

import { request, path, or } from '../../matchers'
import { StorageType } from '../../utils'

const MATCHER = or(
  request().value().path(path().key('autoload').key('classmap').index()),
  request().value().path(path().key('autoload').key('files').index()),
  request().value().path(path().key('autoload-dev').key('classmap').index()),
  request().value().path(path().key('autoload-dev').key('files').index()),
  request().value().path(path().key('include-path').index())
)

const provider = {
  getFileExtensions() {
    return ['.php']
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
