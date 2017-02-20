import {FileProposalProvider} from '../../file-proposal-provider';
import {request, path, or} from '../../matchers';
import {IFileProposalConfiguration, StorageType, IMatcher, IRequest} from '../../provider-api';

const MATCHER = request().value().path(path().key('directories').key());

const provider: IFileProposalConfiguration = {
  getFileExtensions(): Array<string> {
    return null;
  },

  getStorageType(): StorageType {
    return StorageType.FOLDER;
  },

  getMatcher(): IMatcher<IRequest> {
    return MATCHER;
  },

  getFilePattern(): string {
    return 'package.json';
  }
}

export default provider;
