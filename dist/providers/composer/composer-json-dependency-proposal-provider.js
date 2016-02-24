"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var matchers_1 = require('../../matchers');
var lodash_1 = require('lodash');

var _require = require('packagist-package-lookup');

var searchByName = _require.searchByName;
var versions = _require.versions;

var DEPENDENCY_PROPERTIES = ['require', 'require-dev'];
var STABLE_VERSION_REGEX = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/;
var KEY_MATCHER = matchers_1.request().key().path(matchers_1.path().key(DEPENDENCY_PROPERTIES));
var VALUE_MATCHER = matchers_1.request().value().path(matchers_1.path().key(DEPENDENCY_PROPERTIES).key());
function createPackageNameProposal(p, request) {
    var isBetweenQuotes = request.isBetweenQuotes;
    var shouldAddComma = request.shouldAddComma;

    var proposal = {};
    proposal.displayText = p.name;
    proposal.description = p.description;
    proposal.rightLabel = 'dependency';
    proposal.type = 'property';
    if (isBetweenQuotes) {
        proposal.text = p.name;
    } else {
        proposal.snippet = '"' + p.name + '": "$1"' + (shouldAddComma ? ',' : '');
    }
    return proposal;
}
function getUsedKeys(request) {
    var contents = request.contents;

    var safeContents = contents || {};
    return lodash_1.flatten(DEPENDENCY_PROPERTIES.map(function (property) {
        return safeContents[property] || {};
    }).map(function (object) {
        return Object.keys(object);
    }));
}
function createVersionProposal(version, request) {
    var isBetweenQuotes = request.isBetweenQuotes;
    var shouldAddComma = request.shouldAddComma;
    var token = request.token;

    var proposal = {};
    proposal.displayText = version;
    proposal.rightLabel = 'version';
    proposal.type = 'value';
    proposal.replacementPrefix = lodash_1.trim(token, '"');
    if (isBetweenQuotes) {
        proposal.text = version;
    } else {
        proposal.snippet = '"' + version + '"' + (shouldAddComma ? ',' : '');
    }
    return proposal;
}
function isStableVersion(version) {
    return STABLE_VERSION_REGEX.test(version);
}

var PackageJsonDependencyProposalProvider = function () {
    function PackageJsonDependencyProposalProvider() {
        _classCallCheck(this, PackageJsonDependencyProposalProvider);
    }

    _createClass(PackageJsonDependencyProposalProvider, [{
        key: 'getProposals',
        value: function getProposals(request) {
            var segments = request.segments;
            var isKeyPosition = request.isKeyPosition;
            var isValuePosition = request.isValuePosition;

            if (KEY_MATCHER.matches(request)) {
                return this.getDependencyKeysProposals(request);
            }
            if (VALUE_MATCHER.matches(request)) {
                return this.getDependencyVersionsProposals(request);
            }
            return Promise.resolve([]);
        }
    }, {
        key: 'transformPackages',
        value: function transformPackages(packages, request) {
            var usedKeys = getUsedKeys(request);
            return packages.filter(function (p) {
                return !lodash_1.includes(usedKeys, p.name);
            }).map(function (p) {
                return createPackageNameProposal(p, request);
            });
        }
    }, {
        key: 'getDependencyKeysProposals',
        value: function getDependencyKeysProposals(request) {
            var _this = this;

            var prefix = request.prefix;

            return searchByName(prefix).then(function (packageNames) {
                return _this.transformPackages(packageNames, request);
            });
        }
    }, {
        key: 'transformPackageVersions',
        value: function transformPackageVersions(packageVersions, request) {
            var token = request.token;

            var trimmedToken = lodash_1.trim(token, '"');
            return packageVersions.filter(function (version) {
                return isStableVersion(version);
            }).filter(function (version) {
                return lodash_1.startsWith(version, trimmedToken);
            }).map(function (version) {
                return createVersionProposal(version, request);
            });
        }
    }, {
        key: 'getDependencyVersionsProposals',
        value: function getDependencyVersionsProposals(request) {
            var _this2 = this;

            var segments = request.segments;
            var token = request.token;

            var _segments = _toArray(segments);

            var packageName = _segments[1];

            var rest = _segments.slice(2);

            return versions(packageName.toString()).then(function (packageVersions) {
                return _this2.transformPackageVersions(packageVersions, request);
            });
        }
    }, {
        key: 'getFilePattern',
        value: function getFilePattern() {
            return 'composer.json';
        }
    }]);

    return PackageJsonDependencyProposalProvider;
}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PackageJsonDependencyProposalProvider;