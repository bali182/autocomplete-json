/// <reference path="../typings/tsd" />

import RootProvider from './root-provider';
import providerPaths from './provider-list';

export function activate() {
  this.providers = providerPaths.map(path => require(path)["default"])
    .map(ProviderClass => new ProviderClass());
}

export function provide() {
  return new RootProvider(this.providers);
}
