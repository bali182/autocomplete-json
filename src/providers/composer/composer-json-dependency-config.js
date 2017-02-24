'use babel'

import { path, request } from '../../matchers'
import { assign, trimLeft } from 'lodash'

const {searchByName, versions} = require('packagist-package-lookup')

const DEPENDENCY_PROPERTIES = ['require', 'require-dev']
const STABLE_VERSION_REGEX = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/

const KEY_MATCHER = request().key().path(path().key(DEPENDENCY_PROPERTIES))
const VALUE_MATCHER = request().value().path(path().key(DEPENDENCY_PROPERTIES).key())

export default {
  search: searchByName,
  versions(name) {
    return versions(name, { sort: 'DESC', stable: true }).then(versions => versions.map(v => trimLeft(v, 'v')))
  },
  dependencyRequestMatcher() {
    return KEY_MATCHER
  },
  versionRequestMatcher() {
    return VALUE_MATCHER
  },
  getFilePattern() {
    return 'composer.json'
  },
  getDependencyFilter(request) {
    const {contents} = request
    if (!contents) {
      return dependency => true
    }
    const objects = DEPENDENCY_PROPERTIES.map(prop => contents[prop] || {})
    const merged = assign(...objects) || {}
    return dependency => !merged.hasOwnProperty(dependency)
  }
}
