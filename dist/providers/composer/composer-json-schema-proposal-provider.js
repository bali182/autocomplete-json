var path = require('path');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    getSchemaURI: function () {
        return path.join(__dirname, './composer-schema.json');
    },
    getFilePattern: function () {
        return 'composer.json';
    }
};
