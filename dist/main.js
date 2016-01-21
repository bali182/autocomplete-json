var root_provider_1 = require('./root-provider');
var provider_list_1 = require('./provider-list');
function activate() {
    this.providers = provider_list_1.default.map(function (path) { return require(path)["default"]; })
        .map(function (ProviderClass) { return new ProviderClass(); });
}
exports.activate = activate;
function provide() {
    return new root_provider_1.default(this.providers);
}
exports.provide = provide;
