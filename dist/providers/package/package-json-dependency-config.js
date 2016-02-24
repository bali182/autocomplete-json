"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var matchers_1 = require('../../matchers');
var lodash_1 = require('lodash');

var _require = require('npm-package-lookup');

var _search = _require.search;
var _versions = _require.versions;

var DEPENDENCY_PROPERTIES = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
var KEY_MATCHER = matchers_1.request().key().path(matchers_1.path().key(DEPENDENCY_PROPERTIES));
var VALUE_MATCHER = matchers_1.request().value().path(matchers_1.path().key(DEPENDENCY_PROPERTIES).key());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    versions: function versions(name) {
        return _versions(name, { sort: 'DESC', stable: true });
    },
    search: function search(prefix) {
        return _search(prefix).then(function (results) {
            return results.map(function (name) {
                return { name: name };
            });
        });
    },
    dependencyRequestMatcher: function dependencyRequestMatcher() {
        return KEY_MATCHER;
    },
    versionRequestMatcher: function versionRequestMatcher() {
        return VALUE_MATCHER;
    },
    getFilePattern: function getFilePattern() {
        return 'package.json';
    },
    isAvailable: function isAvailable(request, dependency) {
        return false;
    },
    getDependencyFilter: function getDependencyFilter(request) {
        var contents = request.contents;

        if (!contents) {
            return function (dependency) {
                return true;
            };
        }
        var objects = DEPENDENCY_PROPERTIES.map(function (prop) {
            return contents[prop] || {};
        });
        var merged = lodash_1.assign.apply(lodash_1, _toConsumableArray(objects)) || {};
        return function (dependency) {
            return !merged.hasOwnProperty(dependency);
        };
    }
};