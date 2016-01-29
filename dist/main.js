var root_provider_1 = require('./root-provider');
var json_schema_proposal_provider_1 = require('./json-schema-proposal-provider');
var lodash_1 = require('lodash');
var providers_1 = require('./providers');
var _a = require('atom'), CompositeDisposable = _a.CompositeDisposable, Disposable = _a.Disposable;
var PROVIDERS;
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
function createDisposable(providers) {
    return providers.reduce(function (disposable, provider) {
        disposable.add(new Disposable(function (provider) {
            lodash_1.remove(PROVIDERS, function (e) { return e === provider; });
        }));
        return disposable;
    }, new CompositeDisposable());
}
function consumeJsonSchemaProviders(provider) {
    var schemaProviders = lodash_1.isArray(provider) ? provider : [provider];
    var providers = schemaProviders.filter(function (s) { return !!s; }).map(function (s) { return new json_schema_proposal_provider_1.JsonSchemaProposalProvider(s); });
    providers.forEach(function (p) { return PROVIDERS.push(p); });
    return createDisposable(providers);
}
exports.consumeJsonSchemaProviders = consumeJsonSchemaProviders;
function consumeJsonProposalProviders(provider) {
    var providers = (lodash_1.isArray(provider) ? provider : [provider]).filter(function (p) { return !!p; });
    providers.forEach(function (p) { return PROVIDERS.push(p); });
    return createDisposable(providers);
}
exports.consumeJsonProposalProviders = consumeJsonProposalProviders;
function dispose() {
    PROVIDERS.length = 0;
    PROVIDERS = null;
}
exports.dispose = dispose;
