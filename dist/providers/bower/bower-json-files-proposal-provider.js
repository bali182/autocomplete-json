"use strict";

var matchers_1 = require('../../matchers');
var provider_api_1 = require('../../provider-api');
var MATCHER = matchers_1.or(matchers_1.request().value().path(matchers_1.path().key('ignore').index()), matchers_1.request().value().path(matchers_1.path().key('ignore')), matchers_1.request().value().path(matchers_1.path().key('main').index()), matchers_1.request().value().path(matchers_1.path().key('main')));
var provider = {
    getFileExtensions: function getFileExtensions() {
        return null;
    },
    getStorageType: function getStorageType() {
        return provider_api_1.StorageType.BOTH;
    },
    getMatcher: function getMatcher() {
        return MATCHER;
    },
    getFilePattern: function getFilePattern() {
        return 'bower.json';
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = provider;