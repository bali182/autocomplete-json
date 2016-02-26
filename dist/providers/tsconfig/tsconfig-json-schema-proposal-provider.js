"use strict";

var path = require('path');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    getSchemaURI: function getSchemaURI() {
        return path.join(__dirname, './tsconfig-schema.json');
    },
    getFilePattern: function getFilePattern() {
        return 'tsconfig.json';
    }
};