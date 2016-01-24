var lodash_1 = require('lodash');
var json_schema_visitors_1 = require('./json-schema-visitors');
var utils_1 = require('./utils');
var KeyProposalFactory = (function () {
    function KeyProposalFactory() {
    }
    KeyProposalFactory.prototype.createProposals = function (request, schema) {
        var contents = request.contents, segments = request.segments;
        var unwrappedContents = utils_1.resolveObject(segments, contents);
        var visitor = new json_schema_visitors_1.KeyProposalVisitor(unwrappedContents, new json_schema_visitors_1.SnippetProposalVisitor());
        var proposals = schema.getPossibleTypes(segments)
            .map(function (s) { return s.accept(visitor, request); });
        return lodash_1.flatten(proposals);
    };
    return KeyProposalFactory;
})();
var ValueProposalFactory = (function () {
    function ValueProposalFactory() {
    }
    ValueProposalFactory.prototype.createProposals = function (request, schema) {
        var segments = request.segments;
        var schemas = schema.getPossibleTypes(segments);
        var visitor = new json_schema_visitors_1.ValueProposalVisitor(new json_schema_visitors_1.SnippetProposalVisitor());
        return lodash_1.flatten(schemas.map(function (schema) { return schema.accept(visitor, request); }));
    };
    return ValueProposalFactory;
})();
var JsonSchemaProposalFactory = (function () {
    function JsonSchemaProposalFactory() {
        this.keyProposalFactory = new KeyProposalFactory();
        this.valueProposalFactory = new ValueProposalFactory();
    }
    JsonSchemaProposalFactory.prototype.createProposals = function (request, schema) {
        var visitor = new json_schema_visitors_1.ValueProposalVisitor(new json_schema_visitors_1.SnippetProposalVisitor());
        var isKeyPosition = request.isKeyPosition, isValuePosition = request.isValuePosition, isFileEmpty = request.isFileEmpty, contents = request.contents;
        if (isFileEmpty) {
            return lodash_1.flatten(schema.getPossibleTypes([]).map(function (schema) { return schema.accept(visitor, request); }));
        }
        if (isKeyPosition) {
            return this.keyProposalFactory.createProposals(request, schema);
        }
        else if (isValuePosition) {
            return this.valueProposalFactory.createProposals(request, schema);
        }
        return [];
    };
    return JsonSchemaProposalFactory;
})();
exports.JsonSchemaProposalFactory = JsonSchemaProposalFactory;
