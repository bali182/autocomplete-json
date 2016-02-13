import * as path from 'path';

export default {
  getSchemaURI() {
    return path.join(__dirname, './composer-schema.json');
  },
  
  getFilePattern() {
    return 'composer.json';
  }
};
