var path = require('path');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    getSchemaURI: function () {
        return path.join(__dirname, './tsconfig-schema.json');
    },
    getFilePattern: function () {
        return 'tsconfig.json';
    }
};
