import {IProposal, IRequest, IProposalProvider} from '../../provider-api';
import {matches} from '../../utils';
import {flatten} from 'lodash';
import * as minimatch from 'minimatch';

export class CompoundProposalProvider implements IProposalProvider {
  private providers: Array<IProposalProvider> = [];

  addProvider(provider: IProposalProvider): void {
    this.addProviders([provider]);
  }

  addProviders(providers: Array<IProposalProvider>): void {
    this.providers = this.providers.concat(providers);
  }

  hasProposals(fileName: string) {
    return this.providers.some(provider => matches(fileName, provider.getFilePattern()));
  }

  getProposals(request: IRequest): Promise<Array<IProposal>> {
    const fileName = request.editor.buffer.file.getBaseName();
    return Promise.all(
      this.providers
        .filter(provider => matches(fileName, provider.getFilePattern()))
        .map(provider => provider.getProposals(request))
    ).then(results => flatten(results));
  }

  getFilePattern(): string {
    return undefined; // not used
  }
}
