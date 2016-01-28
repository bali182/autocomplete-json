var matchers_1 = require('../../matchers');
var lodash_1 = require('lodash');
var search = require('npm-package-lookup').search;
var PRESETS = 'presets';
var BABEL_PRESET = 'babel-preset-';
var PRESET_MATCHER = matchers_1.request().value().path(matchers_1.path().key(PRESETS).index());
var BabelRCPresetsProposalProvider = (function () {
    function BabelRCPresetsProposalProvider() {
    }
    BabelRCPresetsProposalProvider.prototype.getProposals = function (request) {
        var contents = request.contents, prefix = request.prefix, isBetweenQuotes = request.isBetweenQuotes, shouldAddComma = request.shouldAddComma;
        if (PRESET_MATCHER.matches(request)) {
            var presets = contents[PRESETS] || [];
            var results = search(this.calculateSearchKeyword(prefix));
            return results.then(function (names) {
                return names.filter(function (name) { return presets.indexOf(name.replace(BABEL_PRESET, '')) < 0; }).map(function (presetName) {
                    var name = presetName.replace(BABEL_PRESET, '');
                    var proposal = {};
                    proposal.displayText = name;
                    proposal.rightLabel = 'preset';
                    proposal.type = 'preset';
                    proposal.description = name + " babel preset. Required dependency in package.json: " + presetName;
                    if (isBetweenQuotes) {
                        proposal.text = name;
                    }
                    else {
                        proposal.snippet = '"' + name + '"' + (shouldAddComma ? ',' : '');
                    }
                    return proposal;
                });
            });
        }
        return Promise.resolve([]);
    };
    BabelRCPresetsProposalProvider.prototype.calculateSearchKeyword = function (prefix) {
        if (lodash_1.startsWith(BABEL_PRESET, prefix)) {
            return BABEL_PRESET;
        }
        else if (lodash_1.startsWith(prefix, BABEL_PRESET)) {
            return prefix;
        }
        else {
            return BABEL_PRESET + prefix;
        }
    };
    BabelRCPresetsProposalProvider.prototype.getFilePattern = function () {
        return '.babelrc';
    };
    return BabelRCPresetsProposalProvider;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BabelRCPresetsProposalProvider;
