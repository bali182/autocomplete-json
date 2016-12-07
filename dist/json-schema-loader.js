"use strict";

var fs = require('fs');
var os = require('os');
var lodash_1 = require('lodash');
var uriJs = require('uri-js');
var axios_1 = require('axios');
exports.fileSchemaLoader = {
    normalizePath: function normalizePath(path) {
        if (os.platform() === 'win32') {
            return lodash_1.trimLeft(path, '/');
        }
        return path;
    },
    load: function load(uri) {
        var _this = this;

        return new Promise(function (resolve, reject) {
            fs.readFile(_this.normalizePath(uri.path), 'UTF-8', function (error, data) {
                if (error) {
                    reject(error);
                } else {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        });
    }
};
exports.httpSchemaLoader = {
    load: function load(uri) {
        return axios_1.default.get(uriJs.serialize(uri)).then(function (response) {
            return response.data;
        });
    }
};
exports.anySchemaLoader = {
    load: function load(uri) {
        switch (uri.scheme) {
            case 'file':
                return exports.fileSchemaLoader.load(uri);
            case 'http':
                return exports.httpSchemaLoader.load(uri);
            default:
                throw new Error('Unknown URI format ' + JSON.stringify(uri));
        }
    }
};
function loadSchema(uri) {
    return exports.anySchemaLoader.load(uriJs.parse(uri));
}
exports.loadSchema = loadSchema;