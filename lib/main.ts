/// <reference path="../typings/tsd" />

import RootProvider from './root-provider';
import providerPaths from './provider-list';

module.exports = {
  activate() {
    this.providers = providerPaths.map(path => require(path)["default"])
      .map(ProviderClass => new ProviderClass());
  },

  provide() {
    return new RootProvider(this.providers);
  }
}
