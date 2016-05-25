"use strict";

var path = require('path');
var fileUrl = require('file-url');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    getSchemaURI: function getSchemaURI() {
        return fileUrl(path.join(__dirname, './bower-schema.json'));
    },
    getFilePattern: function getFilePattern() {
        return 'bower.json';
    }
};