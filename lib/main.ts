/// <reference path="../typings/index.d.ts"/>

import RootProvider from './root-provider';
import {IJsonSchemaProvider, IProposalProvider} from './provider-api';
import {JsonSchemaProposalProvider} from './json-schema-proposal-provider';
import {isArray, remove} from 'lodash';
import {defaultProviders, defaultSchemaProviders} from './providers';

const {CompositeDisposable, Disposable} = require('atom');

let PROVIDERS: Array<IProposalProvider>

export function activate() {
  PROVIDERS = [];
}

export function provideAutocomplete() {
  return new RootProvider(PROVIDERS);
}

export function provideJsonSchemaProviders(): IJsonSchemaProvider | Array<IJsonSchemaProvider> {
  return defaultSchemaProviders;
}

export function provideProposalProviders(): IProposalProvider | Array<IProposalProvider> {
  return defaultProviders;
}

function createPromiseDisposable(promise: Promise<IProposalProvider>) {
  return new Disposable(() => {
    promise.then(provider => remove(PROVIDERS, (e: any) => e === provider))
  });
}

function createSyncDisposable(provider: IProposalProvider) {
  return new Disposable(() => {
    remove(PROVIDERS, (e: any) => e === provider);
  });
}

function createCompositeDisposable(providers: Array<any>): any {
  const composite = new CompositeDisposable();
  providers.forEach(disposable => composite.add(disposable));
  return composite;
}

export function consumeJsonSchemaProviders(provider: IJsonSchemaProvider | Array<IJsonSchemaProvider>): any {
  const schemaProviders = isArray(provider) ? provider : [provider];
  const providerPromises = schemaProviders.filter(s => !!s)
    .map(s => JsonSchemaProposalProvider.createFromProvider(s))
  providerPromises.forEach(promise => promise.then(p => PROVIDERS.push(p)));
  const disposables = providerPromises.map(promise => createPromiseDisposable(promise));
  return createCompositeDisposable(disposables);
}

export function consumeJsonProposalProviders(provider: IProposalProvider | Array<IProposalProvider>): any {
  const providers: Array<IProposalProvider> = (isArray(provider) ? provider : [provider]).filter(p => !!p);
  providers.forEach(p => PROVIDERS.push(p));
  return createCompositeDisposable(providers.map(provider => createSyncDisposable(provider)));
}

export function dispose() {
  PROVIDERS.length = 0;
  PROVIDERS = null;
}
