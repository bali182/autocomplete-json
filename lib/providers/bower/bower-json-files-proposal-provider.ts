import {FileProposalProvider} from '../../file-proposal-provider';
import {request, path, or} from '../../matchers';
import {IFileProposalConfiguration, StorageType, IMatcher, IRequest} from '../../provider-api';

const MATCHER = or(
  request().value().path(path().key('ignore').index()),
  request().value().path(path().key('ignore')),
  request().value().path(path().key('main').index()),
  request().value().path(path().key('main'))
);

const provider: IFileProposalConfiguration = {
  getFileExtensions(): Array<string> {
    return null; // any file is OK
  },

  getStorageType(): StorageType {
    return StorageType.BOTH;
  },

  getMatcher(): IMatcher<IRequest> {
    return MATCHER;
  },

  getFilePattern(): string {
    return 'bower.json';
  }
}

export default provider;
