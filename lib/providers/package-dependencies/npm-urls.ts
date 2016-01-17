import * as queryString from 'query-string';

// Url for prefix searching npm repositories
export function getSearchUrl(keyword: string, limit = 40) {
  // URL shamelessly appropriated from Microsoft/vscode
  const query = {
    group_level: 1,
    limit: limit,
    start_key: `["${keyword}"]`,
    end_key: `["${keyword + 'z'}",{}]`
  };
  return `https://skimdb.npmjs.com/registry/_design/app/_view/browseAll?${queryString.stringify(query)}`;
}
  
// Url for getting information about a specific repository
export function getPackageUrl(name: string) {
  return `http://registry.npmjs.org/${name}`;
}
