var lodash_1 = require('lodash');
var npm_service_1 = require('./npm-service');
var DEPENDENCY_PROPERTIES = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
var STABLE_VERSION_REGEX = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/;
var EMPTY_OBJECT = {};
function createPackageNameProposal(key, request) {
    var isBetweenQuotes = request.isBetweenQuotes, shouldAddComma = request.shouldAddComma;
    var proposal = {};
    proposal.displayText = key;
    proposal.rightLabel = 'dependency';
    proposal.type = 'property';
    if (isBetweenQuotes) {
        proposal.text = key;
    }
    else {
        proposal.snippet = '"' + key + '": "$1"' + (shouldAddComma ? ',' : '');
    }
    proposal.iconHTML = '<i class="icon-package"></i>';
    return proposal;
}
function getUsedKeys(request) {
    var contents = request.contents;
    var safeContents = contents || EMPTY_OBJECT;
    return lodash_1.flatten(DEPENDENCY_PROPERTIES
        .map(function (property) { return safeContents[property] || EMPTY_OBJECT; })
        .map(function (object) { return Object.keys(object); }));
}
function createVersionProposal(version, request) {
    var isBetweenQuotes = request.isBetweenQuotes, shouldAddComma = request.shouldAddComma, token = request.token;
    var proposal = {};
    proposal.displayText = version;
    proposal.rightLabel = 'version';
    proposal.type = 'value';
    proposal.replacementPrefix = lodash_1.trim(token, '"');
    if (isBetweenQuotes) {
        proposal.text = version;
    }
    else {
        proposal.snippet = '"' + version + '"' + (shouldAddComma ? ',' : '');
    }
    proposal.iconHTML = '<i class="icon-version"></i>';
    return proposal;
}
function isStableVersion(version) {
    return STABLE_VERSION_REGEX.test(version);
}
var PackageJsonDependencyProposalProvider = (function () {
    function PackageJsonDependencyProposalProvider() {
    }
    PackageJsonDependencyProposalProvider.prototype.getProposals = function (request) {
        var segments = request.segments, isKeyPosition = request.isKeyPosition, isValuePosition = request.isValuePosition;
        if (segments && segments.length === 1 && isKeyPosition) {
            var key = segments[0];
            if (lodash_1.includes(DEPENDENCY_PROPERTIES, key)) {
                return this.getDependencyKeysProposals(request);
            }
        }
        if (segments && segments.length === 2 && isValuePosition) {
            var firstKey = segments[0], secondKey = segments[1];
            if (lodash_1.includes(DEPENDENCY_PROPERTIES, firstKey) && lodash_1.isString(secondKey)) {
                return this.getDependencyVersionsProposals(request);
            }
        }
        return Promise.resolve([]);
    };
    PackageJsonDependencyProposalProvider.prototype.transformPackageNames = function (packageNames, request) {
        var usedKeys = getUsedKeys(request);
        return packageNames
            .filter(function (name) { return !lodash_1.includes(usedKeys, name); })
            .map(function (name) { return createPackageNameProposal(name, request); });
    };
    PackageJsonDependencyProposalProvider.prototype.getDependencyKeysProposals = function (request) {
        var _this = this;
        var prefix = request.prefix;
        return npm_service_1.search(prefix).then(function (packageNames) { return _this.transformPackageNames(packageNames, request); });
    };
    PackageJsonDependencyProposalProvider.prototype.transformPackageVersions = function (packageVersions, request) {
        var token = request.token;
        var trimmedToken = lodash_1.trim(token, '"');
        return packageVersions
            .filter(function (version) { return isStableVersion(version); })
            .filter(function (version) { return lodash_1.startsWith(version, trimmedToken); })
            .map(function (version) { return createVersionProposal(version, request); });
    };
    PackageJsonDependencyProposalProvider.prototype.getDependencyVersionsProposals = function (request) {
        var _this = this;
        var segments = request.segments, token = request.token;
        var packageName = segments[1], rest = segments.slice(2);
        return npm_service_1.versions(packageName.toString())
            .then(function (packageVersions) { return _this.transformPackageVersions(packageVersions, request); });
    };
    PackageJsonDependencyProposalProvider.prototype.getFilePattern = function () {
        return 'package.json';
    };
    return PackageJsonDependencyProposalProvider;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PackageJsonDependencyProposalProvider;
