import {assign, clone, isEmpty, isArray, isObject, memoize, flatten} from 'lodash';
import {ISchemaVisitor, SchemaFlattenerVisitor, SchemaInspectorVisitor} from './json-schema-visitors';
import * as fs from 'fs';
const uri = require('uri-js');

type Dictionary<T> = { [key: string]: T };
type ResolverFn = (schema: any, parent: BaseSchema) => BaseSchema

interface ISchemaVisitee {
  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R;
}

const resolveRef:(schema: Object, segments: Array<string>) => Object = <any>memoize(function (schema: Object, segments: Array<string>): Object {
  if (isEmpty(segments)) {
    return schema;
  }
  const [key, ...tail] = segments;
  const subSchema = schema[key];
  return resolveRef(subSchema, tail);
});

function resolver(root: SchemaRoot): ResolverFn {
  return function(schema: any, parent: BaseSchema): BaseSchema {
    if (!schema) {
      console.warn(`${schema} schema found`);
      return new AnySchema({}, parent, root);
    }
    
    let resolve: ResolverFn = null;
    if (schema.$ref) {
      const {scheme, path, fragment} = uri.parse(schema.$ref);
      const segments = fragment.split('/').slice(1);
      // TODO handle http scheme
      if (scheme === 'file') {
        schema = resolveRef(JSON.parse(fs.readFileSync(path).toString()), segments);
        resolve = resolver(new SchemaRoot(schema));
      } else {
        schema = resolveRef(root.getSchemaObject(), segments);
      }
    }

    if (isArray(schema.type)) {
      const childSchemas = schema.type.map((type: string) => assign(clone(schema), { type }));
      schema = {
        oneOf: childSchemas
      }
    }

    if (!schema.allOf && !schema.anyOf && !schema.oneOf) {
      if (schema.type === 'object' || (isObject(schema.properties) && !schema.type)) {
        return new ObjectSchema(schema, parent, root, resolve);
      }
      else if (schema.type === 'array' || (isObject(schema.items) && !schema.type)) {
        return new ArraySchema(schema, parent, root, resolve);
      }
    }

    if (isArray(schema.oneOf)) {
      return new OneOfSchema(schema, parent, root, resolve);
    } else if (isArray(schema.anyOf)) {
      return new AnyOfSchema(schema, parent, root, resolve);
    } else if (isArray(schema.allOf)) {
      return new AllOfSchema(schema, parent, root, resolve);
    } else if (isObject(schema.enum)) {
      return new EnumSchema(schema, parent, root, resolve);
    }

    switch (schema.type) {
      case 'boolean': return new BooleanSchema(schema, parent, root, resolve);
      case 'number': return new NumberSchema(schema, parent, root, resolve);
      case 'integer': return new NumberSchema(schema, parent, root, resolve);
      case 'string': return new StringSchema(schema, parent, root, resolve);
      case 'null': return new NullSchema(schema, parent, root, resolve);
    }
    console.warn(`Illegal schema part: ${JSON.stringify(schema)}`)
    return new AnySchema({}, parent, root, resolve);
  }
}

export class SchemaRoot {
  private schemaRoot: Object;
  private schema: BaseSchema;

  getSchema(): BaseSchema {
    return this.schema;
  }
  
  getSchemaObject() {
    return this.schemaRoot;
  }

  constructor(schemaRoot: Object) {
    this.schemaRoot = schemaRoot;
    this.schema = resolver(this)(schemaRoot, null);
  }

  getExpandedSchemas(schema: BaseSchema) {
    if (schema instanceof CompositeSchema) {
      const schemas: Array<BaseSchema> = [];
      schema.accept(new SchemaFlattenerVisitor(), schemas);
      return schemas;
    }
    return [schema];
  }
  
  getPossibleTypes(segments: Array<number | string>) {
    if (segments.length === 0) {
      return this.getExpandedSchemas(this.getSchema());
    }
    const visitor = new SchemaInspectorVisitor();
    return segments.reduce((schemas: Array<BaseSchema>, segment: string) => {
      const resolvedNextSchemas = schemas.map(schema => this.getExpandedSchemas(schema));
      const nextSchemas = flatten(resolvedNextSchemas).map(schema => schema.accept(visitor, segment));
      return flatten(nextSchemas);
    }, [this.getSchema()]);
  }
}

export abstract class BaseSchema implements ISchemaVisitee {
  constructor(
    protected schema: any, 
    private parent: BaseSchema, 
    private schemaRoot: SchemaRoot,
    protected resolve: ResolverFn = null
  ) { 
    this.resolve = resolve || resolver(schemaRoot);
  }

  getParent(): BaseSchema {
    return this.parent;
  }

  getSchemaRoot() {
    return this.schemaRoot;
  }

  getDescription(): string {
    return this.schema.description;
  }

  abstract accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R;
  abstract getDefaultValue(): any;
  abstract getDisplayType(): string;
}

export class PatternProperty {
  constructor(private pattern: RegExp, private schema: BaseSchema) {}
  
  getPattern(): RegExp {
    return this.pattern;
  }
  
  getSchema(): BaseSchema {
    return this.schema;
  }
}

export class ObjectSchema extends BaseSchema {
  private keys: Array<string>;
  private properties: Dictionary<BaseSchema>;
  private patternProperties: Array<PatternProperty>;

  constructor(schema: Object, parent: BaseSchema, schemaRoot: SchemaRoot, resolve: ResolverFn = null) {
    super(schema, parent, schemaRoot, resolve);
    const properties = this.schema.properties || {};
    const patternProperties = this.schema.patternProperties || {};
    this.keys = Object.keys(properties);
    this.properties = this.keys.reduce((object, key) => {
      object[key] = this.resolve(properties[key], this)
      return object;
    }, <Dictionary<BaseSchema>>{});
    this.patternProperties = Object.keys(patternProperties)
      .map(key => [key, patternProperties[key]])
      .map(([pattern, rawSchema]) => new PatternProperty(new RegExp(pattern, 'g'), this.resolve(rawSchema, this)));
  }
  getKeys() {
    return this.keys;
  }

  getProperty(name: string) {
    return this.properties[name] || null;
  }

  getProperties() {
    return this.properties;
  }
  
  getPatternProperties(): Array<PatternProperty> {
    return this.patternProperties;
  }

  getDefaultValue(): Object {
    return this.schema['default'] || null;
  }

  getDisplayType() {
    return 'object';
  }

  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitObjectSchema(this, parameter);
  }
}

export class ArraySchema extends BaseSchema {
  private itemSchema: BaseSchema;

  constructor(schema: Object, parent: BaseSchema, schemaRoot: SchemaRoot, resolve: ResolverFn = null) {
    super(schema, parent, schemaRoot);
    this.itemSchema = this.resolve(this.schema.items, this)
  }

  getItemSchema() {
    return this.itemSchema;
  }

  getDefaultValue(): Array<any> {
    return this.schema['default'] || null;
  }

  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitArraySchema(this, parameter);
  }

  hasUniqueItems(): boolean {
    return !!(this.schema.uniqueItems || false);
  }

  getDisplayType() {
    const itemSchemaType = this.getItemSchema() && this.getItemSchema().getDisplayType()
      ? this.getItemSchema().getDisplayType()
      : 'any';
    return itemSchemaType.split('|').map(t => `${t.trim()}[]`).join(' | ');
  }
}

export class EnumSchema extends BaseSchema {
  getValues(): Array<string> {
    return this.schema.enum;
  }

  getDefaultValue(): string {
    return this.schema['default'] || null;
  }

  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitEnumSchema(this, parameter);
  }

  getDisplayType() {
    return 'enum';
  }
}

export abstract class CompositeSchema extends BaseSchema {
  private schemas: Array<BaseSchema>;
  constructor(schema: Object, parent: BaseSchema, schemaRoot: SchemaRoot, keyWord: string, resolve: ResolverFn = null) {
    super(schema, parent, schemaRoot, resolve);
    this.schemas = schema[keyWord].map((schema: any) => this.resolve(schema, this));
  }

  getSchemas() {
    return this.schemas;
  }

  getDefaultValue(): any {
    return null;
  }

  getDisplayType() {
    return this.getSchemas().map(s => s.getDisplayType()).join(' | ');
  }

  abstract accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R;
}

export class AnyOfSchema extends CompositeSchema {
  constructor(schema: Object, parent: BaseSchema, schemaRoot: SchemaRoot, resolve: ResolverFn = null) {
    super(schema, parent, schemaRoot, 'anyOf', resolve);
  }

  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitAnyOfSchema(this, parameter);
  }
}

export class AllOfSchema extends CompositeSchema {
  constructor(schema: Object, parent: BaseSchema, schemaRoot: SchemaRoot, resolve: ResolverFn = null) {
    super(schema, parent, schemaRoot, 'allOf', resolve);
  }

  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitAllOfSchema(this, parameter);
  }
}

export class OneOfSchema extends CompositeSchema {
  constructor(schema: Object, parent: BaseSchema, schemaRoot: SchemaRoot, resolve: ResolverFn = null) {
    super(schema, parent, schemaRoot, 'oneOf', resolve);
  }

  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitOneOfSchema(this, parameter);
  }
}

export class NullSchema extends BaseSchema {
  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitNullSchema(this, parameter);
  }

  getDefaultValue(): any {
    return null;
  }

  getDisplayType() {
    return 'null';
  }
}

export class StringSchema extends BaseSchema {
  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitStringSchema(this, parameter);
  }

  getDefaultValue(): string {
    return this.schema['default'] || null
  }

  getDisplayType() {
    return 'string';
  }
}

export class NumberSchema extends BaseSchema {
  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitNumberSchema(this, parameter);
  }

  getDefaultValue(): number {
    return this.schema['default'] || null
  }

  getDisplayType() {
    return 'number';
  }
}

export class BooleanSchema extends BaseSchema {
  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitBooleanSchema(this, parameter);
  }

  getDefaultValue(): boolean {
    return this.schema['default'] || null
  }

  getDisplayType() {
    return 'boolean';
  }
}

export class AnySchema extends BaseSchema {
  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitAnySchema(this, parameter);
  }

  getDefaultValue(): boolean {
    return null
  }

  getDisplayType() {
    return 'any';
  }
}
