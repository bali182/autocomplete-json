var queryString = require('query-string');
function getSearchUrl(keyword, limit) {
    if (limit === void 0) { limit = 40; }
    var query = {
        group_level: 1,
        limit: limit,
        start_key: "[\"" + keyword + "\"]",
        end_key: "[\"" + (keyword + 'z') + "\",{}]"
    };
    return "https://skimdb.npmjs.com/registry/_design/app/_view/browseAll?" + queryString.stringify(query);
}
exports.getSearchUrl = getSearchUrl;
function getPackageUrl(name) {
    return "http://registry.npmjs.org/" + name;
}
exports.getPackageUrl = getPackageUrl;
