var matchers_1 = require('../../matchers');
var lodash_1 = require('lodash');
var _a = require('packagist-package-lookup'), searchByName = _a.searchByName, versions = _a.versions;
var DEPENDENCY_PROPERTIES = ['require', 'require-dev'];
var STABLE_VERSION_REGEX = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/;
var KEY_MATCHER = matchers_1.request().key().path(matchers_1.path().key(DEPENDENCY_PROPERTIES));
var VALUE_MATCHER = matchers_1.request().value().path(matchers_1.path().key(DEPENDENCY_PROPERTIES).key());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    search: searchByName,
    versions: function (name) {
        return versions(name, { sort: 'DESC', stable: true }).then(function (versions) { return versions.map(function (v) { return lodash_1.trimLeft(v, 'v'); }); });
    },
    dependencyRequestMatcher: function () {
        return KEY_MATCHER;
    },
    versionRequestMatcher: function () {
        return VALUE_MATCHER;
    },
    getFilePattern: function () {
        return 'composer.json';
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
