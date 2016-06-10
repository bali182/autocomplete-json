"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var lodash_1 = require('lodash');
var tokenizer_1 = require('./tokenizer');
var structure_provider_1 = require('./structure-provider');
var utils_1 = require('./utils');

var RootProvider = function () {
    function RootProvider() {
        var providers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        _classCallCheck(this, RootProvider);

        this.providers = providers;
        this.selector = '.source.json';
        this.inclusionPriority = 1;
    }

    _createClass(RootProvider, [{
        key: 'getSuggestions',
        value: function getSuggestions(originalRequest) {
            var _this = this;

            var editor = originalRequest.editor;
            var bufferPosition = originalRequest.bufferPosition;
            var activatedManually = originalRequest.activatedManually;
            var prefix = originalRequest.prefix;

            if (!this.checkRequest(originalRequest)) {
                return Promise.resolve([]);
            }
            if (editor.lineTextForBufferRow(bufferPosition.row).charAt(bufferPosition.column - 1) === ',' && !activatedManually) {
                return Promise.resolve([]);
            }
            var providers = this.getMatchingProviders(editor.buffer.file);
            if (providers.length === 0) {
                return Promise.resolve([]);
            }
            return tokenizer_1.tokenize(editor.getText()).then(function (tokens) {
                return structure_provider_1.provideStructure(tokens, bufferPosition);
            }).then(function (structure) {
                var request = _this.buildRequest(structure, originalRequest);
                return Promise.all(providers.map(function (provider) {
                    return provider.getProposals(request);
                })).then(function (proposals) {
                    return Array.prototype.concat.apply([], proposals);
                });
            });
        }
    }, {
        key: 'checkRequest',
        value: function checkRequest(request) {
            var editor = request.editor;
            var bufferPosition = request.bufferPosition;

            return !!(editor && editor.buffer && editor.buffer.file && editor.buffer.file.getBaseName && editor.lineTextForBufferRow && editor.getText && bufferPosition);
        }
    }, {
        key: 'buildRequest',
        value: function buildRequest(structure, originalRequest) {
            var contents = structure.contents;
            var positionInfo = structure.positionInfo;
            var tokens = structure.tokens;
            var editor = originalRequest.editor;
            var bufferPosition = originalRequest.bufferPosition;

            var shouldAddComma = function shouldAddComma(info) {
                if (!info || !info.nextToken || !tokens || tokens.length === 0) {
                    return false;
                }
                if (info.nextToken && lodash_1.includes([tokenizer_1.TokenType.END_ARRAY, tokenizer_1.TokenType.END_OBJECT], info.nextToken.type)) {
                    return false;
                }
                return !(info.nextToken && lodash_1.includes([tokenizer_1.TokenType.END_ARRAY, tokenizer_1.TokenType.END_OBJECT], info.nextToken.type)) && info.nextToken.type !== tokenizer_1.TokenType.COMMA;
            };
            var prefix = function prefix(info) {
                if (!info || !info.editedToken) {
                    return '';
                }
                var length = bufferPosition.column - info.editedToken.col + 1;
                return lodash_1.trimLeft(info.editedToken.src.substr(0, length), '"');
            };
            return {
                contents: contents,
                prefix: prefix(positionInfo),
                segments: positionInfo ? positionInfo.segments : null,
                token: positionInfo ? positionInfo.editedToken ? positionInfo.editedToken.src : null : null,
                isKeyPosition: !!(positionInfo && positionInfo.keyPosition),
                isValuePosition: !!(positionInfo && positionInfo.valuePosition),
                isBetweenQuotes: !!(positionInfo && positionInfo.editedToken && positionInfo.editedToken.type === tokenizer_1.TokenType.STRING),
                shouldAddComma: !!shouldAddComma(positionInfo),
                isFileEmpty: tokens.length === 0,
                editor: editor
            };
        }
    }, {
        key: 'getMatchingProviders',
        value: function getMatchingProviders(file) {
            return this.providers.filter(function (p) {
                return utils_1.matches(file, p.getFilePattern());
            });
        }
    }, {
        key: 'onDidInsertSuggestion',
        value: function onDidInsertSuggestion(request) {}
    }, {
        key: 'dispose',
        value: function dispose() {}
    }]);

    return RootProvider;
}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RootProvider;