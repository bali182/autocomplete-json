var root_provider_1 = require('./root-provider');
var provider_list_1 = require('./provider-list');
module.exports = {
    activate: function () {
        this.providers = provider_list_1.default.map(function (path) { return require(path)["default"]; })
            .map(function (ProviderClass) { return new ProviderClass(); });
    },
    provide: function () {
        return new root_provider_1.default(this.providers);
    }
};
