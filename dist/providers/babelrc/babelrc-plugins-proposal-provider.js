"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var matchers_1 = require('../../matchers');
var lodash_1 = require('lodash');

var _require = require('npm-package-lookup');

var search = _require.search;

var PLUGINS = 'plugins';
var BABEL_PLUGIN = 'babel-plugin-';
var PRESET_MATCHER = matchers_1.request().value().path(matchers_1.path().key(PLUGINS).index());

var BabelRCPluginsProposalProvider = function () {
    function BabelRCPluginsProposalProvider() {
        _classCallCheck(this, BabelRCPluginsProposalProvider);
    }

    _createClass(BabelRCPluginsProposalProvider, [{
        key: 'getProposals',
        value: function getProposals(request) {
            var _this = this;

            var segments = request.segments;
            var contents = request.contents;
            var prefix = request.prefix;
            var isBetweenQuotes = request.isBetweenQuotes;
            var shouldAddComma = request.shouldAddComma;

            if (PRESET_MATCHER.matches(request)) {
                var _ret = function () {
                    var plugins = contents[PLUGINS] || [];
                    var results = search(_this.calculateSearchKeyword(prefix));
                    return {
                        v: results.then(function (names) {
                            return names.filter(function (name) {
                                return plugins.indexOf(name.replace(BABEL_PLUGIN, '')) < 0;
                            }).map(function (pluginName) {
                                var name = pluginName.replace(BABEL_PLUGIN, '');
                                var proposal = {};
                                proposal.displayText = name;
                                proposal.rightLabel = 'plugin';
                                proposal.type = 'plugin';
                                proposal.description = name + ' babel plugin. Required dependency in package.json: ' + pluginName;
                                if (isBetweenQuotes) {
                                    proposal.text = name;
                                } else {
                                    proposal.snippet = '"' + name + '"' + (shouldAddComma ? ',' : '');
                                }
                                return proposal;
                            });
                        })
                    };
                }();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            }
            return Promise.resolve([]);
        }
    }, {
        key: 'calculateSearchKeyword',
        value: function calculateSearchKeyword(prefix) {
            if (lodash_1.startsWith(BABEL_PLUGIN, prefix)) {
                return BABEL_PLUGIN;
            } else if (lodash_1.startsWith(prefix, BABEL_PLUGIN)) {
                return prefix;
            } else {
                return BABEL_PLUGIN + prefix;
            }
        }
    }, {
        key: 'getFilePattern',
        value: function getFilePattern() {
            return '.babelrc';
        }
    }]);

    return BabelRCPluginsProposalProvider;
}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BabelRCPluginsProposalProvider;