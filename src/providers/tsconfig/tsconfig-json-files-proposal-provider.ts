import {FileProposalProvider} from '../../file-proposal-provider';
import {request, path, or} from '../../matchers';
import {IFileProposalConfiguration, StorageType, IMatcher, IRequest} from '../../provider-api';

const MATCHER = or(
  request().value().path(path().key('files').index()),
  request().value().path(path().key('exclude').index())
);


const provider: IFileProposalConfiguration = {
  getFileExtensions(): Array<string> {
    return ['.ts', '.tsx'];
  },

  getStorageType(): StorageType {
    return StorageType.BOTH;
  },

  getMatcher(): IMatcher<IRequest> {
    return MATCHER;
  },

  getFilePattern(): string {
    return 'tsconfig.json';
  }
}

export default provider;
