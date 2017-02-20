import * as minimatch from 'minimatch';
import { IProposalProvider, IRequest, IProposal } from '../../provider-api'
import { JsonSchemaProposalProvider } from '../../json-schema-proposal-provider';
import { SchemaRoot } from '../../json-schema';
import { CompoundProposalProvider } from './compound-provider';
import axios from 'axios'

interface ISchemaInfo {
  name?: string,
  description?: string,
  fileMatch?: Array<string>,
  url?: string
}

export default class SchemaStoreProvider implements IProposalProvider {
  private schemaInfos: Array<ISchemaInfo>
  private compoundProvier = new CompoundProposalProvider();
  private blackList: { [email: string]: boolean } = {};

  getSchemaInfos(): Promise<ISchemaInfo[]> {
    if (this.schemaInfos) {
      return Promise.resolve(this.schemaInfos);
    }
    return <any>axios.get('http://schemastore.org/api/json/catalog.json')
      .then(response => response.data)
      .then(data => data.schemas.filter((schema: ISchemaInfo) => !!schema.fileMatch))
      .then((schemaInfos: Array<ISchemaInfo>) => {
        this.schemaInfos = schemaInfos
        return schemaInfos;
      });
  }

  getProposals(request: IRequest): Promise<Array<IProposal>> {
    const file = request.editor.buffer.file;
    if (this.blackList[file.getBaseName()]) {
      console.warn('schemas not available');
      return Promise.resolve([]);
    }

    if (!this.compoundProvier.hasProposals(file)) {
      return this.getSchemaInfos()
        .then(schemaInfos => schemaInfos.filter(({fileMatch}) => fileMatch.some(match => minimatch(file.getBaseName(), match))))
        .then(matching => {
          const promises = matching.map(schemaInfo => axios.get(schemaInfo.url)
            .then(result => result.data)
            .then((schema: Object) => new JsonSchemaProposalProvider(
              schemaInfo.fileMatch,
              new SchemaRoot(schema)
            ))
          );
          return Promise.all(promises) as any
        })
        .then((providers: IProposalProvider[]) => this.compoundProvier.addProviders(providers))
        .then(_ => {
          if (!this.compoundProvier.hasProposals(file)) {
            this.blackList[file.getBaseName()] = true;
          }
        })
        .then(_ => this.compoundProvier.getProposals(request))
    }
    return this.compoundProvier.getProposals(request);
  }

  getFilePattern(): string {
    return '*';
  }
}
