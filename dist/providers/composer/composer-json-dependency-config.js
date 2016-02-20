var matchers_1 = require('../../matchers');
var _a = require('packagist-package-lookup'), searchByName = _a.searchByName, versions = _a.versions;
var DEPENDENCY_PROPERTIES = ['require', 'require-dev'];
var STABLE_VERSION_REGEX = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/;
var KEY_MATCHER = matchers_1.request().key().path(matchers_1.path().key(DEPENDENCY_PROPERTIES));
var VALUE_MATCHER = matchers_1.request().value().path(matchers_1.path().key(DEPENDENCY_PROPERTIES).key());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    versions: versions,
    search: searchByName,
    dependencyRequestMatcher: function () {
        return KEY_MATCHER;
    },
    versionRequestMatcher: function () {
        return VALUE_MATCHER;
    },
    getFilePattern: function () {
        return 'composer.json';
    }
};
