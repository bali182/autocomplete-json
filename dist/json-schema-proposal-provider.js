var json_schema_1 = require('./json-schema');
var json_schema_proposal_factory_1 = require('./json-schema-proposal-factory');
var fs = require('fs');
var fetch = require('node-fetch');
var JsonSchemaProposalProvider = (function () {
    function JsonSchemaProposalProvider(schemaPromise) {
        var _this = this;
        this.proposalFactory = new json_schema_proposal_factory_1.JsonSchemaProposalFactory();
        this.schemaRoot = null;
        schemaPromise.then(function (schema) {
            _this.schemaRoot = new json_schema_1.SchemaRoot(schema);
            return schema;
        });
    }
    JsonSchemaProposalProvider.prototype.getProposals = function (request) {
        if (this.schemaRoot === null) {
            return Promise.resolve([]);
        }
        return Promise.resolve(this.proposalFactory.createProposals(request, this.schemaRoot));
    };
    JsonSchemaProposalProvider.prototype.loadLocalSchema = function (location, encoding) {
        if (encoding === void 0) { encoding = 'UTF-8'; }
        return new Promise(function (resolve, reject) {
            fs.readFile(location, encoding, function (error, data) {
                if (error) {
                    reject(error);
                }
                else {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch (e) {
                        reject(e);
                    }
                }
            });
        });
    };
    JsonSchemaProposalProvider.prototype.loadRemoteSchema = function (url) {
        return fetch(url).then(function (response) { return response.json(); });
    };
    return JsonSchemaProposalProvider;
})();
exports.JsonSchemaProposalProvider = JsonSchemaProposalProvider;
