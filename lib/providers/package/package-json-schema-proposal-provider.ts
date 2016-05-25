import * as path from 'path';
const fileUrl = require('file-url');

export default {
  getSchemaURI() {
    return fileUrl(path.join(__dirname, './package-schema.json'));
  },
  
  getFilePattern() {
    return 'package.json';
  }
};
