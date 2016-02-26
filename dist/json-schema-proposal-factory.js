"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var lodash_1 = require('lodash');
var json_schema_visitors_1 = require('./json-schema-visitors');
var utils_1 = require('./utils');

var KeyProposalFactory = function () {
    function KeyProposalFactory() {
        _classCallCheck(this, KeyProposalFactory);
    }

    _createClass(KeyProposalFactory, [{
        key: 'createProposals',
        value: function createProposals(request, schema) {
            var contents = request.contents;
            var segments = request.segments;

            var unwrappedContents = utils_1.resolveObject(segments, contents);
            var visitor = new json_schema_visitors_1.KeyProposalVisitor(unwrappedContents, new json_schema_visitors_1.SnippetProposalVisitor());
            var proposals = schema.getPossibleTypes(segments).map(function (s) {
                return s.accept(visitor, request);
            });
            return lodash_1.flatten(proposals);
        }
    }]);

    return KeyProposalFactory;
}();

var ValueProposalFactory = function () {
    function ValueProposalFactory() {
        _classCallCheck(this, ValueProposalFactory);
    }

    _createClass(ValueProposalFactory, [{
        key: 'createProposals',
        value: function createProposals(request, schema) {
            var segments = request.segments;

            var schemas = schema.getPossibleTypes(segments);
            var visitor = new json_schema_visitors_1.ValueProposalVisitor(new json_schema_visitors_1.SnippetProposalVisitor());
            return lodash_1.flatten(schemas.map(function (schema) {
                return schema.accept(visitor, request);
            }));
        }
    }]);

    return ValueProposalFactory;
}();

var JsonSchemaProposalFactory = function () {
    function JsonSchemaProposalFactory() {
        _classCallCheck(this, JsonSchemaProposalFactory);

        this.keyProposalFactory = new KeyProposalFactory();
        this.valueProposalFactory = new ValueProposalFactory();
    }

    _createClass(JsonSchemaProposalFactory, [{
        key: 'createProposals',
        value: function createProposals(request, schema) {
            var visitor = new json_schema_visitors_1.ValueProposalVisitor(new json_schema_visitors_1.SnippetProposalVisitor());
            var isKeyPosition = request.isKeyPosition;
            var isValuePosition = request.isValuePosition;
            var isFileEmpty = request.isFileEmpty;
            var contents = request.contents;

            if (isFileEmpty) {
                return lodash_1.flatten(schema.getPossibleTypes([]).map(function (schema) {
                    return schema.accept(visitor, request);
                }));
            }
            if (isKeyPosition) {
                return this.keyProposalFactory.createProposals(request, schema);
            } else if (isValuePosition) {
                return this.valueProposalFactory.createProposals(request, schema);
            }
            return [];
        }
    }]);

    return JsonSchemaProposalFactory;
}();

exports.JsonSchemaProposalFactory = JsonSchemaProposalFactory;