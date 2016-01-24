import * as path from 'path';

export default {
  getSchemaURI() {
    return path.join(__dirname, './bower-schema.json');
  },
  
  getFilePattern() {
    return 'bower.json';
  }
};
