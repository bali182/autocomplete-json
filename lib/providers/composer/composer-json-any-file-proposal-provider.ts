import {FileProposalProvider} from '../../file-proposal-provider';
import {request, path, or} from '../../matchers';
import {IFileProposalConfiguration, StorageType, IMatcher, IRequest} from '../../provider-api';

const MATCHER = or(
  request().value().path(path().key('bin').index())
);


const provider: IFileProposalConfiguration = {
  getFileExtensions(): Array<string> {
    return null;
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
