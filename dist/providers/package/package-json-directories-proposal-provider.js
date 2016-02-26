"use strict";

var matchers_1 = require('../../matchers');
var provider_api_1 = require('../../provider-api');
var MATCHER = matchers_1.request().value().path(matchers_1.path().key('directories').key());
var provider = {
    getFileExtensions: function getFileExtensions() {
        return null;
    },
    getStorageType: function getStorageType() {
        return provider_api_1.StorageType.FOLDER;
    },
    getMatcher: function getMatcher() {
        return MATCHER;
    },
    getFilePattern: function getFilePattern() {
        return 'package.json';
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = provider;