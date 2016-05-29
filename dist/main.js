"use strict";

var root_provider_1 = require('./root-provider');
var json_schema_proposal_provider_1 = require('./json-schema-proposal-provider');
var lodash_1 = require('lodash');
var providers_1 = require('./providers');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

var PROVIDERS = void 0;
function activate() {
    PROVIDERS = [];
}
exports.activate = activate;
function provideAutocomplete() {
    return new root_provider_1.default(PROVIDERS);
}
exports.provideAutocomplete = provideAutocomplete;
function provideJsonSchemaProviders() {
    return providers_1.defaultSchemaProviders;
}
exports.provideJsonSchemaProviders = provideJsonSchemaProviders;
function provideProposalProviders() {
    return providers_1.defaultProviders;
}
exports.provideProposalProviders = provideProposalProviders;
function createPromiseDisposable(promise) {
    return new Disposable(function () {
        promise.then(function (provider) {
            return lodash_1.remove(PROVIDERS, function (e) {
                return e === provider;
            });
        });
    });
}
function createSyncDisposable(provider) {
    return new Disposable(function () {
        lodash_1.remove(PROVIDERS, function (e) {
            return e === provider;
        });
    });
}
function createCompositeDisposable(providers) {
    var composite = new CompositeDisposable();
    providers.forEach(function (disposable) {
        return composite.add(disposable);
    });
    return composite;
}
function consumeJsonSchemaProviders(provider) {
    var schemaProviders = lodash_1.isArray(provider) ? provider : [provider];
    var providerPromises = schemaProviders.filter(function (s) {
        return !!s;
    }).map(function (s) {
        return json_schema_proposal_provider_1.JsonSchemaProposalProvider.createFromProvider(s);
    });
    providerPromises.forEach(function (promise) {
        return promise.then(function (p) {
            return PROVIDERS.push(p);
        });
    });
    var disposables = providerPromises.map(function (promise) {
        return createPromiseDisposable(promise);
    });
    return createCompositeDisposable(disposables);
}
exports.consumeJsonSchemaProviders = consumeJsonSchemaProviders;
function consumeJsonProposalProviders(provider) {
    var providers = (lodash_1.isArray(provider) ? provider : [provider]).filter(function (p) {
        return !!p;
    });
    providers.forEach(function (p) {
        return PROVIDERS.push(p);
    });
    return createCompositeDisposable(providers.map(function (provider) {
        return createSyncDisposable(provider);
    }));
}
exports.consumeJsonProposalProviders = consumeJsonProposalProviders;
function dispose() {
    PROVIDERS.length = 0;
    PROVIDERS = null;
}
exports.dispose = dispose;