"use strict";

var path = require('path');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    getSchemaURI: function getSchemaURI() {
        return path.join(__dirname, './babelrc-schema.json');
    },
    getFilePattern: function getFilePattern() {
        return '.babelrc';
    }
};