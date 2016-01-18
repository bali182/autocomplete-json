var fetch = require('node-fetch');
var npmUrls = require('./npm-urls');
function fetchJson(url, options) {
    if (options === void 0) { options = undefined; }
    return fetch(url, options).then(function (response) { return response.json(); });
}
function search(keyword) {
    return fetchJson(npmUrls.getSearchUrl(keyword))
        .then(function (results) { return results.rows; })
        .then(function (rows) { return rows.map(function (row) { return row.key; }); })
        .then(function (wrappedNames) { return wrappedNames.map(function (_a) {
        var name = _a[0];
        return name;
    }); });
}
exports.search = search;
function versions(name) {
    return fetchJson(npmUrls.getPackageUrl(name))
        .then(function (p) { return p.versions; })
        .then(function (versionsObj) { return Object.keys(versionsObj); })
        .then(function (versions) { return versions.sort(function (a, b) { return b.localeCompare(a); }); });
}
exports.versions = versions;
