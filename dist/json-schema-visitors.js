"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var json_schema_1 = require('./json-schema');
var utils_1 = require('./utils');
var lodash_1 = require('lodash');

var DefaultSchemaVisitor = function () {
    function DefaultSchemaVisitor(defaultVisit) {
        _classCallCheck(this, DefaultSchemaVisitor);

        this.defaultVisit = defaultVisit;
    }

    _createClass(DefaultSchemaVisitor, [{
        key: 'visitObjectSchema',
        value: function visitObjectSchema(schema, parameter) {
            return this.defaultVisit(schema, parameter);
        }
    }, {
        key: 'visitArraySchema',
        value: function visitArraySchema(schema, parameter) {
            return this.defaultVisit(schema, parameter);
        }
    }, {
        key: 'visitEnumSchema',
        value: function visitEnumSchema(schema, parameter) {
            return this.defaultVisit(schema, parameter);
        }
    }, {
        key: 'visitStringSchema',
        value: function visitStringSchema(schema, parameter) {
            return this.defaultVisit(schema, parameter);
        }
    }, {
        key: 'visitNumberSchema',
        value: function visitNumberSchema(schema, parameter) {
            return this.defaultVisit(schema, parameter);
        }
    }, {
        key: 'visitBooleanSchema',
        value: function visitBooleanSchema(schema, parameter) {
            return this.defaultVisit(schema, parameter);
        }
    }, {
        key: 'visitOneOfSchema',
        value: function visitOneOfSchema(schema, parameter) {
            return this.defaultVisit(schema, parameter);
        }
    }, {
        key: 'visitAllOfSchema',
        value: function visitAllOfSchema(schema, parameter) {
            return this.defaultVisit(schema, parameter);
        }
    }, {
        key: 'visitAnyOfSchema',
        value: function visitAnyOfSchema(schema, parameter) {
            return this.defaultVisit(schema, parameter);
        }
    }, {
        key: 'visitNullSchema',
        value: function visitNullSchema(schema, parameter) {
            return this.defaultVisit(schema, parameter);
        }
    }, {
        key: 'visitAnySchema',
        value: function visitAnySchema(schema, parameter) {
            return this.defaultVisit(schema, parameter);
        }
    }]);

    return DefaultSchemaVisitor;
}();

exports.DefaultSchemaVisitor = DefaultSchemaVisitor;

var SchemaInspectorVisitor = function (_DefaultSchemaVisitor) {
    _inherits(SchemaInspectorVisitor, _DefaultSchemaVisitor);

    function SchemaInspectorVisitor() {
        _classCallCheck(this, SchemaInspectorVisitor);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SchemaInspectorVisitor).call(this, function (schema, segment) {
            return [];
        }));
    }

    _createClass(SchemaInspectorVisitor, [{
        key: 'visitObjectSchema',
        value: function visitObjectSchema(schema, segment) {
            var childSchema = schema.getProperty(segment);
            if (childSchema) {
                return [childSchema];
            }
            return schema.getPatternProperties().filter(function (p) {
                return p.getPattern().test(segment);
            }).map(function (p) {
                return p.getSchema();
            });
        }
    }, {
        key: 'visitArraySchema',
        value: function visitArraySchema(schema, segment) {
            return [schema.getItemSchema()];
        }
    }, {
        key: 'visitOneOfSchema',
        value: function visitOneOfSchema(schema, segment) {
            var _this2 = this;

            return lodash_1.flatten(schema.getSchemas().map(function (s) {
                return s.accept(_this2, segment);
            }));
        }
    }, {
        key: 'visitAllOfSchema',
        value: function visitAllOfSchema(schema, segment) {
            var _this3 = this;

            return lodash_1.flatten(schema.getSchemas().map(function (s) {
                return s.accept(_this3, segment);
            }));
        }
    }, {
        key: 'visitAnyOfSchema',
        value: function visitAnyOfSchema(schema, segment) {
            var _this4 = this;

            return lodash_1.flatten(schema.getSchemas().map(function (s) {
                return s.accept(_this4, segment);
            }));
        }
    }]);

    return SchemaInspectorVisitor;
}(DefaultSchemaVisitor);

exports.SchemaInspectorVisitor = SchemaInspectorVisitor;

var SchemaFlattenerVisitor = function (_DefaultSchemaVisitor2) {
    _inherits(SchemaFlattenerVisitor, _DefaultSchemaVisitor2);

    function SchemaFlattenerVisitor() {
        _classCallCheck(this, SchemaFlattenerVisitor);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SchemaFlattenerVisitor).call(this, function (schema, parameter) {
            return parameter.push(schema);
        }));
    }

    _createClass(SchemaFlattenerVisitor, [{
        key: 'visitOneOfSchema',
        value: function visitOneOfSchema(schema, collector) {
            var _this6 = this;

            schema.getSchemas().forEach(function (childSchema) {
                return childSchema.accept(_this6, collector);
            });
        }
    }, {
        key: 'visitAllOfSchema',
        value: function visitAllOfSchema(schema, collector) {
            var _this7 = this;

            schema.getSchemas().forEach(function (childSchema) {
                return childSchema.accept(_this7, collector);
            });
        }
    }, {
        key: 'visitAnyOfSchema',
        value: function visitAnyOfSchema(schema, collector) {
            var _this8 = this;

            schema.getSchemas().forEach(function (childSchema) {
                return childSchema.accept(_this8, collector);
            });
        }
    }]);

    return SchemaFlattenerVisitor;
}(DefaultSchemaVisitor);

exports.SchemaFlattenerVisitor = SchemaFlattenerVisitor;

var SnippetProposalVisitor = function (_DefaultSchemaVisitor3) {
    _inherits(SnippetProposalVisitor, _DefaultSchemaVisitor3);

    function SnippetProposalVisitor() {
        _classCallCheck(this, SnippetProposalVisitor);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SnippetProposalVisitor).call(this, function (schema, request) {
            return SnippetProposalVisitor.DEFAULT;
        }));
    }

    _createClass(SnippetProposalVisitor, [{
        key: 'comma',
        value: function comma(request) {
            return request.shouldAddComma ? ',' : '';
        }
    }, {
        key: 'visitStringLike',
        value: function visitStringLike(schema, request) {
            var isBetweenQuotes = request.isBetweenQuotes;

            var q = isBetweenQuotes ? '' : '"';
            return q + '${1:' + (schema.getDefaultValue() || '') + '}' + q + this.comma(request);
        }
    }, {
        key: 'visitStringSchema',
        value: function visitStringSchema(schema, request) {
            return this.visitStringLike(schema, request);
        }
    }, {
        key: 'visitNumberSchema',
        value: function visitNumberSchema(schema, request) {
            return request.isBetweenQuotes ? this.defaultVisit(schema, request) : '${1:' + (schema.getDefaultValue() || '0') + '}' + this.comma(request);
        }
    }, {
        key: 'visitBooleanSchema',
        value: function visitBooleanSchema(schema, request) {
            return request.isBetweenQuotes ? this.defaultVisit(schema, request) : '${1:' + (schema.getDefaultValue() || 'false') + '}' + this.comma(request);
        }
    }, {
        key: 'visitNullSchema',
        value: function visitNullSchema(schema, request) {
            return request.isBetweenQuotes ? this.defaultVisit(schema, request) : '${1:null}' + this.comma(request);
        }
    }, {
        key: 'visitEnumSchema',
        value: function visitEnumSchema(schema, request) {
            return this.visitStringLike(schema, request);
        }
    }, {
        key: 'visitArraySchema',
        value: function visitArraySchema(schema, request) {
            return request.isBetweenQuotes ? this.defaultVisit(schema, request) : '[$1]' + this.comma(request);
        }
    }, {
        key: 'visitObjectSchema',
        value: function visitObjectSchema(schema, request) {
            return request.isBetweenQuotes ? this.defaultVisit(schema, request) : '{$1}' + this.comma(request);
        }
    }]);

    return SnippetProposalVisitor;
}(DefaultSchemaVisitor);

SnippetProposalVisitor.DEFAULT = '$1';
exports.SnippetProposalVisitor = SnippetProposalVisitor;

var ValueProposalVisitor = function (_DefaultSchemaVisitor4) {
    _inherits(ValueProposalVisitor, _DefaultSchemaVisitor4);

    function ValueProposalVisitor(snippetVisitor) {
        _classCallCheck(this, ValueProposalVisitor);

        var _this10 = _possibleConstructorReturn(this, Object.getPrototypeOf(ValueProposalVisitor).call(this, function (schema, request) {
            return [];
        }));

        _this10.snippetVisitor = snippetVisitor;
        return _this10;
    }

    _createClass(ValueProposalVisitor, [{
        key: 'createBaseProposalFor',
        value: function createBaseProposalFor(schema) {
            return {
                description: schema.getDescription(),
                rightLabel: schema.getDisplayType(),
                type: 'value'
            };
        }
    }, {
        key: 'visitObjectSchema',
        value: function visitObjectSchema(schema, request) {
            var proposal = this.createBaseProposalFor(schema);
            proposal.displayText = '{}';
            proposal.snippet = schema.accept(this.snippetVisitor, request);
            return [proposal];
        }
    }, {
        key: 'visitArraySchema',
        value: function visitArraySchema(schema, request) {
            var proposal = this.createBaseProposalFor(schema);
            proposal.displayText = '[]';
            proposal.snippet = schema.accept(this.snippetVisitor, request);
            return [proposal];
        }
    }, {
        key: 'visitStringSchema',
        value: function visitStringSchema(schema, request) {
            if (request.isBetweenQuotes) {
                return [];
            }
            var proposal = this.createBaseProposalFor(schema);
            proposal.displayText = schema.getDefaultValue() ? '"' + schema.getDefaultValue() + '"' : '""';
            proposal.snippet = schema.accept(this.snippetVisitor, request);
            return [proposal];
        }
    }, {
        key: 'visitNumberSchema',
        value: function visitNumberSchema(schema, request) {
            if (request.isBetweenQuotes) {
                return [];
            }
            var proposal = this.createBaseProposalFor(schema);
            proposal.displayText = schema.getDefaultValue() ? '' + schema.getDefaultValue() : "0";
            proposal.snippet = schema.accept(this.snippetVisitor, request);
            return [proposal];
        }
    }, {
        key: 'visitBooleanSchema',
        value: function visitBooleanSchema(schema, request) {
            var _this11 = this;

            if (request.isBetweenQuotes) {
                return [];
            }
            return [true, false].map(function (bool) {
                var proposal = _this11.createBaseProposalFor(schema);
                proposal.displayText = bool ? 'true' : 'false';
                proposal.snippet = proposal.displayText + '${1}' + _this11.snippetVisitor.comma(request);
                return proposal;
            });
        }
    }, {
        key: 'visitNullSchema',
        value: function visitNullSchema(schema, request) {
            if (request.isBetweenQuotes) {
                return [];
            }
            var proposal = this.createBaseProposalFor(schema);
            proposal.displayText = schema.getDefaultValue() ? '' + schema.getDefaultValue() : "null";
            proposal.snippet = schema.accept(this.snippetVisitor, request);
            return [proposal];
        }
    }, {
        key: 'visitEnumSchema',
        value: function visitEnumSchema(schema, request) {
            var _this12 = this;

            var segments = request.segments;
            var contents = request.contents;

            var parent = schema.getParent();
            var possibleValues = schema.getValues();
            if (parent instanceof json_schema_1.ArraySchema && parent.hasUniqueItems()) {
                (function () {
                    var alreadyPresentValues = utils_1.resolveObject(segments.slice(0, segments.length - 1), contents) || [];
                    possibleValues = possibleValues.filter(function (value) {
                        return alreadyPresentValues.indexOf(value) < 0;
                    });
                })();
            }
            return possibleValues.map(function (enumValue) {
                var proposal = _this12.createBaseProposalFor(schema);
                proposal.displayText = enumValue;
                if (request.isBetweenQuotes) {
                    proposal.text = enumValue;
                } else {
                    proposal.snippet = '"' + enumValue + '${1}"' + _this12.snippetVisitor.comma(request);
                }
                return proposal;
            });
        }
    }, {
        key: 'visitCompositeSchema',
        value: function visitCompositeSchema(schema, request) {
            var _this13 = this;

            return lodash_1.flatten(schema.getSchemas().filter(function (s) {
                return !(s instanceof json_schema_1.AnyOfSchema);
            }).map(function (s) {
                return s.accept(_this13, request).filter(function (r) {
                    return r.snippet !== SnippetProposalVisitor.DEFAULT;
                });
            }));
        }
    }, {
        key: 'visitAllOfSchema',
        value: function visitAllOfSchema(schema, request) {
            return this.visitCompositeSchema(schema, request);
        }
    }, {
        key: 'visitAnyOfSchema',
        value: function visitAnyOfSchema(schema, request) {
            return this.visitCompositeSchema(schema, request);
        }
    }, {
        key: 'visitOneOfSchema',
        value: function visitOneOfSchema(schema, request) {
            return this.visitCompositeSchema(schema, request);
        }
    }]);

    return ValueProposalVisitor;
}(DefaultSchemaVisitor);

exports.ValueProposalVisitor = ValueProposalVisitor;

var KeyProposalVisitor = function (_DefaultSchemaVisitor5) {
    _inherits(KeyProposalVisitor, _DefaultSchemaVisitor5);

    function KeyProposalVisitor(unwrappedContents, snippetVisitor) {
        _classCallCheck(this, KeyProposalVisitor);

        var _this14 = _possibleConstructorReturn(this, Object.getPrototypeOf(KeyProposalVisitor).call(this, function (schema, request) {
            return [];
        }));

        _this14.unwrappedContents = unwrappedContents;
        _this14.snippetVisitor = snippetVisitor;
        return _this14;
    }

    _createClass(KeyProposalVisitor, [{
        key: 'visitObjectSchema',
        value: function visitObjectSchema(schema, request) {
            var _this15 = this;

            var prefix = request.prefix;
            var isBetweenQuotes = request.isBetweenQuotes;

            return schema.getKeys().filter(function (key) {
                return !_this15.unwrappedContents || key.indexOf(prefix) >= 0 && !_this15.unwrappedContents.hasOwnProperty(key);
            }).map(function (key) {
                var valueSchema = schema.getProperty(key);
                var proposal = {};
                proposal.description = valueSchema.getDescription();
                proposal.type = 'property';
                proposal.displayText = key;
                proposal.rightLabel = valueSchema.getDisplayType();
                if (isBetweenQuotes) {
                    proposal.text = key;
                } else {
                    var value = schema.getProperty(key).accept(_this15.snippetVisitor, request);
                    proposal.snippet = '"' + key + '": ' + value;
                }
                return proposal;
            });
        }
    }, {
        key: 'visitCompositeSchema',
        value: function visitCompositeSchema(schema, request) {
            var _this16 = this;

            var proposals = schema.getSchemas().filter(function (s) {
                return s instanceof json_schema_1.ObjectSchema;
            }).map(function (s) {
                return s.accept(_this16, request);
            });
            return lodash_1.flatten(proposals);
        }
    }, {
        key: 'visitAllOfSchema',
        value: function visitAllOfSchema(schema, request) {
            return this.visitCompositeSchema(schema, request);
        }
    }, {
        key: 'visitAnyOfSchema',
        value: function visitAnyOfSchema(schema, request) {
            return this.visitCompositeSchema(schema, request);
        }
    }, {
        key: 'visitOneOfSchema',
        value: function visitOneOfSchema(schema, request) {
            return this.visitCompositeSchema(schema, request);
        }
    }]);

    return KeyProposalVisitor;
}(DefaultSchemaVisitor);

exports.KeyProposalVisitor = KeyProposalVisitor;