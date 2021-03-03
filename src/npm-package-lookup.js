/** @babel */

import {
  fetchJson,
  sortVersions,
  stableVersions
} from './utils'

const queryString = require('query-string')

// Url for prefix searching npm repositories
function getSearchUrl(keyword, limit = 50) {
  // URL shamelessly appropriated from Microsoft/vscode
  return `https://api.npms.io/v2/search/suggestions?${ queryString.stringify({
    size: limit,
    q: keyword
  })}`
}

// Url for getting information about a specific repository
function getPackageUrl(name) {
  return `https://registry.npmjs.org/${ name}`
}

// returns a Promise, with the {name, description} objects of the matching packages
export function search(keyword) {
  return fetchJson(getSearchUrl(keyword)).then(results => results.map(row => (row || {}).package).filter(Boolean))
}

// Returns all the available versions for the given package in reverse order (newest first)
export function versions(name, options = {}) {
  const stable = Boolean(options.stable)
  const sort = options.sort ? (options.sort.toString().toUpperCase() === 'ASC' ? 1 : -1) : false

  return fetchJson(getPackageUrl(name)).then(packageInfo => {
    const versionsObject = packageInfo.versions || {}
    let vers = Object.keys(versionsObject)
    if (stable) {
      vers = stableVersions(vers)
    }
    if (sort) {
      vers = sortVersions(vers, sort)
    }
    return vers
  })
}
