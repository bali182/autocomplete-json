import {IProposalProvider, IRequest, IProposal, IJsonSchemaProvider} from './provider-api'
import {SchemaRoot} from './json-schema';
import {JsonSchemaProposalFactory} from './json-schema-proposal-factory';
import * as fs from 'fs';
const fetch = require('node-fetch');
const uriValidator = require('valid-url');

function isLocalFile(uri: string) {
  try {
    fs.accessSync(uri, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function resolveLocalFile(uri: string) {
  return new Promise<Object>((resolve, reject) => {
    fs.readFile(uri, 'UTF-8', /* TODO think about detecting this */(error, data) => {
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

function resolveSchemaObject(uri: string): Promise<Object> {
  if (isLocalFile(uri)) {
    return resolveLocalFile(uri);
  } else if (uriValidator.isWebUri(uri)) {
    return fetch(uri).then((data: any) => data.json());
  }
  console.warn(`Invalid schema location: ${uri}`);
  return Promise.resolve({});
}

export class JsonSchemaProposalProvider implements IProposalProvider {
  private proposalFactory = new JsonSchemaProposalFactory();
  private schemaRoot: SchemaRoot = null;

  constructor(private schemaProvider: IJsonSchemaProvider) {
    resolveSchemaObject(schemaProvider.getSchemaURI())
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
