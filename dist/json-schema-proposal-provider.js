"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var json_schema_1 = require('./json-schema');
var json_schema_proposal_factory_1 = require('./json-schema-proposal-factory');
var json_schema_loader_1 = require('./json-schema-loader');

var JsonSchemaProposalProvider = function () {
    function JsonSchemaProposalProvider(filePattern, schemaRoot) {
        _classCallCheck(this, JsonSchemaProposalProvider);

        this.filePattern = filePattern;
        this.schemaRoot = schemaRoot;
        this.proposalFactory = new json_schema_proposal_factory_1.JsonSchemaProposalFactory();
    }

    _createClass(JsonSchemaProposalProvider, [{
        key: 'getProposals',
        value: function getProposals(request) {
            return Promise.resolve(this.proposalFactory.createProposals(request, this.schemaRoot));
        }
    }, {
        key: 'getFilePattern',
        value: function getFilePattern() {
            return this.filePattern;
        }
    }], [{
        key: 'createFromProvider',
        value: function createFromProvider(schemaProvider) {
            return json_schema_loader_1.loadSchema(schemaProvider.getSchemaURI()).then(function (schema) {
                return new JsonSchemaProposalProvider(schemaProvider.getFilePattern(), new json_schema_1.SchemaRoot(schema));
            });
        }
    }]);

    return JsonSchemaProposalProvider;
}();

exports.JsonSchemaProposalProvider = JsonSchemaProposalProvider;