/// <reference path="../typings/tsd" />

import RootProvider from './root-provider';
import {IJsonSchemaProvider, IProposalProvider} from './provider-api';
import {JsonSchemaProposalProvider} from './json-schema-proposal-provider';
import {isArray, remove} from 'lodash';

const {CompositeDisposable, Disposable} = require('atom');

let PROVIDERS: Array<IProposalProvider>

export function activate() {
  PROVIDERS = [];
}

export function provideAutocomplete() {
  return new RootProvider(PROVIDERS);
}

export function provideJsonSchemaProviders(): IJsonSchemaProvider | Array<IJsonSchemaProvider> {
  return [
    require('./providers/tsconfig/tsconfig-json-schema-proposal-provider').default,
    require('./providers/package/package-json-schema-proposal-provider').default,
    require('./providers/bower/bower-json-schema-proposal-provider').default
  ];
}

export function provideProposalProviders(): IJsonSchemaProvider | Array<IJsonSchemaProvider> {
  const PackageJsonDependecyProposalProvider = require('./providers/package-dependencies/package-json-dependency-proposal-provider').default;
  return [
    new PackageJsonDependecyProposalProvider()
  ];
}

function createDisposable(providers: Array<IProposalProvider>): any {
  return providers.reduce((disposable, provider) => {
    disposable.add(new Disposable((provider: IProposalProvider) => {
      remove(PROVIDERS, e => e === provider);
    }));
    return disposable;
  }, new CompositeDisposable())
}

export function consumeJsonSchemaProviders(provider: IJsonSchemaProvider | Array<IJsonSchemaProvider>): any {
  const schemaProviders: Array<IJsonSchemaProvider> = isArray(provider) ? provider : [provider];
  const providers = schemaProviders.filter(s => !!s).map(s => new JsonSchemaProposalProvider(s))
  providers.forEach(p => PROVIDERS.push(p));
  return createDisposable(providers);
}

export function consumeJsonProposalProviders(provider: IProposalProvider | Array<IProposalProvider>): any {
  const providers: Array<IProposalProvider> = (isArray(provider) ? provider : [provider]).filter(p => !!p);
  providers.forEach(p => PROVIDERS.push(p));
  return createDisposable(providers);
}

export function dispose() {
  PROVIDERS.length = 0;
  PROVIDERS = null;
}
