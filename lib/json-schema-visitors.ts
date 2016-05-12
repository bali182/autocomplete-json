import {BaseSchema, ArraySchema, ObjectSchema, BooleanSchema, NullSchema, EnumSchema, StringSchema,
NumberSchema, CompositeSchema, AllOfSchema, AnyOfSchema, OneOfSchema, AnySchema} from './json-schema';
import {IRequest, IProposal} from './provider-api'
import {resolveObject} from './utils'
import {flatten} from 'lodash'

/** Visitor interface for JSON schema parts */
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

/** Base implementation for JSON schema visitor. Applies the parameter function as all non-overwritten methods. */
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

/** Visitor for finding the child schemas of any schema. */
export class SchemaInspectorVisitor extends DefaultSchemaVisitor<string | number, Array<BaseSchema>> {

  constructor() {
    super((schema, segment) => []);
  }

  visitObjectSchema(schema: ObjectSchema, segment: string): Array<BaseSchema> {
    const childSchema = schema.getProperty(segment)
    if (childSchema) {
      return [childSchema];
    }
    return schema.getPatternProperties()
      .filter(p => p.getPattern().test(segment))
      .map(p => p.getSchema());
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

/** Visitor for flattening nested schemas. */
export class SchemaFlattenerVisitor extends DefaultSchemaVisitor<Array<BaseSchema>, void> {
  constructor() {
    super((schema, parameter) => parameter.push(schema));
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

/** Visitor for providing value snippets for the given schema. */
export class SnippetProposalVisitor extends DefaultSchemaVisitor<IRequest, string> {
  static DEFAULT = '$1';

  constructor() {
    super((schema: BaseSchema, request: IRequest) => SnippetProposalVisitor.DEFAULT);
  }

  comma(request: IRequest) {
    return request.shouldAddComma ? ',' : '';
  }

  visitStringLike(schema: BaseSchema, request: IRequest): string {
    const {isBetweenQuotes} = request;
    const q = isBetweenQuotes ? '' : '"'
    return q + '${1:' + (schema.getDefaultValue() || '') + '}' + q + this.comma(request);
  }

  visitStringSchema(schema: StringSchema, request: IRequest): string {
    return this.visitStringLike(schema, request);
  }

  visitNumberSchema(schema: NumberSchema, request: IRequest): string {
    return request.isBetweenQuotes
      ? this.defaultVisit(schema, request)
      : '${1:' + (schema.getDefaultValue() || '0') + '}' + this.comma(request);
  }

  visitBooleanSchema(schema: BooleanSchema, request: IRequest): string {
    return request.isBetweenQuotes
      ? this.defaultVisit(schema, request)
      : '${1:' + (schema.getDefaultValue() || 'false') + '}' + this.comma(request);
  }

  visitNullSchema(schema: NullSchema, request: IRequest): string {
    return request.isBetweenQuotes
      ? this.defaultVisit(schema, request)
      : '${1:null}' + this.comma(request);
  }

  visitEnumSchema(schema: EnumSchema, request: IRequest): string {
    return this.visitStringLike(schema, request);
  }

  visitArraySchema(schema: ArraySchema, request: IRequest): string {
    return request.isBetweenQuotes
      ? this.defaultVisit(schema, request)
      : '[$1]' + this.comma(request);
  }

  visitObjectSchema(schema: ObjectSchema, request: IRequest): string {
    return request.isBetweenQuotes
      ? this.defaultVisit(schema, request)
      : '{$1}' + this.comma(request);
  }
}

/** Visitor for providing an array of IProposal s for any schema. */
export class ValueProposalVisitor extends DefaultSchemaVisitor<IRequest, Array<IProposal>> {

  constructor(private snippetVisitor: SnippetProposalVisitor) {
    super((schema, request) => []);
  }

  createBaseProposalFor(schema: BaseSchema): IProposal {
    return {
      description: schema.getDescription(),
      rightLabel: schema.getDisplayType(),
      type: 'value'
    }
  }

  visitObjectSchema(schema: ObjectSchema, request: IRequest): Array<IProposal> {
    const proposal = this.createBaseProposalFor(schema);
    proposal.displayText = '{}';
    proposal.snippet = schema.accept(this.snippetVisitor, request);
    return [proposal];
  }

  visitArraySchema(schema: ArraySchema, request: IRequest): Array<IProposal> {
    const proposal = this.createBaseProposalFor(schema);
    proposal.displayText = '[]';
    proposal.snippet = schema.accept(this.snippetVisitor, request);
    return [proposal];
  }

  visitStringSchema(schema: StringSchema, request: IRequest): Array<IProposal> {
    if (request.isBetweenQuotes) {
      return [];
    }
    const proposal = this.createBaseProposalFor(schema);
    proposal.displayText = schema.getDefaultValue() ? `"${schema.getDefaultValue()}"` : '""';
    proposal.snippet = schema.accept(this.snippetVisitor, request);
    return [proposal];
  }

  visitNumberSchema(schema: NumberSchema, request: IRequest): Array<IProposal> {
    if (request.isBetweenQuotes) {
      return [];
    }
    const proposal = this.createBaseProposalFor(schema);
    proposal.displayText = schema.getDefaultValue() ? `${schema.getDefaultValue()}` : "0";
    proposal.snippet = schema.accept(this.snippetVisitor, request);
    return [proposal];
  }

  visitBooleanSchema(schema: BooleanSchema, request: IRequest): Array<IProposal> {
    if (request.isBetweenQuotes) {
      return [];
    }
    return [true, false].map(bool => {
      const proposal = this.createBaseProposalFor(schema);
      proposal.displayText = bool ? 'true' : 'false';
      proposal.snippet = proposal.displayText + '${1}' + this.snippetVisitor.comma(request);
      return proposal;
    });
  }

  visitNullSchema(schema: NullSchema, request: IRequest): Array<IProposal> {
    if (request.isBetweenQuotes) {
      return [];
    }
    const proposal = this.createBaseProposalFor(schema);
    proposal.displayText = schema.getDefaultValue() ? `${schema.getDefaultValue()}` : "null";
    proposal.snippet = schema.accept(this.snippetVisitor, request);
    return [proposal];
  }

  visitEnumSchema(schema: EnumSchema, request: IRequest): Array<IProposal> {
    const {segments, contents} = request;
    const parent = schema.getParent();
    let possibleValues = schema.getValues();

    if ((parent instanceof ArraySchema) && (<ArraySchema>parent).hasUniqueItems()) {
      const alreadyPresentValues: Array<string> = resolveObject(segments.slice(0, segments.length - 1), contents) || [];
      possibleValues = possibleValues.filter(value => alreadyPresentValues.indexOf(value) < 0);
    }

    return possibleValues.map(enumValue => {
      const proposal = this.createBaseProposalFor(schema);
      proposal.displayText = enumValue;
      if (request.isBetweenQuotes) {
        proposal.text = enumValue;
      } else {
        proposal.snippet = '"' + enumValue + '${1}"' + this.snippetVisitor.comma(request);
      }
      return proposal;
    });
  }

  visitCompositeSchema(schema: CompositeSchema, request: IRequest) {
    return flatten(schema.getSchemas()
      .filter(s => !(s instanceof AnyOfSchema))
      .map(s => s.accept(this, request).filter(r => r.snippet !== SnippetProposalVisitor.DEFAULT))
    );
  }

  visitAllOfSchema(schema: AllOfSchema, request: IRequest): Array<IProposal> {
    return this.visitCompositeSchema(schema, request);
  }

  visitAnyOfSchema(schema: AnyOfSchema, request: IRequest): Array<IProposal> {
    return this.visitCompositeSchema(schema, request);
  }

  visitOneOfSchema(schema: OneOfSchema, request: IRequest): Array<IProposal> {
    return this.visitCompositeSchema(schema, request);
  }
}

/** Visitor for providing an array of IProposal, when editing key position */
export class KeyProposalVisitor extends DefaultSchemaVisitor<IRequest, Array<IProposal>> {

  constructor(private unwrappedContents: Object, private snippetVisitor: SnippetProposalVisitor) {
    super(((schema, request) => []));
  }

  visitObjectSchema(schema: ObjectSchema, request: IRequest): Array<IProposal> {
    const {prefix, isBetweenQuotes} = request;
    return schema.getKeys()
      .filter(key => !this.unwrappedContents || (key.indexOf(prefix) >= 0 && !this.unwrappedContents.hasOwnProperty(key)))
      .map<IProposal>(key => {
        const valueSchema = schema.getProperty(key);
        const proposal: IProposal = {};

        proposal.description = valueSchema.getDescription()
        proposal.type = 'property';
        proposal.displayText = key;
        proposal.rightLabel = valueSchema.getDisplayType();
        if (isBetweenQuotes) {
          proposal.text = key;
        } else {
          const value = schema.getProperty(key).accept(this.snippetVisitor, request);
          proposal.snippet = `"${key}": ${value}`;
        }
        return proposal;
      });
  }

  visitCompositeSchema(schema: CompositeSchema, request: IRequest): Array<IProposal> {
    const proposals = schema.getSchemas()
      .filter(s => s instanceof ObjectSchema)
      .map(s => s.accept(this, request))
    return flatten(proposals)
  }

  visitAllOfSchema(schema: AllOfSchema, request: IRequest): Array<IProposal> {
    return this.visitCompositeSchema(schema, request);
  }

  visitAnyOfSchema(schema: AnyOfSchema, request: IRequest): Array<IProposal> {
    return this.visitCompositeSchema(schema, request);
  }

  visitOneOfSchema(schema: OneOfSchema, request: IRequest): Array<IProposal> {
    return this.visitCompositeSchema(schema, request);
  }
}
