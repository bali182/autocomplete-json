var matchers_1 = require('../../matchers');
var lodash_1 = require('lodash');
var search = require('npm-package-lookup').search;
var PLUGINS = 'plugins';
var BABEL_PLUGIN = 'babel-plugin-';
var PRESET_MATCHER = matchers_1.request().value().path(matchers_1.path().key(PLUGINS).index());
var BabelRCPluginsProposalProvider = (function () {
    function BabelRCPluginsProposalProvider() {
    }
    BabelRCPluginsProposalProvider.prototype.getProposals = function (request) {
        var segments = request.segments, contents = request.contents, prefix = request.prefix, isBetweenQuotes = request.isBetweenQuotes, shouldAddComma = request.shouldAddComma;
        if (PRESET_MATCHER.matches(request)) {
            var plugins = contents[PLUGINS] || [];
            var results = search(this.calculateSearchKeyword(prefix));
            return results.then(function (names) {
                return names.filter(function (name) { return plugins.indexOf(name.replace(BABEL_PLUGIN, '')) < 0; }).map(function (pluginName) {
                    var name = pluginName.replace(BABEL_PLUGIN, '');
                    var proposal = {};
                    proposal.displayText = name;
                    proposal.rightLabel = 'plugin';
                    proposal.type = 'plugin';
                    proposal.description = name + " babel plugin. Required dependency in package.json: " + pluginName;
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
    BabelRCPluginsProposalProvider.prototype.calculateSearchKeyword = function (prefix) {
        if (lodash_1.startsWith(BABEL_PLUGIN, prefix)) {
            return BABEL_PLUGIN;
        }
        else if (lodash_1.startsWith(prefix, BABEL_PLUGIN)) {
            return prefix;
        }
        else {
            return BABEL_PLUGIN + prefix;
        }
    };
    BabelRCPluginsProposalProvider.prototype.getFilePattern = function () {
        return '.babelrc';
    };
    return BabelRCPluginsProposalProvider;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BabelRCPluginsProposalProvider;
