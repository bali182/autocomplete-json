import {SchemaRoot, StringSchema, NumberSchema, BaseSchema, BooleanSchema, EnumSchema, ArraySchema, 
        ObjectSchema, NullSchema, CompositeSchema, OneOfSchema, AnyOfSchema, AllOfSchema} from './json-schema';
import {IProposal, IRequest} from './provider-api'
import {isObject, flatten} from 'lodash'
import {KeyProposalVisitor, ValueProposalVisitor, SnippetProposalVisitor} from './json-schema-visitors';
import {resolveObject} from './utils';

export interface IProposalFactory {
  createProposals(request: IRequest, schema: SchemaRoot): Array<IProposal>
}

class KeyProposalFactory implements IProposalFactory {
  createProposals(request: IRequest, schema: SchemaRoot): Array<IProposal> {
    const {contents,  segments} = request;
    const unwrappedContents = resolveObject(segments, contents);
    const visitor = new KeyProposalVisitor(unwrappedContents, new SnippetProposalVisitor());
    const proposals = schema.getPossibleTypes(segments)
      .map(s => s.accept(visitor, request));
    return flatten(proposals);
  }
}

class ValueProposalFactory implements IProposalFactory {
  createProposals(request: IRequest, schema: SchemaRoot): Array<IProposal> {
    const {segments} = request;
    const schemas = schema.getPossibleTypes(segments)
    const visitor = new ValueProposalVisitor(new SnippetProposalVisitor());
    return flatten(schemas.map(schema => schema.accept(visitor, request)));
  }
}

export class JsonSchemaProposalFactory implements IProposalFactory {
  private keyProposalFactory = new KeyProposalFactory();
  private valueProposalFactory = new ValueProposalFactory();

  createProposals(request: IRequest, schema: SchemaRoot): Array<IProposal> {
    const visitor = new ValueProposalVisitor(new SnippetProposalVisitor());
    
    const {isKeyPosition, isValuePosition, isFileEmpty, contents} = request;
    if (isFileEmpty) {
      return flatten(schema.getPossibleTypes([]).map(schema => schema.accept(visitor, request)));
    }
    if (isKeyPosition) {
      return this.keyProposalFactory.createProposals(request, schema);
    } else if (isValuePosition) {
      return this.valueProposalFactory.createProposals(request, schema);
    }
    return [];
  }
}
