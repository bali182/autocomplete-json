import {IProposalProvider, IRequest, IProposal, IJsonSchemaProvider} from './provider-api'
import {SchemaRoot} from './json-schema';
import {JsonSchemaProposalFactory} from './json-schema-proposal-factory';
import {loadSchema} from './json-schema-loader';
 
export class JsonSchemaProposalProvider implements IProposalProvider {
  private proposalFactory = new JsonSchemaProposalFactory();
  private schemaRoot: SchemaRoot = null;

  constructor(private schemaProvider: IJsonSchemaProvider) {
    loadSchema(schemaProvider.getSchemaURI())
      .then(schemaObject => {
        this.schemaRoot = new SchemaRoot(schemaObject);
        return schemaObject;
      });
  }

  getProposals(request: IRequest): Promise<IProposal> {
    if (this.schemaRoot === null) {
      return Promise.resolve([]);
    }
    return Promise.resolve(this.proposalFactory.createProposals(request, this.schemaRoot));
  }

  getFilePattern() {
    return this.schemaProvider.getFilePattern();
  }
}
