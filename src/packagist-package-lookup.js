/** @babel */

import {
  fetchJson,
  sortVersions,
  stableVersions
} from './utils'

// URL for searching packages
function getSearchByNameUrl(query) {
  return `https://packagist.org/search.json?q=${ query}`
}

// URL for looking up info about a specific package
function getPackageInfoUrl(packageName) {
  const parts = packageName.split('/')
  if (parts.length !== 2) {
    throw new Error(`Invalid package name: "${ packageName }"`)
  }
  const vendor = parts[0]
  const name = parts[1]
  return `https://packagist.org/packages/${ vendor }/${ name }.json`
}

function getSearchByVendorUrl(vendor) {
  return `https://packagist.org/packages/list.json?vendor=${ vendor}`
}

// Returns a Promise, with the {name, description} objects of the matching packages
export function searchByName(keyword) {
  return fetchJson(getSearchByNameUrl(keyword)).then(json => json.results)
}
// Returns all the available versions for the given package in reverse order (newest first)
export function versions(packageName, options = {}) {
  const stable = Boolean(options.stable)
  const sort = options.sort ? (options.sort.toString().toUpperCase() === 'ASC' ? 1 : -1) : false

  return fetchJson(getPackageInfoUrl(packageName)).then(json => {
    let vers = Object.keys(((json || {}).package || {}).versions || [])
    if (stable) {
      vers = stableVersions(vers)
    }
    if (sort) {
      vers = sortVersions(vers, sort)
    }
    return vers
  })
}

// Returns the packages by the given vendor.
export function searchByVendor(vendor) {
  return fetchJson(getSearchByVendorUrl(vendor)).then(json => ((json || {}).packageNames) || [])
}
