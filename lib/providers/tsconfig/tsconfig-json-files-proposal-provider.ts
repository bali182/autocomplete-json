import {FileProposalProvider} from '../../file-proposal-provider';
import {request, path, or} from '../../matchers';

const MATCHER = or(
  request().value().path(path().key('files').index()),
  request().value().path(path().key('exclude').index())
);

export default class TsConfigJsonFileProposalProvider extends FileProposalProvider {
  getFilePattern(): string {
    return 'tsconfig.json';
  }

  getMatcher() {
    return MATCHER;
  }
}