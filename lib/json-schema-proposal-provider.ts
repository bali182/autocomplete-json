import {IProposalProvider, IRequest, IProposal, IJsonSchemaProvider} from './provider-api'
import {SchemaRoot} from './json-schema';
import {JsonSchemaProposalFactory} from './json-schema-proposal-factory';
import {loadSchema} from './json-schema-loader';

export class JsonSchemaProposalProvider implements IProposalProvider {
  private proposalFactory = new JsonSchemaProposalFactory();

  constructor(private filePattern: string | string[], private schemaRoot: SchemaRoot) {}

  getProposals(request: IRequest): Promise<IProposal> {
    return Promise.resolve(this.proposalFactory.createProposals(request, this.schemaRoot));
  }

  getFilePattern() {
    return this.filePattern;
  }

  static createFromProvider(schemaProvider: IJsonSchemaProvider): Promise<JsonSchemaProposalProvider> {
    return loadSchema(schemaProvider.getSchemaURI())
      .then(schema => new JsonSchemaProposalProvider(
        schemaProvider.getFilePattern(),
        new SchemaRoot(schema)
      ));
  }
}
