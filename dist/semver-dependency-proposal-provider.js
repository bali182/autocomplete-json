"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var lodash_1 = require('lodash');
function createDependencyProposal(request, dependency) {
    var isBetweenQuotes = request.isBetweenQuotes;
    var shouldAddComma = request.shouldAddComma;

    var proposal = {};
    proposal.displayText = dependency.name;
    proposal.rightLabel = 'dependency';
    proposal.type = 'property';
    proposal.description = dependency.description;
    if (isBetweenQuotes) {
        proposal.text = dependency.name;
    } else {
        proposal.snippet = '"' + dependency.name + '": "$1"' + (shouldAddComma ? ',' : '');
    }
    return proposal;
}
function createVersionProposal(request, version) {
    var isBetweenQuotes = request.isBetweenQuotes;
    var shouldAddComma = request.shouldAddComma;
    var prefix = request.prefix;

    var proposal = {};
    proposal.displayText = version;
    proposal.rightLabel = 'version';
    proposal.type = 'value';
    proposal.replacementPrefix = lodash_1.trimLeft(prefix, '~^<>="');
    if (isBetweenQuotes) {
        proposal.text = version;
    } else {
        proposal.snippet = '"' + version + '"' + (shouldAddComma ? ',' : '');
    }
    return proposal;
}

var SemverDependencyProposalProvider = function () {
    function SemverDependencyProposalProvider(config) {
        _classCallCheck(this, SemverDependencyProposalProvider);

        this.config = config;
    }

    _createClass(SemverDependencyProposalProvider, [{
        key: 'getProposals',
        value: function getProposals(request) {
            var segments = request.segments;
            var isKeyPosition = request.isKeyPosition;
            var isValuePosition = request.isValuePosition;

            if (this.config.dependencyRequestMatcher().matches(request)) {
                return this.getDependencyKeysProposals(request);
            }
            if (this.config.versionRequestMatcher().matches(request)) {
                return this.getDependencyVersionsProposals(request);
            }
            return Promise.resolve([]);
        }
    }, {
        key: 'getDependencyKeysProposals',
        value: function getDependencyKeysProposals(request) {
            var prefix = request.prefix;

            var dependencyFilter = this.config.getDependencyFilter(request);
            return this.config.search(prefix).then(function (packages) {
                return packages.filter(function (dependency) {
                    return dependencyFilter(dependency.name);
                }).map(function (dependency) {
                    return createDependencyProposal(request, dependency);
                });
            });
        }
    }, {
        key: 'getDependencyVersionsProposals',
        value: function getDependencyVersionsProposals(request) {
            var segments = request.segments;
            var prefix = request.prefix;

            var _segments = _toArray(segments);

            var packageName = _segments[1];

            var rest = _segments.slice(2);

            var trimmedPrefix = lodash_1.trimLeft(prefix, '~^<>="');
            return this.config.versions(packageName.toString()).then(function (versions) {
                return versions.filter(function (version) {
                    return lodash_1.startsWith(version, trimmedPrefix);
                }).map(function (version) {
                    return createVersionProposal(request, version);
                });
            });
        }
    }, {
        key: 'getFilePattern',
        value: function getFilePattern() {
            return this.config.getFilePattern();
        }
    }]);

    return SemverDependencyProposalProvider;
}();

exports.SemverDependencyProposalProvider = SemverDependencyProposalProvider;