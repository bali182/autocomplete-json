var matchers_1 = require('../../matchers');
var _a = require('npm-package-lookup'), search = _a.search, versions = _a.versions;
var DEPENDENCY_PROPERTIES = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
var KEY_MATCHER = matchers_1.request().key().path(matchers_1.path().key(DEPENDENCY_PROPERTIES));
var VALUE_MATCHER = matchers_1.request().value().path(matchers_1.path().key(DEPENDENCY_PROPERTIES).key());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    versions: versions,
    search: function (prefix) {
        return search(prefix).then(function (results) { return results.map(function (name) { name; }); });
    },
    dependencyRequestMatcher: function () {
        return KEY_MATCHER;
    },
    versionRequestMatcher: function () {
        return VALUE_MATCHER;
    },
    getFilePattern: function () {
        return 'package.json';
    }
};
