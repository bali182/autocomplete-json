"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var lodash_1 = require('lodash');
var json_schema_visitors_1 = require('./json-schema-visitors');

var SchemaRoot = function () {
    function SchemaRoot(schemaRoot) {
        var _this = this;

        _classCallCheck(this, SchemaRoot);

        this.schemaRoot = schemaRoot;
        this.resolveRef = lodash_1.memoize(function (path) {
            var segments = path.split('/');
            function resolveInternal(partialSchema, refSegments) {
                if (lodash_1.isEmpty(refSegments)) {
                    return partialSchema;
                }

                var _refSegments = _toArray(refSegments);

                var key = _refSegments[0];

                var tail = _refSegments.slice(1);

                if (key === '#') {
                    return resolveInternal(partialSchema, tail);
                }
                var subSchema = partialSchema[key];
                return resolveInternal(subSchema, tail);
            }
            return resolveInternal(_this.schemaRoot, segments);
        });
        this.schema = this.wrap(schemaRoot, null);
    }

    _createClass(SchemaRoot, [{
        key: 'getSchema',
        value: function getSchema() {
            return this.schema;
        }
    }, {
        key: 'wrap',
        value: function wrap(schema, parent) {
            if (!schema) {
                console.warn(schema + ' schema found');
                return new AnySchema({}, parent, this);
            }
            if (schema.$ref) {
                schema = this.resolveRef(schema.$ref);
            }
            if (lodash_1.isArray(schema.type)) {
                var childSchemas = schema.type.map(function (type) {
                    return lodash_1.assign(lodash_1.clone(schema), { type: type });
                });
                schema = {
                    oneOf: childSchemas
                };
            }
            if (!schema.allOf && !schema.anyOf && !schema.oneOf) {
                if (schema.type === 'object' || lodash_1.isObject(schema.properties) && !schema.type) {
                    return new ObjectSchema(schema, parent, this);
                } else if (schema.type === 'array' || lodash_1.isObject(schema.items) && !schema.type) {
                    return new ArraySchema(schema, parent, this);
                }
            }
            if (lodash_1.isArray(schema.oneOf)) {
                return new OneOfSchema(schema, parent, this);
            } else if (lodash_1.isArray(schema.anyOf)) {
                return new AnyOfSchema(schema, parent, this);
            } else if (lodash_1.isArray(schema.allOf)) {
                return new AllOfSchema(schema, parent, this);
            } else if (lodash_1.isObject(schema.enum)) {
                return new EnumSchema(schema, parent, this);
            }
            switch (schema.type) {
                case 'boolean':
                    return new BooleanSchema(schema, parent, this);
                case 'number':
                    return new NumberSchema(schema, parent, this);
                case 'integer':
                    return new NumberSchema(schema, parent, this);
                case 'string':
                    return new StringSchema(schema, parent, this);
                case 'null':
                    return new NullSchema(schema, parent, this);
            }
            console.warn('Illegal schema part: ' + JSON.stringify(schema));
            return new AnySchema({}, parent, this);
        }
    }, {
        key: 'getPossibleTypes',
        value: function getPossibleTypes(segments) {
            var _this2 = this;

            if (segments.length === 0) {
                return this.getExpandedSchemas(this.getSchema());
            }
            var visitor = new json_schema_visitors_1.SchemaInspectorVisitor();
            return segments.reduce(function (schemas, segment) {
                var resolvedNextSchemas = schemas.map(function (schema) {
                    return _this2.getExpandedSchemas(schema);
                });
                var nextSchemas = lodash_1.flatten(resolvedNextSchemas).map(function (schema) {
                    return schema.accept(visitor, segment);
                });
                return lodash_1.flatten(nextSchemas);
            }, [this.getSchema()]);
        }
    }, {
        key: 'getExpandedSchemas',
        value: function getExpandedSchemas(schema) {
            if (schema instanceof CompositeSchema) {
                var schemas = [];
                schema.accept(new json_schema_visitors_1.SchemaFlattenerVisitor(), schemas);
                return schemas;
            }
            return [schema];
        }
    }]);

    return SchemaRoot;
}();

exports.SchemaRoot = SchemaRoot;

var BaseSchema = function () {
    function BaseSchema(schema, parent, schemaRoot) {
        _classCallCheck(this, BaseSchema);

        this.schema = schema;
        this.parent = parent;
        this.schemaRoot = schemaRoot;
    }

    _createClass(BaseSchema, [{
        key: 'getParent',
        value: function getParent() {
            return this.parent;
        }
    }, {
        key: 'getSchemaRoot',
        value: function getSchemaRoot() {
            return this.schemaRoot;
        }
    }, {
        key: 'getDescription',
        value: function getDescription() {
            return this.schema.description;
        }
    }]);

    return BaseSchema;
}();

exports.BaseSchema = BaseSchema;

var PatternProperty = function () {
    function PatternProperty(pattern, schema) {
        _classCallCheck(this, PatternProperty);

        this.pattern = pattern;
        this.schema = schema;
    }

    _createClass(PatternProperty, [{
        key: 'getPattern',
        value: function getPattern() {
            return this.pattern;
        }
    }, {
        key: 'getSchema',
        value: function getSchema() {
            return this.schema;
        }
    }]);

    return PatternProperty;
}();

exports.PatternProperty = PatternProperty;

var ObjectSchema = function (_BaseSchema) {
    _inherits(ObjectSchema, _BaseSchema);

    function ObjectSchema(schema, parent, schemaRoot) {
        _classCallCheck(this, ObjectSchema);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(ObjectSchema).call(this, schema, parent, schemaRoot));

        var properties = _this3.schema.properties || {};
        var patternProperties = _this3.schema.patternProperties || {};
        _this3.keys = Object.keys(properties);
        _this3.properties = _this3.keys.reduce(function (object, key) {
            object[key] = _this3.getSchemaRoot().wrap(properties[key], _this3);
            return object;
        }, {});
        _this3.patternProperties = Object.keys(patternProperties).map(function (key) {
            return [key, patternProperties[key]];
        }).map(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2);

            var pattern = _ref2[0];
            var rawSchema = _ref2[1];
            return new PatternProperty(new RegExp(pattern, 'g'), _this3.getSchemaRoot().wrap(rawSchema, _this3));
        });
        return _this3;
    }

    _createClass(ObjectSchema, [{
        key: 'getKeys',
        value: function getKeys() {
            return this.keys;
        }
    }, {
        key: 'getProperty',
        value: function getProperty(name) {
            return this.properties[name] || null;
        }
    }, {
        key: 'getProperties',
        value: function getProperties() {
            return this.properties;
        }
    }, {
        key: 'getPatternProperties',
        value: function getPatternProperties() {
            return this.patternProperties;
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.schema['default'] || null;
        }
    }, {
        key: 'getDisplayType',
        value: function getDisplayType() {
            return 'object';
        }
    }, {
        key: 'accept',
        value: function accept(visitor, parameter) {
            return visitor.visitObjectSchema(this, parameter);
        }
    }]);

    return ObjectSchema;
}(BaseSchema);

exports.ObjectSchema = ObjectSchema;

var ArraySchema = function (_BaseSchema2) {
    _inherits(ArraySchema, _BaseSchema2);

    function ArraySchema(schema, parent, schemaRoot) {
        _classCallCheck(this, ArraySchema);

        var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(ArraySchema).call(this, schema, parent, schemaRoot));

        _this4.itemSchema = _this4.getSchemaRoot().wrap(_this4.schema.items, _this4);
        return _this4;
    }

    _createClass(ArraySchema, [{
        key: 'getItemSchema',
        value: function getItemSchema() {
            return this.itemSchema;
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.schema['default'] || null;
        }
    }, {
        key: 'accept',
        value: function accept(visitor, parameter) {
            return visitor.visitArraySchema(this, parameter);
        }
    }, {
        key: 'hasUniqueItems',
        value: function hasUniqueItems() {
            return !!(this.schema.uniqueItems || false);
        }
    }, {
        key: 'getDisplayType',
        value: function getDisplayType() {
            var itemSchemaType = this.getItemSchema() && this.getItemSchema().getDisplayType() ? this.getItemSchema().getDisplayType() : 'any';
            return itemSchemaType.split('|').map(function (t) {
                return t.trim() + '[]';
            }).join(' | ');
        }
    }]);

    return ArraySchema;
}(BaseSchema);

exports.ArraySchema = ArraySchema;

var EnumSchema = function (_BaseSchema3) {
    _inherits(EnumSchema, _BaseSchema3);

    function EnumSchema() {
        _classCallCheck(this, EnumSchema);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(EnumSchema).apply(this, arguments));
    }

    _createClass(EnumSchema, [{
        key: 'getValues',
        value: function getValues() {
            return this.schema.enum;
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.schema['default'] || null;
        }
    }, {
        key: 'accept',
        value: function accept(visitor, parameter) {
            return visitor.visitEnumSchema(this, parameter);
        }
    }, {
        key: 'getDisplayType',
        value: function getDisplayType() {
            return 'enum';
        }
    }]);

    return EnumSchema;
}(BaseSchema);

exports.EnumSchema = EnumSchema;

var CompositeSchema = function (_BaseSchema4) {
    _inherits(CompositeSchema, _BaseSchema4);

    function CompositeSchema(schema, parent, schemaRoot, keyWord) {
        _classCallCheck(this, CompositeSchema);

        var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(CompositeSchema).call(this, schema, parent, schemaRoot));

        _this6.schemas = schema[keyWord].map(function (schema) {
            return _this6.getSchemaRoot().wrap(schema, _this6);
        });
        return _this6;
    }

    _createClass(CompositeSchema, [{
        key: 'getSchemas',
        value: function getSchemas() {
            return this.schemas;
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return null;
        }
    }, {
        key: 'getDisplayType',
        value: function getDisplayType() {
            return this.getSchemas().map(function (s) {
                return s.getDisplayType();
            }).join(' | ');
        }
    }]);

    return CompositeSchema;
}(BaseSchema);

exports.CompositeSchema = CompositeSchema;

var AnyOfSchema = function (_CompositeSchema) {
    _inherits(AnyOfSchema, _CompositeSchema);

    function AnyOfSchema(schema, parent, schemaRoot) {
        _classCallCheck(this, AnyOfSchema);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(AnyOfSchema).call(this, schema, parent, schemaRoot, 'anyOf'));
    }

    _createClass(AnyOfSchema, [{
        key: 'accept',
        value: function accept(visitor, parameter) {
            return visitor.visitAnyOfSchema(this, parameter);
        }
    }]);

    return AnyOfSchema;
}(CompositeSchema);

exports.AnyOfSchema = AnyOfSchema;

var AllOfSchema = function (_CompositeSchema2) {
    _inherits(AllOfSchema, _CompositeSchema2);

    function AllOfSchema(schema, parent, schemaRoot) {
        _classCallCheck(this, AllOfSchema);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(AllOfSchema).call(this, schema, parent, schemaRoot, 'allOf'));
    }

    _createClass(AllOfSchema, [{
        key: 'accept',
        value: function accept(visitor, parameter) {
            return visitor.visitAllOfSchema(this, parameter);
        }
    }]);

    return AllOfSchema;
}(CompositeSchema);

exports.AllOfSchema = AllOfSchema;

var OneOfSchema = function (_CompositeSchema3) {
    _inherits(OneOfSchema, _CompositeSchema3);

    function OneOfSchema(schema, parent, schemaRoot) {
        _classCallCheck(this, OneOfSchema);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(OneOfSchema).call(this, schema, parent, schemaRoot, 'oneOf'));
    }

    _createClass(OneOfSchema, [{
        key: 'accept',
        value: function accept(visitor, parameter) {
            return visitor.visitOneOfSchema(this, parameter);
        }
    }]);

    return OneOfSchema;
}(CompositeSchema);

exports.OneOfSchema = OneOfSchema;

var NullSchema = function (_BaseSchema5) {
    _inherits(NullSchema, _BaseSchema5);

    function NullSchema() {
        _classCallCheck(this, NullSchema);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(NullSchema).apply(this, arguments));
    }

    _createClass(NullSchema, [{
        key: 'accept',
        value: function accept(visitor, parameter) {
            return visitor.visitNullSchema(this, parameter);
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return null;
        }
    }, {
        key: 'getDisplayType',
        value: function getDisplayType() {
            return 'null';
        }
    }]);

    return NullSchema;
}(BaseSchema);

exports.NullSchema = NullSchema;

var StringSchema = function (_BaseSchema6) {
    _inherits(StringSchema, _BaseSchema6);

    function StringSchema() {
        _classCallCheck(this, StringSchema);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(StringSchema).apply(this, arguments));
    }

    _createClass(StringSchema, [{
        key: 'accept',
        value: function accept(visitor, parameter) {
            return visitor.visitStringSchema(this, parameter);
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.schema['default'] || null;
        }
    }, {
        key: 'getDisplayType',
        value: function getDisplayType() {
            return 'string';
        }
    }]);

    return StringSchema;
}(BaseSchema);

exports.StringSchema = StringSchema;

var NumberSchema = function (_BaseSchema7) {
    _inherits(NumberSchema, _BaseSchema7);

    function NumberSchema() {
        _classCallCheck(this, NumberSchema);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(NumberSchema).apply(this, arguments));
    }

    _createClass(NumberSchema, [{
        key: 'accept',
        value: function accept(visitor, parameter) {
            return visitor.visitNumberSchema(this, parameter);
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.schema['default'] || null;
        }
    }, {
        key: 'getDisplayType',
        value: function getDisplayType() {
            return 'number';
        }
    }]);

    return NumberSchema;
}(BaseSchema);

exports.NumberSchema = NumberSchema;

var BooleanSchema = function (_BaseSchema8) {
    _inherits(BooleanSchema, _BaseSchema8);

    function BooleanSchema() {
        _classCallCheck(this, BooleanSchema);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(BooleanSchema).apply(this, arguments));
    }

    _createClass(BooleanSchema, [{
        key: 'accept',
        value: function accept(visitor, parameter) {
            return visitor.visitBooleanSchema(this, parameter);
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return this.schema['default'] || null;
        }
    }, {
        key: 'getDisplayType',
        value: function getDisplayType() {
            return 'boolean';
        }
    }]);

    return BooleanSchema;
}(BaseSchema);

exports.BooleanSchema = BooleanSchema;

var AnySchema = function (_BaseSchema9) {
    _inherits(AnySchema, _BaseSchema9);

    function AnySchema() {
        _classCallCheck(this, AnySchema);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(AnySchema).apply(this, arguments));
    }

    _createClass(AnySchema, [{
        key: 'accept',
        value: function accept(visitor, parameter) {
            return visitor.visitAnySchema(this, parameter);
        }
    }, {
        key: 'getDefaultValue',
        value: function getDefaultValue() {
            return null;
        }
    }, {
        key: 'getDisplayType',
        value: function getDisplayType() {
            return 'any';
        }
    }]);

    return AnySchema;
}(BaseSchema);

exports.AnySchema = AnySchema;