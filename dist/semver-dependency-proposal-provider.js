var lodash_1 = require('lodash');
function createDependencyProposal(request, dependency) {
    var isBetweenQuotes = request.isBetweenQuotes, shouldAddComma = request.shouldAddComma;
    var proposal = {};
    proposal.displayText = dependency.name;
    proposal.rightLabel = 'dependency';
    proposal.type = 'property';
    proposal.description = dependency.description;
    if (isBetweenQuotes) {
        proposal.text = dependency.name;
    }
    else {
        proposal.snippet = '"' + dependency.name + '": "$1"' + (shouldAddComma ? ',' : '');
    }
    return proposal;
}
function createVersionProposal(request, version) {
    var isBetweenQuotes = request.isBetweenQuotes, shouldAddComma = request.shouldAddComma, prefix = request.prefix;
    var proposal = {};
    proposal.displayText = version;
    proposal.rightLabel = 'version';
    proposal.type = 'value';
    proposal.replacementPrefix = lodash_1.trimLeft(prefix, '~^<>="');
    if (isBetweenQuotes) {
        proposal.text = version;
    }
    else {
        proposal.snippet = '"' + version + '"' + (shouldAddComma ? ',' : '');
    }
    return proposal;
}
var SemverDependencyProposalProvider = (function () {
    function SemverDependencyProposalProvider(config) {
        this.config = config;
    }
    SemverDependencyProposalProvider.prototype.getProposals = function (request) {
        var segments = request.segments, isKeyPosition = request.isKeyPosition, isValuePosition = request.isValuePosition;
        if (this.config.dependencyRequestMatcher().matches(request)) {
            return this.getDependencyKeysProposals(request);
        }
        if (this.config.versionRequestMatcher().matches(request)) {
            return this.getDependencyVersionsProposals(request);
        }
        return Promise.resolve([]);
    };
    SemverDependencyProposalProvider.prototype.getDependencyKeysProposals = function (request) {
        var prefix = request.prefix;
        var dependencyFilter = this.config.getDependencyFilter(request);
        return this.config.search(prefix).then(function (packages) {
            return packages.filter(function (dependency) { return dependencyFilter(dependency.name); })
                .map(function (dependency) { return createDependencyProposal(request, dependency); });
        });
    };
    SemverDependencyProposalProvider.prototype.getDependencyVersionsProposals = function (request) {
        var segments = request.segments, prefix = request.prefix;
        var packageName = segments[1], rest = segments.slice(2);
        var trimmedPrefix = lodash_1.trimLeft(prefix, '~^<>="');
        return this.config.versions(packageName.toString()).then(function (versions) {
            return versions.filter(function (version) { return lodash_1.startsWith(version, trimmedPrefix); })
                .map(function (version) { return createVersionProposal(request, version); });
        });
    };
    SemverDependencyProposalProvider.prototype.getFilePattern = function () {
        return this.config.getFilePattern();
    };
    return SemverDependencyProposalProvider;
})();
exports.SemverDependencyProposalProvider = SemverDependencyProposalProvider;
