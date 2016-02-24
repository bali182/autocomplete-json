"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var matchers_1 = require('../../matchers');
var lodash_1 = require('lodash');

var _require = require('npm-package-lookup');

var search = _require.search;

var PRESETS = 'presets';
var BABEL_PRESET = 'babel-preset-';
var PRESET_MATCHER = matchers_1.request().value().path(matchers_1.path().key(PRESETS).index());

var BabelRCPresetsProposalProvider = function () {
    function BabelRCPresetsProposalProvider() {
        _classCallCheck(this, BabelRCPresetsProposalProvider);
    }

    _createClass(BabelRCPresetsProposalProvider, [{
        key: 'getProposals',
        value: function getProposals(request) {
            var _this = this;

            var contents = request.contents;
            var prefix = request.prefix;
            var isBetweenQuotes = request.isBetweenQuotes;
            var shouldAddComma = request.shouldAddComma;

            if (PRESET_MATCHER.matches(request)) {
                var _ret = function () {
                    var presets = contents[PRESETS] || [];
                    var results = search(_this.calculateSearchKeyword(prefix));
                    return {
                        v: results.then(function (names) {
                            return names.filter(function (name) {
                                return presets.indexOf(name.replace(BABEL_PRESET, '')) < 0;
                            }).map(function (presetName) {
                                var name = presetName.replace(BABEL_PRESET, '');
                                var proposal = {};
                                proposal.displayText = name;
                                proposal.rightLabel = 'preset';
                                proposal.type = 'preset';
                                proposal.description = name + ' babel preset. Required dependency in package.json: ' + presetName;
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
            if (lodash_1.startsWith(BABEL_PRESET, prefix)) {
                return BABEL_PRESET;
            } else if (lodash_1.startsWith(prefix, BABEL_PRESET)) {
                return prefix;
            } else {
                return BABEL_PRESET + prefix;
            }
        }
    }, {
        key: 'getFilePattern',
        value: function getFilePattern() {
            return '.babelrc';
        }
    }]);

    return BabelRCPresetsProposalProvider;
}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BabelRCPresetsProposalProvider;