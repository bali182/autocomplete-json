var json_schema_1 = require('./json-schema');
var json_schema_proposal_factory_1 = require('./json-schema-proposal-factory');
var fs = require('fs');
var fetch = require('node-fetch');
var uriValidator = require('valid-url');
function isLocalFile(uri) {
    try {
        fs.accessSync(uri, fs.F_OK);
        return true;
    }
    catch (e) {
        return false;
    }
}
function resolveLocalFile(uri) {
    return new Promise(function (resolve, reject) {
        fs.readFile(uri, 'UTF-8', function (error, data) {
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
}
function resolveSchemaObject(uri) {
    if (isLocalFile(uri)) {
        return resolveLocalFile(uri);
    }
    else if (uriValidator.isWebUri(uri)) {
        return fetch(uri).then(function (data) { return data.json(); });
    }
    console.warn("Invalid schema location: " + uri);
    return Promise.resolve({});
}
var JsonSchemaProposalProvider = (function () {
    function JsonSchemaProposalProvider(schemaProvider) {
        var _this = this;
        this.schemaProvider = schemaProvider;
        this.proposalFactory = new json_schema_proposal_factory_1.JsonSchemaProposalFactory();
        this.schemaRoot = null;
        resolveSchemaObject(schemaProvider.getSchemaURI())
            .then(function (schemaObject) {
            _this.schemaRoot = new json_schema_1.SchemaRoot(schemaObject);
            return schemaObject;
        });
    }
    JsonSchemaProposalProvider.prototype.getProposals = function (request) {
        if (this.schemaRoot === null) {
            return Promise.resolve([]);
        }
        return Promise.resolve(this.proposalFactory.createProposals(request, this.schemaRoot));
    };
    JsonSchemaProposalProvider.prototype.getFilePattern = function () {
        return this.schemaProvider.getFilePattern();
    };
    return JsonSchemaProposalProvider;
})();
exports.JsonSchemaProposalProvider = JsonSchemaProposalProvider;
