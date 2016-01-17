import {JsonSchemaProposalProvider} from '../../json-schema-proposal-provider';
import * as path from 'path';

export default class TsConfigJsonSchemaProposalProvider extends JsonSchemaProposalProvider {
  constructor() {
    super(this.loadLocalSchema(path.join(__dirname, './tsconfig-schema.json')));
  }

  getFilePattern() {
    return 'tsconfig.json';
  }
}