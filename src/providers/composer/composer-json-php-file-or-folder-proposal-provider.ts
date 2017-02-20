import {FileProposalProvider} from '../../file-proposal-provider';
import {request, path, or} from '../../matchers';
import {IFileProposalConfiguration, StorageType, IMatcher, IRequest} from '../../provider-api';

const MATCHER = or(
  request().value().path(path().key('autoload').key('classmap').index()),
  request().value().path(path().key('autoload').key('files').index()),
  request().value().path(path().key('autoload-dev').key('classmap').index()),
  request().value().path(path().key('autoload-dev').key('files').index()),
  request().value().path(path().key('include-path').index())

);


const provider: IFileProposalConfiguration = {
  getFileExtensions(): Array<string> {
    return ['.php'];
  },

  getStorageType(): StorageType {
    return StorageType.BOTH;
  },

  getMatcher(): IMatcher<IRequest> {
    return MATCHER;
  },

  getFilePattern(): string {
    return 'composer.json';
  }
}

export default provider;
