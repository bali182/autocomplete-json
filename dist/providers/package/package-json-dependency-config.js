var matchers_1 = require('../../matchers');
var lodash_1 = require('lodash');
var _a = require('npm-package-lookup'), search = _a.search, versions = _a.versions;
var DEPENDENCY_PROPERTIES = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
var KEY_MATCHER = matchers_1.request().key().path(matchers_1.path().key(DEPENDENCY_PROPERTIES));
var VALUE_MATCHER = matchers_1.request().value().path(matchers_1.path().key(DEPENDENCY_PROPERTIES).key());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    versions: function (name) {
        return versions(name, { sort: 'DESC', stable: true });
    },
    search: function (prefix) {
        return search(prefix).then(function (results) { return results.map(function (name) { return ({ name: name }); }); });
    },
    dependencyRequestMatcher: function () {
        return KEY_MATCHER;
    },
    versionRequestMatcher: function () {
        return VALUE_MATCHER;
    },
    getFilePattern: function () {
        return 'package.json';
    },
    isAvailable: function (request, dependency) {
        return false;
    },
    getDependencyFilter: function (request) {
        var contents = request.contents;
        if (!contents) {
            return function (dependency) { return true; };
        }
        var objects = DEPENDENCY_PROPERTIES.map(function (prop) { return contents[prop] || {}; });
        var merged = lodash_1.assign.apply(void 0, objects);
        return function (dependency) { return !merged[dependency]; };
    }
};
