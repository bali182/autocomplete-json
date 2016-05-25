"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var json_schema_1 = require('./json-schema');
var json_schema_proposal_factory_1 = require('./json-schema-proposal-factory');
var json_schema_loader_1 = require('./json-schema-loader');

var JsonSchemaProposalProvider = function () {
    function JsonSchemaProposalProvider(schemaProvider) {
        var _this = this;

        _classCallCheck(this, JsonSchemaProposalProvider);

        this.schemaProvider = schemaProvider;
        this.proposalFactory = new json_schema_proposal_factory_1.JsonSchemaProposalFactory();
        this.schemaRoot = null;
        json_schema_loader_1.loadSchema(schemaProvider.getSchemaURI()).then(function (schemaObject) {
            _this.schemaRoot = new json_schema_1.SchemaRoot(schemaObject);
            return schemaObject;
        });
    }

    _createClass(JsonSchemaProposalProvider, [{
        key: 'getProposals',
        value: function getProposals(request) {
            if (this.schemaRoot === null) {
                return Promise.resolve([]);
            }
            return Promise.resolve(this.proposalFactory.createProposals(request, this.schemaRoot));
        }
    }, {
        key: 'getFilePattern',
        value: function getFilePattern() {
            return this.schemaProvider.getFilePattern();
        }
    }]);

    return JsonSchemaProposalProvider;
}();

exports.JsonSchemaProposalProvider = JsonSchemaProposalProvider;