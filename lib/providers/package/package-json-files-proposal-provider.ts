import {FileProposalProvider} from '../../file-proposal-provider';
import {request, path, or} from '../../matchers';

const MATCHER = or(
  request().value().path(path().key('files').index()),
  request().value().path(path().key('man').index()),
  request().value().path(path().key('man')),
  request().value().path(path().key('directories').key())
);

export default class PackageJsonConfigFileProposalProvider extends FileProposalProvider {
  getFilePattern(): string {
    return 'package.json';
  }

  getMatcher() {
    return MATCHER;
  }
}