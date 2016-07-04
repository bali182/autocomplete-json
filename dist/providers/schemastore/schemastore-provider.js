"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var minimatch = require('minimatch');
var json_schema_proposal_provider_1 = require('../../json-schema-proposal-provider');
var json_schema_1 = require('../../json-schema');
var compound_provider_1 = require('./compound-provider');
var utils_1 = require('./../../utils');

var SchemaStoreProvider = function () {
    function SchemaStoreProvider() {
        _classCallCheck(this, SchemaStoreProvider);

        this.compoundProvier = new compound_provider_1.CompoundProposalProvider();
        this.blackList = {};
    }

    _createClass(SchemaStoreProvider, [{
        key: 'getSchemaInfos',
        value: function getSchemaInfos() {
            var _this = this;

            if (this.schemaInfos) {
                return Promise.resolve(this.schemaInfos);
            }
            return utils_1.fetch('http://schemastore.org/api/json/catalog.json').then(function (response) {
                return response.json();
            }).then(function (data) {
                return data.schemas.filter(function (schema) {
                    return !!schema.fileMatch;
                });
            }).then(function (schemaInfos) {
                _this.schemaInfos = schemaInfos;
                return schemaInfos;
            });
        }
    }, {
        key: 'getProposals',
        value: function getProposals(request) {
            var _this2 = this;

            var file = request.editor.buffer.file;
            if (this.blackList[file.getBaseName()]) {
                console.warn('schemas not available');
                return Promise.resolve([]);
            }
            if (!this.compoundProvier.hasProposals(file)) {
                return this.getSchemaInfos().then(function (schemaInfos) {
                    return schemaInfos.filter(function (_ref) {
                        var fileMatch = _ref.fileMatch;
                        return fileMatch.some(function (match) {
                            return minimatch(file.getBaseName(), match);
                        });
                    });
                }).then(function (matching) {
                    return Promise.all(matching.map(function (schemaInfo) {
                        return utils_1.fetch(schemaInfo.url).then(function (result) {
                            return result.json().then(function (schema) {
                                return new json_schema_proposal_provider_1.JsonSchemaProposalProvider(schemaInfo.fileMatch, new json_schema_1.SchemaRoot(schema));
                            });
                        });
                    }));
                }).then(function (providers) {
                    return _this2.compoundProvier.addProviders(providers);
                }).then(function (_) {
                    if (!_this2.compoundProvier.hasProposals(file)) {
                        _this2.blackList[file.getBaseName()] = true;
                    }
                }).then(function (_) {
                    return _this2.compoundProvier.getProposals(request);
                });
            }
            return this.compoundProvier.getProposals(request);
        }
    }, {
        key: 'getFilePattern',
        value: function getFilePattern() {
            return '*';
        }
    }]);

    return SchemaStoreProvider;
}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SchemaStoreProvider;