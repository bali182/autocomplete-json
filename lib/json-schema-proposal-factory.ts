import {DefaultSchemaVisitor, SchemaRoot, StringSchema, NumberSchema, BaseSchema, BooleanSchema, EnumSchema,
ArraySchema, ObjectSchema, NullSchema, CompositeSchema, OneOfSchema, AnyOfSchema, AllOfSchema} from './json-schema';
import {IProposal, IRequest} from './provider-api'
import {isObject, flatten} from 'lodash'

class SnippetProposalVisitor extends DefaultSchemaVisitor<IRequest, string> {
  private static INSTANCE: SnippetProposalVisitor = null;

  constructor() {
    super((schema: BaseSchema, request: IRequest) => '$1');
  }

  static instance(): SnippetProposalVisitor {
    if (SnippetProposalVisitor.INSTANCE === null) {
      SnippetProposalVisitor.INSTANCE = new SnippetProposalVisitor();
    }
    return SnippetProposalVisitor.INSTANCE;
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

class ValueProposalVisitor extends DefaultSchemaVisitor<IRequest, Array<IProposal>> {

  private static INSTANCE: ValueProposalVisitor = null;

  constructor() {
    super((schema, request) => []);
  }

  static instance(): ValueProposalVisitor {
    if (ValueProposalVisitor.INSTANCE === null) {
      ValueProposalVisitor.INSTANCE = new ValueProposalVisitor();
    }
    return ValueProposalVisitor.INSTANCE;
  }

  createBaseProposalFor(schema: BaseSchema): IProposal {
    return {
      description: schema.getDescription(),
      rightLabel: schema.getDisplayType()
    }
  }

  visitObjectSchema(schema: ObjectSchema, request: IRequest): Array<IProposal> {
    const proposal = this.createBaseProposalFor(schema);
    proposal.displayText = '{}';
    proposal.snippet = schema.accept(SnippetProposalVisitor.instance(), request);
    return [proposal];
  }

  visitArraySchema(schema: ArraySchema, request: IRequest): Array<IProposal> {
    const proposal = this.createBaseProposalFor(schema);
    proposal.displayText = '[]';
    proposal.snippet = schema.accept(SnippetProposalVisitor.instance(), request);
    return [proposal];
  }

  visitStringSchema(schema: StringSchema, request: IRequest): Array<IProposal> {
    if (request.isBetweenQuotes) {
      return [];
    }
    const proposal = this.createBaseProposalFor(schema);
    proposal.displayText = schema.getDefaultValue() ? `"${schema.getDefaultValue()}"` : '""';
    proposal.snippet = schema.accept(SnippetProposalVisitor.instance(), request);
    return [proposal];
  }

  visitNumberSchema(schema: NumberSchema, request: IRequest): Array<IProposal> {
    if (request.isBetweenQuotes) {
      return [];
    }
    const proposal = this.createBaseProposalFor(schema);
    proposal.displayText = schema.getDefaultValue() ? `${schema.getDefaultValue()}` : "0";
    proposal.snippet = schema.accept(SnippetProposalVisitor.instance(), request);
    return [proposal];
  }

  visitBooleanSchema(schema: BooleanSchema, request: IRequest): Array<IProposal> {
    if (request.isBetweenQuotes) {
      return [];
    }
    return [true, false].map(bool => {
      const proposal = this.createBaseProposalFor(schema);
      proposal.displayText = bool ? 'true' : 'false';
      proposal.snippet = proposal.displayText + '${1}' + SnippetProposalVisitor.instance().comma(request);
      return proposal;
    });
  }

  visitNullSchema(schema: NullSchema, request: IRequest): Array<IProposal> {
    if (request.isBetweenQuotes) {
      return [];
    }
    const proposal = this.createBaseProposalFor(schema);
    proposal.displayText = schema.getDefaultValue() ? `${schema.getDefaultValue()}` : "null";
    proposal.snippet = schema.accept(SnippetProposalVisitor.instance(), request);
    return [proposal];
  }

  visitEnumSchema(schema: EnumSchema, request: IRequest): Array<IProposal> {
    return schema.getValues()
      .map(enumValue => {
        const proposal = this.createBaseProposalFor(schema);
        proposal.displayText = enumValue;
        if (request.isBetweenQuotes) {
          proposal.text = enumValue;
        } else {
          proposal.snippet = '"' + enumValue + '${1}"' + SnippetProposalVisitor.instance().comma(request);
        }
        return proposal;
      });
  }

  visitCompositeSchema(schema: CompositeSchema, request: IRequest) {
    return flatten(schema.getSchemas()
      .filter(s => !(s instanceof AnyOfSchema))
      .map(s => s.accept(this, request)));
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

class KeyProposalVisitor extends DefaultSchemaVisitor<IRequest, Array<IProposal>> {

  constructor(private unwrappedContents: Object) {
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
          const value = schema.getProperty(key).accept(SnippetProposalVisitor.instance(), request);
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

function resolveObject(segments: Array<string | number>, object: Object): any {
  if (!isObject(object)) {
    return null;
  }
  if (segments.length === 0) {
    return object;
  }
  const [key, ...restOfSegments] = segments;
  return resolveObject(restOfSegments, object[key]);
}

export interface IProposalFactory {
  createProposals(request: IRequest, schema: SchemaRoot): Array<IProposal>
}

class KeyProposalFactory implements IProposalFactory {
  createProposals(request: IRequest, schema: SchemaRoot): Array<IProposal> {
    const {contents,  segments} = request;
    const unwrappedContents = resolveObject(segments, contents);
    const visitor = new KeyProposalVisitor(unwrappedContents);
    const proposals = schema.getPossibleTypes(segments)
      .map(s => s.accept(visitor, request));
    return flatten(proposals);
  }
}

class ValueProposalFactory implements IProposalFactory {
  createProposals(request: IRequest, schema: SchemaRoot): Array<IProposal> {
    const {segments} = request;
    const schemas = schema.getPossibleTypes(segments)
    return flatten(schemas.map(schema => schema.accept(ValueProposalVisitor.instance(), request)));
  }
}

export class JsonSchemaProposalFactory implements IProposalFactory {
  private keyProposalFactory = new KeyProposalFactory();
  private valueProposalFactory = new ValueProposalFactory();

  createProposals(request: IRequest, schema: SchemaRoot): Array<IProposal> {
    const {isKeyPosition, isValuePosition, isFileEmpty, contents} = request;
    if (isFileEmpty) {
      return flatten(schema.getPossibleTypes([]).map(schema => schema.accept(ValueProposalVisitor.instance(), request)));
    }
    if (isKeyPosition) {
      return this.keyProposalFactory.createProposals(request, schema);
    } else if (isValuePosition) {
      return this.valueProposalFactory.createProposals(request, schema);
    }
    return [];
  }
}
