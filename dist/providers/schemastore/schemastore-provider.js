"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var minimatch = require('minimatch');
var json_schema_proposal_provider_1 = require('../../json-schema-proposal-provider');
var json_schema_1 = require('../../json-schema');
var compound_provider_1 = require('./compound-provider');
var fetch = require('node-fetch');

var SchemaStoreProvider = function () {
    function SchemaStoreProvider() {
        var _this = this;

        _classCallCheck(this, SchemaStoreProvider);

        this.compoundProvier = new compound_provider_1.CompoundProposalProvider();
        this.blackList = {};
        fetch('http://schemastore.org/api/json/catalog.json').then(function (response) {
            return response.json();
        }).then(function (data) {
            return data.schemas.filter(function (schema) {
                return !!schema.fileMatch;
            });
        }).then(function (schemaInfos) {
            return _this.schemaInfos = schemaInfos;
        }).catch(function (error) {
            return console.error(error);
        });
    }

    _createClass(SchemaStoreProvider, [{
        key: 'getProposals',
        value: function getProposals(request) {
            var _this2 = this;

            var fileName = request.editor.buffer.file.getBaseName();
            if (!this.schemaInfos || this.blackList[fileName]) {
                console.warn('schemas not available');
                return Promise.resolve([]);
            }
            if (!this.compoundProvier.hasProposals(fileName)) {
                var matchingSchemas = this.schemaInfos.filter(function (_ref) {
                    var fileMatch = _ref.fileMatch;

                    return fileMatch.some(function (match) {
                        return minimatch(fileName, match);
                    });
                });
                var providersPromises = matchingSchemas.map(function (schemaInfo) {
                    var schemaPromise = fetch(schemaInfo.url).then(function (result) {
                        return result.json();
                    });
                    return schemaPromise.then(function (schema) {
                        return new json_schema_proposal_provider_1.JsonSchemaProposalProvider(schemaInfo.fileMatch, new json_schema_1.SchemaRoot(schema));
                    });
                });
                return Promise.all(providersPromises).then(function (providers) {
                    return _this2.compoundProvier.addProviders(providers);
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