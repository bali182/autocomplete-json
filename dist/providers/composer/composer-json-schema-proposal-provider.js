"use strict";

var path = require('path');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    getSchemaURI: function getSchemaURI() {
        return path.join(__dirname, './composer-schema.json');
    },
    getFilePattern: function getFilePattern() {
        return 'composer.json';
    }
};