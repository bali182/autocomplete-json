'use babel'

import assign from 'lodash/assign'
import trimStart from 'lodash/trimStart'

import { path, request } from '../../matchers'

import { searchByName, versions } from 'packagist-package-lookup'

const DEPENDENCY_PROPERTIES = ['require', 'require-dev']

const KEY_MATCHER = request().key().path(path().key(DEPENDENCY_PROPERTIES))
const VALUE_MATCHER = request().value().path(path().key(DEPENDENCY_PROPERTIES).key())

export default {
  search: searchByName,
  versions(name) {
    return versions(name, { sort: 'DESC', stable: true }).then(vers => vers.map(v => trimStart(v, 'v')))
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
  getDependencyFilter(req) {
    const {contents} = req
    if (!contents) {
      return () => true
    }
    const objects = DEPENDENCY_PROPERTIES.map(prop => contents[prop] || {})
    const merged = assign(...objects) || {}
    return dependency => !merged.hasOwnProperty(dependency)
  }
}
