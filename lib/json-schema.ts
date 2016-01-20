import {assign, clone, isEmpty, isArray, isObject, memoize, flatten} from 'lodash';

type Dictionary<T> = { [key: string]: T };

export interface ISchemaVisitor<P, R> {
  visitObjectSchema(schema: ObjectSchema, parameter: P): R
  visitArraySchema(schema: ArraySchema, parameter: P): R
  visitEnumSchema(schema: EnumSchema, parameter: P): R
  visitStringSchema(schema: StringSchema, parameter: P): R
  visitNumberSchema(schema: NumberSchema, parameter: P): R
  visitBooleanSchema(schema: BooleanSchema, parameter: P): R
  visitOneOfSchema(schema: OneOfSchema, parameter: P): R
  visitAllOfSchema(schema: AllOfSchema, parameter: P): R
  visitAnyOfSchema(schema: AnyOfSchema, parameter: P): R
  visitNullSchema(schema: NullSchema, parameter: P): R
  visitAnySchema(schema: AnySchema, parameter: P): R
}

export abstract class DefaultSchemaVisitor<P, R> implements ISchemaVisitor<P, R>{
  constructor(protected defaultVisit: (schema: BaseSchema, parameter: P) => R) { }
  visitObjectSchema(schema: ObjectSchema, parameter: P): R { return this.defaultVisit(schema, parameter) }
  visitArraySchema(schema: ArraySchema, parameter: P): R { return this.defaultVisit(schema, parameter) }
  visitEnumSchema(schema: EnumSchema, parameter: P): R { return this.defaultVisit(schema, parameter) }
  visitStringSchema(schema: StringSchema, parameter: P): R { return this.defaultVisit(schema, parameter) }
  visitNumberSchema(schema: NumberSchema, parameter: P): R { return this.defaultVisit(schema, parameter) }
  visitBooleanSchema(schema: BooleanSchema, parameter: P): R { return this.defaultVisit(schema, parameter) }
  visitOneOfSchema(schema: OneOfSchema, parameter: P): R { return this.defaultVisit(schema, parameter) }
  visitAllOfSchema(schema: AllOfSchema, parameter: P): R { return this.defaultVisit(schema, parameter) }
  visitAnyOfSchema(schema: AnyOfSchema, parameter: P): R { return this.defaultVisit(schema, parameter) }
  visitNullSchema(schema: NullSchema, parameter: P): R { return this.defaultVisit(schema, parameter) }
  visitAnySchema(schema: AnySchema, parameter: P): R { return this.defaultVisit(schema, parameter) }
}

interface ISchemaVisitee {
  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R;
}

class SchemaInspectorVisitor extends DefaultSchemaVisitor<string | number, Array<BaseSchema>> {

  static EMPTY_ARRAY: Array<BaseSchema> = [];
  static INSTANCE: SchemaInspectorVisitor = null;

  constructor() {
    super((schema, segment) => SchemaInspectorVisitor.EMPTY_ARRAY);
  }

  static instance() {
    if (SchemaInspectorVisitor.INSTANCE === null) {
      SchemaInspectorVisitor.INSTANCE = new SchemaInspectorVisitor();
    }
    return SchemaInspectorVisitor.INSTANCE;
  }

  visitObjectSchema(schema: ObjectSchema, segment: string): Array<BaseSchema> {
    const childSchema = schema.getProperty(segment)
    return childSchema ? [childSchema] : SchemaInspectorVisitor.EMPTY_ARRAY;
  }

  visitArraySchema(schema: ArraySchema, segment: number): Array<BaseSchema> {
    return [schema.getItemSchema()];
  }

  visitOneOfSchema(schema: OneOfSchema, segment: string | number): Array<BaseSchema> {
    return flatten(schema.getSchemas().map(s => s.accept(this, segment)));
  }

  visitAllOfSchema(schema: AllOfSchema, segment: string | number): Array<BaseSchema> {
    return flatten(schema.getSchemas().map(s => s.accept(this, segment)));
  }

  visitAnyOfSchema(schema: AnyOfSchema, segment: string | number): Array<BaseSchema> {
    return flatten(schema.getSchemas().map(s => s.accept(this, segment)));
  }
}

class SchemaFlattenerVisitor extends DefaultSchemaVisitor<Array<BaseSchema>, void> {
  static INSTANCE: SchemaFlattenerVisitor = null;

  constructor() {
    super((schema, parameter) => parameter.push(schema));
  }

  static instance() {
    if (SchemaFlattenerVisitor.INSTANCE === null) {
      SchemaFlattenerVisitor.INSTANCE = new SchemaFlattenerVisitor();
    }
    return SchemaFlattenerVisitor.INSTANCE;
  }

  visitOneOfSchema(schema: OneOfSchema, collector: Array<BaseSchema>): void {
    schema.getSchemas().forEach(childSchema => childSchema.accept(this, collector));
  }

  visitAllOfSchema(schema: AllOfSchema, collector: Array<BaseSchema>): void {
    schema.getSchemas().forEach(childSchema => childSchema.accept(this, collector));
  }

  visitAnyOfSchema(schema: AnyOfSchema, collector: Array<BaseSchema>): void {
    schema.getSchemas().forEach(childSchema => childSchema.accept(this, collector));
  }
}

export class SchemaRoot {
  private schemaRoot: Object;
  private resolveRef: Function;
  private schema: BaseSchema;

  getSchema(): BaseSchema {
    return this.schema;
  }

  constructor(schemaRoot: Object) {
    this.schemaRoot = schemaRoot;
    this.resolveRef = memoize((path: string) => {
      const segments = path.split('/');
      function resolveInternal(partialSchema: Object, refSegments: Array<string>): Object {
        if (isEmpty(refSegments)) {
          return partialSchema;
        }
        const [key, ...tail] = refSegments;
        if (key === '#') {
          return resolveInternal(partialSchema, tail);
        }
        const subSchema = partialSchema[key];
        return resolveInternal(subSchema, tail);
      }
      return resolveInternal(this.schemaRoot, segments);
    });
    this.schema = this.wrap(schemaRoot);
  }

  wrap(schema: any): BaseSchema {
    if (!schema) {
      console.warn(`${schema} schema found`);
      return new AnySchema({}, this);
    }
    
    if (schema.$ref) {
      schema = this.resolveRef(schema.$ref);
    }
    
    if (isArray(schema.type)) {
      const childSchemas = schema.type.map((type: string) => assign(clone(schema), { type }));
      schema = {
        oneOf: childSchemas
      }
    }

    if ((schema.type === 'object' || isObject(schema.properties)) && !schema.allOf && !schema.anyOf && !schema.oneOf) {
      return new ObjectSchema(schema, this);
    } else if ((schema.type === 'array' || isObject(schema.items)) && !schema.allOf && !schema.anyOf && !schema.oneOf) {
      return new ArraySchema(schema, this);
    }

    if (isArray(schema.oneOf)) {
      return new OneOfSchema(schema, this);
    } else if (isArray(schema.anyOf)) {
      return new AnyOfSchema(schema, this);
    } else if (isArray(schema.allOf)) {
      return new AllOfSchema(schema, this);
    } else if (isObject(schema.enum)) {
      return new EnumSchema(schema, this);
    }

    switch (schema.type) {
      case 'boolean': return new BooleanSchema(schema, this);
      case 'number': return new NumberSchema(schema, this);
      case 'integer': return new NumberSchema(schema, this);
      case 'string': return new StringSchema(schema, this);
      case 'null': return new NullSchema(schema, this);
    }
    console.warn(`Illegal schema part: ${JSON.stringify(schema)}`)
    return new AnySchema({}, this);
  }

  getPossibleTypes(segments: Array<number | string>) {
    if (segments.length === 0) {
      return this.getExpandedSchemas(this.getSchema());
    }
    return segments.reduce((schemas: Array<BaseSchema>, segment: string) => {
      const resolvedNextSchemas = schemas.map(schema => this.getExpandedSchemas(schema));
      const nextSchemas = flatten(resolvedNextSchemas).map(schema => schema.accept(SchemaInspectorVisitor.instance(), segment));
      return flatten(nextSchemas);
    }, [this.getSchema()]);
  }

  getExpandedSchemas(schema: BaseSchema) {
    if (schema instanceof CompositeSchema) {
      const schemas: Array<BaseSchema> = [];
      this.getSchema().accept(SchemaFlattenerVisitor.instance(), schemas);
      return schemas;
    }
    return [schema];
  }
}

export abstract class BaseSchema implements ISchemaVisitee {
  constructor(public schema: any, private schemaRoot: SchemaRoot) {
    this.schema = schema;
    this.schemaRoot = schemaRoot;
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

export class ObjectSchema extends BaseSchema {
  private keys: Array<string>;
  private properties: Dictionary<BaseSchema>;

  constructor(schema: Object, schemaRoot: SchemaRoot) {
    super(schema, schemaRoot);
    const properties = this.schema.properties || {};
    this.keys = Object.keys(properties);
    this.properties = this.keys.reduce((object, key) => {
      const propertySchema = this.getSchemaRoot().wrap(properties[key]);
      if(propertySchema !== null) {
        object[key] = propertySchema;
      }
      return object;
    }, <Dictionary<BaseSchema>>{});
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

  getDefaultValue(): Object {
    return this.schema['default'] || null;
  }

  getDisplayType() {
    return 'object';
  }

  getAvailableKeys(partial: any) {
    if (!isObject(partial)) {
      return [];
    }
    return this.getKeys().filter(key => !partial.hasOwnProperty(key));
  }

  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitObjectSchema(this, parameter);
  }
}

export class ArraySchema extends BaseSchema {
  private itemSchema: BaseSchema;

  constructor(schema: Object, schemaRoot: SchemaRoot) {
    super(schema, schemaRoot);
    this.itemSchema = this.getSchemaRoot().wrap(this.schema.items) 
      || new StringSchema({}, this.getSchemaRoot());
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

  getDisplayType() {
    const itemSchemaType = this.getItemSchema() && this.getItemSchema().getDisplayType()
      ? this.getItemSchema().getDisplayType()
      : 'any';
    return `${itemSchemaType}[]`;
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
  constructor(schema: Object, schemaRoot: SchemaRoot, keyWord: string) {
    super(schema, schemaRoot);
    this.schemas = schema[keyWord].map((schema: any) => this.getSchemaRoot().wrap(schema));
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
  constructor(schema: Object, schemaRoot: SchemaRoot) {
    super(schema, schemaRoot, 'anyOf');
  }

  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitAnyOfSchema(this, parameter);
  }
}

export class AllOfSchema extends CompositeSchema {
  constructor(schema: Object, schemaRoot: SchemaRoot) {
    super(schema, schemaRoot, 'allOf');
  }

  accept<P, R>(visitor: ISchemaVisitor<P, R>, parameter: P): R {
    return visitor.visitAllOfSchema(this, parameter);
  }
}

export class OneOfSchema extends CompositeSchema {
  constructor(schema: Object, schemaRoot: SchemaRoot) {
    super(schema, schemaRoot, 'oneOf');
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
