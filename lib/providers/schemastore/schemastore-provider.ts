import * as minimatch from 'minimatch';
import {IProposalProvider, IRequest, IProposal} from '../../provider-api'
import {JsonSchemaProposalProvider} from '../../json-schema-proposal-provider';
import {SchemaRoot} from '../../json-schema';
import {CompoundProposalProvider} from './compound-provider';
const fetch = require('node-fetch');

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

   constructor() {
     fetch('http://schemastore.org/api/json/catalog.json')
      .then((response: any) => response.json())
      .then((data: any) => data.schemas.filter((schema: ISchemaInfo) => !!schema.fileMatch))
      .then((schemaInfos: Array<ISchemaInfo>) => this.schemaInfos = schemaInfos)
      .catch((error: any) => console.error(error));
   }

  getProposals(request: IRequest): Promise<Array<IProposal>> {
    const fileName: string = request.editor.buffer.file.getBaseName();
    if (!this.schemaInfos || this.blackList[fileName]) {
      console.warn('schemas not available');
      return Promise.resolve([]);
    }

    if(!this.compoundProvier.hasProposals(fileName)) {
      const matchingSchemas = this.schemaInfos.filter(({fileMatch}) => {
        return fileMatch.some(match => minimatch(fileName, match));
      });
      const providersPromises = matchingSchemas.map(schemaInfo => {
        const schemaPromise: Promise<Object> = fetch(schemaInfo.url).then((result: any) => result.json());
        return schemaPromise.then(schema => {
          return new JsonSchemaProposalProvider(
            schemaInfo.fileMatch,
            new SchemaRoot(schema)
          )
        })
      });
      return Promise.all(providersPromises)
        .then(providers => this.compoundProvier.addProviders(providers))
        .then(_ => this.compoundProvier.getProposals(request));
    }
    return this.compoundProvier.getProposals(request);
  }

   getFilePattern(): string {
     return '*';
   }
}
