import * as path from 'path';

export default {
  getSchemaURI() {
    return path.join(__dirname, './tsconfig-schema.json');
  },
  
  getFilePattern() {
    return 'tsconfig.json';
  }
};
