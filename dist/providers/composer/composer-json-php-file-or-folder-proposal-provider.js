"use strict";

var matchers_1 = require('../../matchers');
var provider_api_1 = require('../../provider-api');
var MATCHER = matchers_1.or(matchers_1.request().value().path(matchers_1.path().key('autoload').key('classmap').index()), matchers_1.request().value().path(matchers_1.path().key('autoload').key('files').index()), matchers_1.request().value().path(matchers_1.path().key('autoload-dev').key('classmap').index()), matchers_1.request().value().path(matchers_1.path().key('autoload-dev').key('files').index()), matchers_1.request().value().path(matchers_1.path().key('include-path').index()));
var provider = {
    getFileExtensions: function getFileExtensions() {
        return ['.php'];
    },
    getStorageType: function getStorageType() {
        return provider_api_1.StorageType.BOTH;
    },
    getMatcher: function getMatcher() {
        return MATCHER;
    },
    getFilePattern: function getFilePattern() {
        return 'composer.json';
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = provider;