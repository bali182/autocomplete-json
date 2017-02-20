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

  hasProposals(file: any) {
    return this.providers.some(provider => matches(file, provider.getFilePattern()));
  }

  getProposals(request: IRequest): Promise<Array<IProposal>> {
    const file = request.editor.buffer.file;
    return Promise.all(
      this.providers
        .filter(provider => matches(file, provider.getFilePattern()))
        .map(provider => provider.getProposals(request))
    ).then(results => flatten(results));
  }

  getFilePattern(): string {
    return undefined; // not used
  }
}
