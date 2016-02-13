var matchers_1 = require('../../matchers');
var provider_api_1 = require('../../provider-api');
var MATCHER = matchers_1.or(matchers_1.request().value().path(matchers_1.path().key('bin').index()));
var provider = {
    getFileExtensions: function () {
        return null;
    },
    getStorageType: function () {
        return provider_api_1.StorageType.BOTH;
    },
    getMatcher: function () {
        return MATCHER;
    },
    getFilePattern: function () {
        return 'composer.json';
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = provider;
