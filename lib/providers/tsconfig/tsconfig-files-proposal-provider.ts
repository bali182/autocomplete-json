import {FileProposalProvider} from '../../file-proposal-provider';
import {request, path} from '../../matchers';

const MATCHER = request().value().path(path().key('files').index());

export default class TsConfigFileProposalProvider extends FileProposalProvider {
  getFilePattern(): string {
    return 'tsconfig.json';
  }

  getMatcher() {
    return MATCHER;
  }
}