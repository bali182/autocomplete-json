import * as fs from 'fs';
import * as os from 'os';
import {trimLeft} from 'lodash';
const uriJs = require('uri-js');
// const fetch = require('node-fetch');
import {fetch} from  './utils';

export interface IUri {
  scheme: string //"uri"
  userinfo: string //"user:pass",
  host: string //"example.com",
  port: string // 123,
  path: string //"/one/two.three",
  query: string //"q1=a1&q2=a2",
  fragment: string //"body"
}

export interface ISchemaLoader {
  load(uri: IUri): Promise<Object>
}

export const fileSchemaLoader = {
  normalizePath(path: string): string {
    if(os.platform() === 'win32') {
      return trimLeft(path, '/');
    }
    return path;
  },

  load(uri: IUri): Promise<Object> {
    return new Promise<Object>((resolve, reject) => {
      fs.readFile(this.normalizePath(uri.path), 'UTF-8', /* TODO think about detecting this */ (error, data) => {
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
}

export const httpSchemaLoader = <ISchemaLoader> {
  load(uri: IUri): Promise<Object> {
    return fetch(uriJs.serialize(uri)).then((data: any) => data.json());
  }
}

export const anySchemaLoader: ISchemaLoader = {
  load(uri: IUri): Promise<Object> {
    switch (uri.scheme) {
      case 'file': return fileSchemaLoader.load(uri);
      case 'http': return httpSchemaLoader.load(uri);
      default: throw new Error(`Unknown URI format ${JSON.stringify(uri)}`);
    }
  }
}

export function loadSchema(uri: string): Promise<Object> {
  return anySchemaLoader.load(uriJs.parse(uri));
}
