import {IMatcher, IRequest, IProposalProvider, IProposal, IFilePatternProvider} from './provider-api'
import {flatten, trimLeft, trim, startsWith} from 'lodash'

export interface IDependency {
  name: string,
  description?: string
}

export interface IDependecyProposalConfig extends IFilePatternProvider {
  search(prefix: string): Promise<Array<IDependency>>
  versions(prefix: string): Promise<Array<string>>
  dependencyRequestMatcher(): IMatcher<IRequest>
  versionRequestMatcher(): IMatcher<IRequest>
  getDependencyFilter(request: IRequest): (dependencyName: string) => boolean;
}

function createDependencyProposal(request: IRequest, dependency: IDependency): IProposal {
  const {isBetweenQuotes, shouldAddComma} = request;
  const proposal: IProposal = {}
  proposal.displayText = dependency.name;
  proposal.rightLabel = 'dependency';
  proposal.type = 'property';
  proposal.description = dependency.description;
  if (isBetweenQuotes) {
    proposal.text = dependency.name;
  } else {
    proposal.snippet = '"' + dependency.name + '": "$1"' + (shouldAddComma ? ',' : '');
  }
  return proposal;
}

function createVersionProposal(request: IRequest, version: string): IProposal {
  const {isBetweenQuotes, shouldAddComma, prefix} = request;
  const proposal: IProposal = {}
  proposal.displayText = version;
  proposal.rightLabel = 'version';
  proposal.type = 'value';
  proposal.replacementPrefix = trimLeft(prefix, '~^<>="');
  if (isBetweenQuotes) {
    proposal.text = version;
  } else {
    proposal.snippet = '"' + version + '"' + (shouldAddComma ? ',' : '');
  }
  return proposal;
}


export class SemverDependencyProposalProvider implements IProposalProvider {

  constructor(private config: IDependecyProposalConfig) { }

  getProposals(request: IRequest): Promise<Array<IProposal>> {
    const {segments, isKeyPosition, isValuePosition} = request;
    if (this.config.dependencyRequestMatcher().matches(request)) {
      return this.getDependencyKeysProposals(request);
    }
    if (this.config.versionRequestMatcher().matches(request)) {
      return this.getDependencyVersionsProposals(request);
    }
    return Promise.resolve([]);
  }

  getDependencyKeysProposals(request: IRequest): Promise<Array<IProposal>> {
    const {prefix} = request;
    const dependencyFilter = this.config.getDependencyFilter(request);
    return this.config.search(prefix).then(packages =>
      packages.filter(dependency => dependencyFilter(dependency.name))
        .map(dependency => createDependencyProposal(request, dependency))
    );
  }

  getDependencyVersionsProposals(request: IRequest): Promise<Array<IProposal>> {
    const {segments, prefix} = request;
    const [, packageName, ...rest] = segments;
    const trimmedPrefix = trimLeft(prefix, '~^<>="');
    return this.config.versions(packageName.toString()).then(versions =>
      versions.filter(version => startsWith(version, trimmedPrefix))
        .map(version => createVersionProposal(request, version))
    );
  }

  getFilePattern(): string | string[] {
    return this.config.getFilePattern();
  }
}
