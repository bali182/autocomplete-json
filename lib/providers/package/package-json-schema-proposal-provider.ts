import * as path from 'path';

export default {
  getSchemaURI() {
    return path.join(__dirname, './package-schema.json');
  },
  
  getFilePattern() {
    return 'package.json';
  }
};
