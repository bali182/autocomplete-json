import {JsonSchemaProposalProvider} from '../../json-schema-proposal-provider';
import * as path from 'path';

export default class PackageJsonSchemaProposalProvider extends JsonSchemaProposalProvider {
  constructor() {
    super(this.loadLocalSchema(path.join(__dirname, './package-schema.json')));
  }

  getFilePattern() {
    return 'package.json';
  }
}