import * as path from 'path';

export default {
  getSchemaURI() {
    return path.join(__dirname, './babelrc-schema.json');
  },
  
  getFilePattern() {
    return '.babelrc';
  }
};
