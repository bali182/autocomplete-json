var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var json_schema_1 = require('./json-schema');
var lodash_1 = require('lodash');
var SnippetProposalVisitor = (function (_super) {
    __extends(SnippetProposalVisitor, _super);
    function SnippetProposalVisitor() {
        _super.call(this, function (schema, request) { return '$1'; });
    }
    SnippetProposalVisitor.instance = function () {
        if (SnippetProposalVisitor.INSTANCE === null) {
            SnippetProposalVisitor.INSTANCE = new SnippetProposalVisitor();
        }
        return SnippetProposalVisitor.INSTANCE;
    };
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
    SnippetProposalVisitor.INSTANCE = null;
    return SnippetProposalVisitor;
})(json_schema_1.DefaultSchemaVisitor);
var ValueProposalVisitor = (function (_super) {
    __extends(ValueProposalVisitor, _super);
    function ValueProposalVisitor() {
        _super.call(this, function (schema, request) { return []; });
    }
    ValueProposalVisitor.instance = function () {
        if (ValueProposalVisitor.INSTANCE === null) {
            ValueProposalVisitor.INSTANCE = new ValueProposalVisitor();
        }
        return ValueProposalVisitor.INSTANCE;
    };
    ValueProposalVisitor.prototype.createBaseProposalFor = function (schema) {
        return {
            description: schema.getDescription(),
            rightLabel: schema.getDisplayType()
        };
    };
    ValueProposalVisitor.prototype.visitObjectSchema = function (schema, request) {
        var proposal = this.createBaseProposalFor(schema);
        proposal.displayText = '{}';
        proposal.snippet = schema.accept(SnippetProposalVisitor.instance(), request);
        return [proposal];
    };
    ValueProposalVisitor.prototype.visitArraySchema = function (schema, request) {
        var proposal = this.createBaseProposalFor(schema);
        proposal.displayText = '[]';
        proposal.snippet = schema.accept(SnippetProposalVisitor.instance(), request);
        return [proposal];
    };
    ValueProposalVisitor.prototype.visitStringSchema = function (schema, request) {
        if (request.isBetweenQuotes) {
            return [];
        }
        var proposal = this.createBaseProposalFor(schema);
        proposal.displayText = schema.getDefaultValue() ? "\"" + schema.getDefaultValue() + "\"" : '""';
        proposal.snippet = schema.accept(SnippetProposalVisitor.instance(), request);
        return [proposal];
    };
    ValueProposalVisitor.prototype.visitNumberSchema = function (schema, request) {
        if (request.isBetweenQuotes) {
            return [];
        }
        var proposal = this.createBaseProposalFor(schema);
        proposal.displayText = schema.getDefaultValue() ? "" + schema.getDefaultValue() : "0";
        proposal.snippet = schema.accept(SnippetProposalVisitor.instance(), request);
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
            proposal.snippet = proposal.displayText + '${1}' + SnippetProposalVisitor.instance().comma(request);
            return proposal;
        });
    };
    ValueProposalVisitor.prototype.visitNullSchema = function (schema, request) {
        if (request.isBetweenQuotes) {
            return [];
        }
        var proposal = this.createBaseProposalFor(schema);
        proposal.displayText = schema.getDefaultValue() ? "" + schema.getDefaultValue() : "null";
        proposal.snippet = schema.accept(SnippetProposalVisitor.instance(), request);
        return [proposal];
    };
    ValueProposalVisitor.prototype.visitEnumSchema = function (schema, request) {
        var _this = this;
        return schema.getValues()
            .map(function (enumValue) {
            var proposal = _this.createBaseProposalFor(schema);
            proposal.displayText = enumValue;
            if (request.isBetweenQuotes) {
                proposal.text = enumValue;
            }
            else {
                proposal.snippet = '"' + enumValue + '${1}"' + SnippetProposalVisitor.instance().comma(request);
            }
            return proposal;
        });
    };
    ValueProposalVisitor.prototype.visitCompositeSchema = function (schema, request) {
        var _this = this;
        return lodash_1.flatten(schema.getSchemas()
            .filter(function (s) { return !(s instanceof json_schema_1.AnyOfSchema); })
            .map(function (s) { return s.accept(_this, request); }));
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
    ValueProposalVisitor.INSTANCE = null;
    return ValueProposalVisitor;
})(json_schema_1.DefaultSchemaVisitor);
var KeyProposalVisitor = (function (_super) {
    __extends(KeyProposalVisitor, _super);
    function KeyProposalVisitor(unwrappedContents) {
        _super.call(this, (function (schema, request) { return []; }));
        this.unwrappedContents = unwrappedContents;
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
                var value = schema.getProperty(key).accept(SnippetProposalVisitor.instance(), request);
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
})(json_schema_1.DefaultSchemaVisitor);
function resolveObject(segments, object) {
    if (!lodash_1.isObject(object)) {
        return null;
    }
    if (segments.length === 0) {
        return object;
    }
    var key = segments[0], restOfSegments = segments.slice(1);
    return resolveObject(restOfSegments, object[key]);
}
var KeyProposalFactory = (function () {
    function KeyProposalFactory() {
    }
    KeyProposalFactory.prototype.createProposals = function (request, schema) {
        var contents = request.contents, segments = request.segments;
        var unwrappedContents = resolveObject(segments, contents);
        var visitor = new KeyProposalVisitor(unwrappedContents);
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
        return lodash_1.flatten(schemas.map(function (schema) { return schema.accept(ValueProposalVisitor.instance(), request); }));
    };
    return ValueProposalFactory;
})();
var JsonSchemaProposalFactory = (function () {
    function JsonSchemaProposalFactory() {
        this.keyProposalFactory = new KeyProposalFactory();
        this.valueProposalFactory = new ValueProposalFactory();
    }
    JsonSchemaProposalFactory.prototype.createProposals = function (request, schema) {
        var isKeyPosition = request.isKeyPosition, isValuePosition = request.isValuePosition, isFileEmpty = request.isFileEmpty, contents = request.contents;
        if (isFileEmpty) {
            return lodash_1.flatten(schema.getPossibleTypes([]).map(function (schema) { return schema.accept(ValueProposalVisitor.instance(), request); }));
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
