import {IProposal, IProposalProvider, IRequest} from '../../provider-api';
import {includes, isString, trim, startsWith, flatten} from 'lodash';
const {search, versions} = require('npm-package-lookup');

const DEPENDENCY_PROPERTIES = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
const STABLE_VERSION_REGEX = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/;
const EMPTY_OBJECT = {};

function createPackageNameProposal(key: string, request: IRequest): IProposal {
  const {isBetweenQuotes, shouldAddComma} = request;
  const proposal: IProposal = {}
  proposal.displayText = key;
  proposal.rightLabel = 'dependency';
  proposal.type = 'property';
  if (isBetweenQuotes) {
    proposal.text = key;
  } else {
    proposal.snippet = '"' + key + '": "$1"' + (shouldAddComma ? ',' : '');
  }
  proposal.iconHTML = '<i class="icon-package"></i>';
  return proposal;
}

function getUsedKeys(request: IRequest) {
  const {contents} = request;
  const safeContents = contents || EMPTY_OBJECT;
  return flatten(DEPENDENCY_PROPERTIES
    .map(property => safeContents[property] || EMPTY_OBJECT)
    .map(object => Object.keys(object)));
}

function createVersionProposal(version: string, request: IRequest): IProposal {
  const {isBetweenQuotes, shouldAddComma, token} = request;
  const proposal: IProposal = {}
  proposal.displayText = version;
  proposal.rightLabel = 'version';
  proposal.type = 'value';
  proposal.replacementPrefix = trim(token, '"');
  if (isBetweenQuotes) {
    proposal.text = version;
  } else {
    proposal.snippet = '"' + version + '"' + (shouldAddComma ? ',' : '');
  }
  proposal.iconHTML = '<i class="icon-versions"></i>';
  return proposal;
}

function isStableVersion(version: string): boolean {
  return STABLE_VERSION_REGEX.test(version);
}

export default class PackageJsonDependencyProposalProvider implements IProposalProvider {
  getProposals(request: IRequest): Promise<Array<IProposal>> {
    const {segments, isKeyPosition, isValuePosition} = request;

    if (segments && segments.length === 1 && isKeyPosition) {
      const [key] = segments;
      if (includes(DEPENDENCY_PROPERTIES, key)) {
        return this.getDependencyKeysProposals(request);
      }
    }

    if (segments && segments.length === 2 && isValuePosition) {
      const [firstKey, secondKey] = segments;
      if (includes(DEPENDENCY_PROPERTIES, firstKey) && isString(secondKey)) {
        return this.getDependencyVersionsProposals(request);
      }
    }

    return Promise.resolve([]);
  }

  transformPackageNames(packageNames: Array<string>, request: IRequest): Array<IProposal> {
    const usedKeys = getUsedKeys(request);
    return packageNames
      .filter(name => !includes(usedKeys, name))
      .map(name => createPackageNameProposal(name, request));
  }

  getDependencyKeysProposals(request: IRequest): Promise<Array<IProposal>> {
    const {prefix} = request;
    return search(prefix).then((packageNames: Array<string>) => this.transformPackageNames(packageNames, request));
  }

  transformPackageVersions(packageVersions: Array<string>, request: IRequest): Array<IProposal> {
    const {token} = request;
    const trimmedToken = trim(token, '"');
    return packageVersions
      .filter(version => isStableVersion(version))
      .filter(version => startsWith(version, trimmedToken))
      .map(version => createVersionProposal(version, request));
  }

  getDependencyVersionsProposals(request: IRequest): Promise<Array<IProposal>> {
    const {segments, token} = request;
    const [, packageName, ...rest] = segments;
    return versions(packageName.toString())
      .then((packageVersions: Array<string>) => this.transformPackageVersions(packageVersions, request))
  }

  getFilePattern() {
    return 'package.json';
  }
}
