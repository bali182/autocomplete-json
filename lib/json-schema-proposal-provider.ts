import {IProposalProvider, IRequest, IProposal} from './provider-api'
import {SchemaRoot} from './json-schema';
import {JsonSchemaProposalFactory} from './json-schema-proposal-factory';
import * as fs from 'fs';
const fetch = require('node-fetch');

export abstract class JsonSchemaProposalProvider implements IProposalProvider {
  private proposalFactory = new JsonSchemaProposalFactory();
  private schemaRoot: SchemaRoot = null;

  constructor(schemaPromise: Promise<Object>) {
    schemaPromise.then(schema => {
      this.schemaRoot = new SchemaRoot(schema);
      return schema;
    });
  }

  getProposals(request: IRequest): Promise<IProposal> {
    if (this.schemaRoot === null) {
      return Promise.resolve([]);
    }
    return Promise.resolve(this.proposalFactory.createProposals(request, this.schemaRoot));
  }

  protected loadLocalSchema(location: string, encoding = 'UTF-8'): Promise<Object> {
    return new Promise<Object>((resolve, reject) => {
      fs.readFile(location, encoding, (error, data) => {
        if (error) {
          reject(error);
        } else {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        }
      });
    });
  }

  protected loadRemoteSchema(url: string) {
    return fetch(url).then((response: any) => response.json());
  }

  abstract getFilePattern(): string;
}