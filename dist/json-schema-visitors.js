var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var json_schema_1 = require('./json-schema');
var utils_1 = require('./utils');
var lodash_1 = require('lodash');
var DefaultSchemaVisitor = (function () {
    function DefaultSchemaVisitor(defaultVisit) {
        this.defaultVisit = defaultVisit;
    }
    DefaultSchemaVisitor.prototype.visitObjectSchema = function (schema, parameter) { return this.defaultVisit(schema, parameter); };
    DefaultSchemaVisitor.prototype.visitArraySchema = function (schema, parameter) { return this.defaultVisit(schema, parameter); };
    DefaultSchemaVisitor.prototype.visitEnumSchema = function (schema, parameter) { return this.defaultVisit(schema, parameter); };
    DefaultSchemaVisitor.prototype.visitStringSchema = function (schema, parameter) { return this.defaultVisit(schema, parameter); };
    DefaultSchemaVisitor.prototype.visitNumberSchema = function (schema, parameter) { return this.defaultVisit(schema, parameter); };
    DefaultSchemaVisitor.prototype.visitBooleanSchema = function (schema, parameter) { return this.defaultVisit(schema, parameter); };
    DefaultSchemaVisitor.prototype.visitOneOfSchema = function (schema, parameter) { return this.defaultVisit(schema, parameter); };
    DefaultSchemaVisitor.prototype.visitAllOfSchema = function (schema, parameter) { return this.defaultVisit(schema, parameter); };
    DefaultSchemaVisitor.prototype.visitAnyOfSchema = function (schema, parameter) { return this.defaultVisit(schema, parameter); };
    DefaultSchemaVisitor.prototype.visitNullSchema = function (schema, parameter) { return this.defaultVisit(schema, parameter); };
    DefaultSchemaVisitor.prototype.visitAnySchema = function (schema, parameter) { return this.defaultVisit(schema, parameter); };
    return DefaultSchemaVisitor;
})();
exports.DefaultSchemaVisitor = DefaultSchemaVisitor;
var SchemaInspectorVisitor = (function (_super) {
    __extends(SchemaInspectorVisitor, _super);
    function SchemaInspectorVisitor() {
        _super.call(this, function (schema, segment) { return []; });
    }
    SchemaInspectorVisitor.prototype.visitObjectSchema = function (schema, segment) {
        var childSchema = schema.getProperty(segment);
        return childSchema ? [childSchema] : [];
    };
    SchemaInspectorVisitor.prototype.visitArraySchema = function (schema, segment) {
        return [schema.getItemSchema()];
    };
    SchemaInspectorVisitor.prototype.visitOneOfSchema = function (schema, segment) {
        var _this = this;
        return lodash_1.flatten(schema.getSchemas().map(function (s) { return s.accept(_this, segment); }));
    };
    SchemaInspectorVisitor.prototype.visitAllOfSchema = function (schema, segment) {
        var _this = this;
        return lodash_1.flatten(schema.getSchemas().map(function (s) { return s.accept(_this, segment); }));
    };
    SchemaInspectorVisitor.prototype.visitAnyOfSchema = function (schema, segment) {
        var _this = this;
        return lodash_1.flatten(schema.getSchemas().map(function (s) { return s.accept(_this, segment); }));
    };
    return SchemaInspectorVisitor;
})(DefaultSchemaVisitor);
exports.SchemaInspectorVisitor = SchemaInspectorVisitor;
var SchemaFlattenerVisitor = (function (_super) {
    __extends(SchemaFlattenerVisitor, _super);
    function SchemaFlattenerVisitor() {
        _super.call(this, function (schema, parameter) { return parameter.push(schema); });
    }
    SchemaFlattenerVisitor.prototype.visitOneOfSchema = function (schema, collector) {
        var _this = this;
        schema.getSchemas().forEach(function (childSchema) { return childSchema.accept(_this, collector); });
    };
    SchemaFlattenerVisitor.prototype.visitAllOfSchema = function (schema, collector) {
        var _this = this;
        schema.getSchemas().forEach(function (childSchema) { return childSchema.accept(_this, collector); });
    };
    SchemaFlattenerVisitor.prototype.visitAnyOfSchema = function (schema, collector) {
        var _this = this;
        schema.getSchemas().forEach(function (childSchema) { return childSchema.accept(_this, collector); });
    };
    return SchemaFlattenerVisitor;
})(DefaultSchemaVisitor);
exports.SchemaFlattenerVisitor = SchemaFlattenerVisitor;
var SnippetProposalVisitor = (function (_super) {
    __extends(SnippetProposalVisitor, _super);
    function SnippetProposalVisitor() {
        _super.call(this, function (schema, request) { return SnippetProposalVisitor.DEFAULT; });
    }
    SnippetProposalVisitor.prototype.comma = function (request) {
        return request.shouldAddComma ? ',' : '';
    };
    SnippetProposalVisitor.prototype.visitStringLike = function (schema, request) {
        var isBetweenQuotes = request.isBetweenQuotes;
        var q = isBetweenQuotes ? '' : '"';
        return q + '${1:' + (schema.getDefaultValue() || '') + '}' + q + this.comma(request);
    };
    SnippetProposalVisitor.prototype.visitStringSchema = function (schema, request) {
        return this.visitStringLike(schema, request);
    };
    SnippetProposalVisitor.prototype.visitNumberSchema = function (schema, request) {
        return request.isBetweenQuotes
            ? this.defaultVisit(schema, request)
            : '${1:' + (schema.getDefaultValue() || '0') + '}' + this.comma(request);
    };
    SnippetProposalVisitor.prototype.visitBooleanSchema = function (schema, request) {
        return request.isBetweenQuotes
            ? this.defaultVisit(schema, request)
            : '${1:' + (schema.getDefaultValue() || 'false') + '}' + this.comma(request);
    };
    SnippetProposalVisitor.prototype.visitNullSchema = function (schema, request) {
        return request.isBetweenQuotes
            ? this.defaultVisit(schema, request)
            : '${1:null}' + this.comma(request);
    };
    SnippetProposalVisitor.prototype.visitEnumSchema = function (schema, request) {
        return this.visitStringLike(schema, request);
    };
    SnippetProposalVisitor.prototype.visitArraySchema = function (schema, request) {
        return request.isBetweenQuotes
            ? this.defaultVisit(schema, request)
            : '[$1]' + this.comma(request);
    };
    SnippetProposalVisitor.prototype.visitObjectSchema = function (schema, request) {
        return request.isBetweenQuotes
            ? this.defaultVisit(schema, request)
            : '{$1}' + this.comma(request);
    };
    SnippetProposalVisitor.DEFAULT = '$1';
    return SnippetProposalVisitor;
})(DefaultSchemaVisitor);
exports.SnippetProposalVisitor = SnippetProposalVisitor;
var ValueProposalVisitor = (function (_super) {
    __extends(ValueProposalVisitor, _super);
    function ValueProposalVisitor(snippetVisitor) {
        _super.call(this, function (schema, request) { return []; });
        this.snippetVisitor = snippetVisitor;
    }
    ValueProposalVisitor.prototype.createBaseProposalFor = function (schema) {
        return {
            description: schema.getDescription(),
            rightLabel: schema.getDisplayType(),
            type: 'value'
        };
    };
    ValueProposalVisitor.prototype.visitObjectSchema = function (schema, request) {
        var proposal = this.createBaseProposalFor(schema);
        proposal.displayText = '{}';
        proposal.snippet = schema.accept(this.snippetVisitor, request);
        return [proposal];
    };
    ValueProposalVisitor.prototype.visitArraySchema = function (schema, request) {
        var proposal = this.createBaseProposalFor(schema);
        proposal.displayText = '[]';
        proposal.snippet = schema.accept(this.snippetVisitor, request);
        return [proposal];
    };
    ValueProposalVisitor.prototype.visitStringSchema = function (schema, request) {
        if (request.isBetweenQuotes) {
            return [];
        }
        var proposal = this.createBaseProposalFor(schema);
        proposal.displayText = schema.getDefaultValue() ? "\"" + schema.getDefaultValue() + "\"" : '""';
        proposal.snippet = schema.accept(this.snippetVisitor, request);
        return [proposal];
    };
    ValueProposalVisitor.prototype.visitNumberSchema = function (schema, request) {
        if (request.isBetweenQuotes) {
            return [];
        }
        var proposal = this.createBaseProposalFor(schema);
        proposal.displayText = schema.getDefaultValue() ? "" + schema.getDefaultValue() : "0";
        proposal.snippet = schema.accept(this.snippetVisitor, request);
        return [proposal];
    };
    ValueProposalVisitor.prototype.visitBooleanSchema = function (schema, request) {
        var _this = this;
        if (request.isBetweenQuotes) {
            return [];
        }
        return [true, false].map(function (bool) {
            var proposal = _this.createBaseProposalFor(schema);
            proposal.displayText = bool ? 'true' : 'false';
            proposal.snippet = proposal.displayText + '${1}' + _this.snippetVisitor.comma(request);
            return proposal;
        });
    };
    ValueProposalVisitor.prototype.visitNullSchema = function (schema, request) {
        if (request.isBetweenQuotes) {
            return [];
        }
        var proposal = this.createBaseProposalFor(schema);
        proposal.displayText = schema.getDefaultValue() ? "" + schema.getDefaultValue() : "null";
        proposal.snippet = schema.accept(this.snippetVisitor, request);
        return [proposal];
    };
    ValueProposalVisitor.prototype.visitEnumSchema = function (schema, request) {
        var _this = this;
        var segments = request.segments, contents = request.contents;
        var parent = schema.getParent();
        var possibleValues = schema.getValues();
        if ((parent instanceof json_schema_1.ArraySchema) && parent.hasUniqueItems()) {
            var alreadyPresentValues = utils_1.resolveObject(segments.slice(0, segments.length - 1), contents) || [];
            possibleValues = possibleValues.filter(function (value) { return alreadyPresentValues.indexOf(value) < 0; });
        }
        return possibleValues.map(function (enumValue) {
            var proposal = _this.createBaseProposalFor(schema);
            proposal.displayText = enumValue;
            if (request.isBetweenQuotes) {
                proposal.text = enumValue;
            }
            else {
                proposal.snippet = '"' + enumValue + '${1}"' + _this.snippetVisitor.comma(request);
            }
            return proposal;
        });
    };
    ValueProposalVisitor.prototype.visitCompositeSchema = function (schema, request) {
        var _this = this;
        return lodash_1.flatten(schema.getSchemas()
            .filter(function (s) { return !(s instanceof json_schema_1.AnyOfSchema); })
            .map(function (s) { return s.accept(_this, request).filter(function (r) { return r.snippet !== SnippetProposalVisitor.DEFAULT; }); }));
    };
    ValueProposalVisitor.prototype.visitAllOfSchema = function (schema, request) {
        return this.visitCompositeSchema(schema, request);
    };
    ValueProposalVisitor.prototype.visitAnyOfSchema = function (schema, request) {
        return this.visitCompositeSchema(schema, request);
    };
    ValueProposalVisitor.prototype.visitOneOfSchema = function (schema, request) {
        return this.visitCompositeSchema(schema, request);
    };
    return ValueProposalVisitor;
})(DefaultSchemaVisitor);
exports.ValueProposalVisitor = ValueProposalVisitor;
var KeyProposalVisitor = (function (_super) {
    __extends(KeyProposalVisitor, _super);
    function KeyProposalVisitor(unwrappedContents, snippetVisitor) {
        _super.call(this, (function (schema, request) { return []; }));
        this.unwrappedContents = unwrappedContents;
        this.snippetVisitor = snippetVisitor;
    }
    KeyProposalVisitor.prototype.visitObjectSchema = function (schema, request) {
        var _this = this;
        var prefix = request.prefix, isBetweenQuotes = request.isBetweenQuotes;
        return schema.getKeys()
            .filter(function (key) { return !_this.unwrappedContents || (key.indexOf(prefix) >= 0 && !_this.unwrappedContents.hasOwnProperty(key)); })
            .map(function (key) {
            var valueSchema = schema.getProperty(key);
            var proposal = {};
            proposal.description = valueSchema.getDescription();
            proposal.type = 'property';
            proposal.displayText = key;
            proposal.rightLabel = valueSchema.getDisplayType();
            if (isBetweenQuotes) {
                proposal.text = key;
            }
            else {
                var value = schema.getProperty(key).accept(_this.snippetVisitor, request);
                proposal.snippet = "\"" + key + "\": " + value;
            }
            return proposal;
        });
    };
    KeyProposalVisitor.prototype.visitCompositeSchema = function (schema, request) {
        var _this = this;
        var proposals = schema.getSchemas()
            .filter(function (s) { return s instanceof json_schema_1.ObjectSchema; })
            .map(function (s) { return s.accept(_this, request); });
        return lodash_1.flatten(proposals);
    };
    KeyProposalVisitor.prototype.visitAllOfSchema = function (schema, request) {
        return this.visitCompositeSchema(schema, request);
    };
    KeyProposalVisitor.prototype.visitAnyOfSchema = function (schema, request) {
        return this.visitCompositeSchema(schema, request);
    };
    KeyProposalVisitor.prototype.visitOneOfSchema = function (schema, request) {
        return this.visitCompositeSchema(schema, request);
    };
    return KeyProposalVisitor;
})(DefaultSchemaVisitor);
exports.KeyProposalVisitor = KeyProposalVisitor;
