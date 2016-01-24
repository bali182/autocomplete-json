var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lodash_1 = require('lodash');
var json_schema_visitors_1 = require('./json-schema-visitors');
var SchemaRoot = (function () {
    function SchemaRoot(schemaRoot) {
        var _this = this;
        this.schemaRoot = schemaRoot;
        this.resolveRef = lodash_1.memoize(function (path) {
            var segments = path.split('/');
            function resolveInternal(partialSchema, refSegments) {
                if (lodash_1.isEmpty(refSegments)) {
                    return partialSchema;
                }
                var key = refSegments[0], tail = refSegments.slice(1);
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
    SchemaRoot.prototype.getSchema = function () {
        return this.schema;
    };
    SchemaRoot.prototype.wrap = function (schema, parent) {
        if (!schema) {
            console.warn(schema + " schema found");
            return new AnySchema({}, parent, this);
        }
        if (schema.$ref) {
            schema = this.resolveRef(schema.$ref);
        }
        if (lodash_1.isArray(schema.type)) {
            var childSchemas = schema.type.map(function (type) { return lodash_1.assign(lodash_1.clone(schema), { type: type }); });
            schema = {
                oneOf: childSchemas
            };
        }
        if (!schema.allOf && !schema.anyOf && !schema.oneOf) {
            if (schema.type === 'object' || (lodash_1.isObject(schema.properties) && !schema.type)) {
                return new ObjectSchema(schema, parent, this);
            }
            else if (schema.type === 'array' || (lodash_1.isObject(schema.items) && !schema.type)) {
                return new ArraySchema(schema, parent, this);
            }
        }
        if (lodash_1.isArray(schema.oneOf)) {
            return new OneOfSchema(schema, parent, this);
        }
        else if (lodash_1.isArray(schema.anyOf)) {
            return new AnyOfSchema(schema, parent, this);
        }
        else if (lodash_1.isArray(schema.allOf)) {
            return new AllOfSchema(schema, parent, this);
        }
        else if (lodash_1.isObject(schema.enum)) {
            return new EnumSchema(schema, parent, this);
        }
        switch (schema.type) {
            case 'boolean': return new BooleanSchema(schema, parent, this);
            case 'number': return new NumberSchema(schema, parent, this);
            case 'integer': return new NumberSchema(schema, parent, this);
            case 'string': return new StringSchema(schema, parent, this);
            case 'null': return new NullSchema(schema, parent, this);
        }
        console.warn("Illegal schema part: " + JSON.stringify(schema));
        return new AnySchema({}, parent, this);
    };
    SchemaRoot.prototype.getPossibleTypes = function (segments) {
        var _this = this;
        if (segments.length === 0) {
            return this.getExpandedSchemas(this.getSchema());
        }
        var visitor = new json_schema_visitors_1.SchemaInspectorVisitor();
        return segments.reduce(function (schemas, segment) {
            var resolvedNextSchemas = schemas.map(function (schema) { return _this.getExpandedSchemas(schema); });
            var nextSchemas = lodash_1.flatten(resolvedNextSchemas).map(function (schema) { return schema.accept(visitor, segment); });
            return lodash_1.flatten(nextSchemas);
        }, [this.getSchema()]);
    };
    SchemaRoot.prototype.getExpandedSchemas = function (schema) {
        if (schema instanceof CompositeSchema) {
            var schemas = [];
            schema.accept(new json_schema_visitors_1.SchemaFlattenerVisitor(), schemas);
            return schemas;
        }
        return [schema];
    };
    return SchemaRoot;
})();
exports.SchemaRoot = SchemaRoot;
var BaseSchema = (function () {
    function BaseSchema(schema, parent, schemaRoot) {
        this.schema = schema;
        this.parent = parent;
        this.schemaRoot = schemaRoot;
    }
    BaseSchema.prototype.getParent = function () {
        return this.parent;
    };
    BaseSchema.prototype.getSchemaRoot = function () {
        return this.schemaRoot;
    };
    BaseSchema.prototype.getDescription = function () {
        return this.schema.description;
    };
    return BaseSchema;
})();
exports.BaseSchema = BaseSchema;
var ObjectSchema = (function (_super) {
    __extends(ObjectSchema, _super);
    function ObjectSchema(schema, parent, schemaRoot) {
        var _this = this;
        _super.call(this, schema, parent, schemaRoot);
        var properties = this.schema.properties || {};
        this.keys = Object.keys(properties);
        this.properties = this.keys.reduce(function (object, key) {
            object[key] = _this.getSchemaRoot().wrap(properties[key], _this);
            return object;
        }, {});
    }
    ObjectSchema.prototype.getKeys = function () {
        return this.keys;
    };
    ObjectSchema.prototype.getProperty = function (name) {
        return this.properties[name] || null;
    };
    ObjectSchema.prototype.getProperties = function () {
        return this.properties;
    };
    ObjectSchema.prototype.getDefaultValue = function () {
        return this.schema['default'] || null;
    };
    ObjectSchema.prototype.getDisplayType = function () {
        return 'object';
    };
    ObjectSchema.prototype.accept = function (visitor, parameter) {
        return visitor.visitObjectSchema(this, parameter);
    };
    return ObjectSchema;
})(BaseSchema);
exports.ObjectSchema = ObjectSchema;
var ArraySchema = (function (_super) {
    __extends(ArraySchema, _super);
    function ArraySchema(schema, parent, schemaRoot) {
        _super.call(this, schema, parent, schemaRoot);
        this.itemSchema = this.getSchemaRoot().wrap(this.schema.items, this);
    }
    ArraySchema.prototype.getItemSchema = function () {
        return this.itemSchema;
    };
    ArraySchema.prototype.getDefaultValue = function () {
        return this.schema['default'] || null;
    };
    ArraySchema.prototype.accept = function (visitor, parameter) {
        return visitor.visitArraySchema(this, parameter);
    };
    ArraySchema.prototype.hasUniqueItems = function () {
        return !!(this.schema.uniqueItems || false);
    };
    ArraySchema.prototype.getDisplayType = function () {
        var itemSchemaType = this.getItemSchema() && this.getItemSchema().getDisplayType()
            ? this.getItemSchema().getDisplayType()
            : 'any';
        return itemSchemaType.split('|').map(function (t) { return (t.trim() + "[]"); }).join(' | ');
    };
    return ArraySchema;
})(BaseSchema);
exports.ArraySchema = ArraySchema;
var EnumSchema = (function (_super) {
    __extends(EnumSchema, _super);
    function EnumSchema() {
        _super.apply(this, arguments);
    }
    EnumSchema.prototype.getValues = function () {
        return this.schema.enum;
    };
    EnumSchema.prototype.getDefaultValue = function () {
        return this.schema['default'] || null;
    };
    EnumSchema.prototype.accept = function (visitor, parameter) {
        return visitor.visitEnumSchema(this, parameter);
    };
    EnumSchema.prototype.getDisplayType = function () {
        return 'enum';
    };
    return EnumSchema;
})(BaseSchema);
exports.EnumSchema = EnumSchema;
var CompositeSchema = (function (_super) {
    __extends(CompositeSchema, _super);
    function CompositeSchema(schema, parent, schemaRoot, keyWord) {
        var _this = this;
        _super.call(this, schema, parent, schemaRoot);
        this.schemas = schema[keyWord].map(function (schema) { return _this.getSchemaRoot().wrap(schema, _this); });
    }
    CompositeSchema.prototype.getSchemas = function () {
        return this.schemas;
    };
    CompositeSchema.prototype.getDefaultValue = function () {
        return null;
    };
    CompositeSchema.prototype.getDisplayType = function () {
        return this.getSchemas().map(function (s) { return s.getDisplayType(); }).join(' | ');
    };
    return CompositeSchema;
})(BaseSchema);
exports.CompositeSchema = CompositeSchema;
var AnyOfSchema = (function (_super) {
    __extends(AnyOfSchema, _super);
    function AnyOfSchema(schema, parent, schemaRoot) {
        _super.call(this, schema, parent, schemaRoot, 'anyOf');
    }
    AnyOfSchema.prototype.accept = function (visitor, parameter) {
        return visitor.visitAnyOfSchema(this, parameter);
    };
    return AnyOfSchema;
})(CompositeSchema);
exports.AnyOfSchema = AnyOfSchema;
var AllOfSchema = (function (_super) {
    __extends(AllOfSchema, _super);
    function AllOfSchema(schema, parent, schemaRoot) {
        _super.call(this, schema, parent, schemaRoot, 'allOf');
    }
    AllOfSchema.prototype.accept = function (visitor, parameter) {
        return visitor.visitAllOfSchema(this, parameter);
    };
    return AllOfSchema;
})(CompositeSchema);
exports.AllOfSchema = AllOfSchema;
var OneOfSchema = (function (_super) {
    __extends(OneOfSchema, _super);
    function OneOfSchema(schema, parent, schemaRoot) {
        _super.call(this, schema, parent, schemaRoot, 'oneOf');
    }
    OneOfSchema.prototype.accept = function (visitor, parameter) {
        return visitor.visitOneOfSchema(this, parameter);
    };
    return OneOfSchema;
})(CompositeSchema);
exports.OneOfSchema = OneOfSchema;
var NullSchema = (function (_super) {
    __extends(NullSchema, _super);
    function NullSchema() {
        _super.apply(this, arguments);
    }
    NullSchema.prototype.accept = function (visitor, parameter) {
        return visitor.visitNullSchema(this, parameter);
    };
    NullSchema.prototype.getDefaultValue = function () {
        return null;
    };
    NullSchema.prototype.getDisplayType = function () {
        return 'null';
    };
    return NullSchema;
})(BaseSchema);
exports.NullSchema = NullSchema;
var StringSchema = (function (_super) {
    __extends(StringSchema, _super);
    function StringSchema() {
        _super.apply(this, arguments);
    }
    StringSchema.prototype.accept = function (visitor, parameter) {
        return visitor.visitStringSchema(this, parameter);
    };
    StringSchema.prototype.getDefaultValue = function () {
        return this.schema['default'] || null;
    };
    StringSchema.prototype.getDisplayType = function () {
        return 'string';
    };
    return StringSchema;
})(BaseSchema);
exports.StringSchema = StringSchema;
var NumberSchema = (function (_super) {
    __extends(NumberSchema, _super);
    function NumberSchema() {
        _super.apply(this, arguments);
    }
    NumberSchema.prototype.accept = function (visitor, parameter) {
        return visitor.visitNumberSchema(this, parameter);
    };
    NumberSchema.prototype.getDefaultValue = function () {
        return this.schema['default'] || null;
    };
    NumberSchema.prototype.getDisplayType = function () {
        return 'number';
    };
    return NumberSchema;
})(BaseSchema);
exports.NumberSchema = NumberSchema;
var BooleanSchema = (function (_super) {
    __extends(BooleanSchema, _super);
    function BooleanSchema() {
        _super.apply(this, arguments);
    }
    BooleanSchema.prototype.accept = function (visitor, parameter) {
        return visitor.visitBooleanSchema(this, parameter);
    };
    BooleanSchema.prototype.getDefaultValue = function () {
        return this.schema['default'] || null;
    };
    BooleanSchema.prototype.getDisplayType = function () {
        return 'boolean';
    };
    return BooleanSchema;
})(BaseSchema);
exports.BooleanSchema = BooleanSchema;
var AnySchema = (function (_super) {
    __extends(AnySchema, _super);
    function AnySchema() {
        _super.apply(this, arguments);
    }
    AnySchema.prototype.accept = function (visitor, parameter) {
        return visitor.visitAnySchema(this, parameter);
    };
    AnySchema.prototype.getDefaultValue = function () {
        return null;
    };
    AnySchema.prototype.getDisplayType = function () {
        return 'any';
    };
    return AnySchema;
})(BaseSchema);
exports.AnySchema = AnySchema;
