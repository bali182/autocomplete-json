const fetch = require('node-fetch');
import * as npmUrls from './npm-urls';

// utility, so I don't have to call .json() on each request
function fetchJson(url: string, options: Object = undefined) {
  return fetch(url, options).then((response: any) => response.json());
}

// returns a Promise, with the {name, description} objects of the matching packages
export function search(keyword: string): Promise<Array<string>> {
  return fetchJson(npmUrls.getSearchUrl(keyword))
    .then((results: any) => results.rows)
    .then((rows: any) => rows.map((row: any) => row.key))
    .then((wrappedNames: any) => wrappedNames.map(([name]) => name));
}
// Returns all the available versions for the given package in reverse order (newest first)
export function versions(name: string): Promise<Array<string>> {
  return fetchJson(npmUrls.getPackageUrl(name))
    .then((p: any) => p.versions)
    .then((versionsObj: any) => Object.keys(versionsObj))
    .then((versions: Array<string>) => versions.sort((a: string, b: string) => b.localeCompare(a)));
}
