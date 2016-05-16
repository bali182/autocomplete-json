import * as path from 'path';

export default {
  getSchemaURI() {
    return path.join(__dirname, './aws-schema.json');
  },
  
  getFilePattern() {
    return 'aws.json';
  }
};
