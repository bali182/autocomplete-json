import {IProposal, IProposalProvider, IRequest} from '../../provider-api';
import {path, request} from '../../matchers';
import {includes, isString, trim, startsWith, flatten} from 'lodash';
const {searchByName, versions} = require('packagist-package-lookup');

const DEPENDENCY_PROPERTIES = ['require', 'require-dev'];
const STABLE_VERSION_REGEX = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/;

const KEY_MATCHER = request().key().path(path().key(DEPENDENCY_PROPERTIES))
const VALUE_MATCHER = request().value().path(path().key(DEPENDENCY_PROPERTIES).key())

interface IPackageInfo {
  "name": string,
  "description": string,
  "url": string,
  "repository": string,
  "downloads": number,
  "favers": number
}

function createPackageNameProposal(p: IPackageInfo, request: IRequest): IProposal {
  const {isBetweenQuotes, shouldAddComma} = request;
  const proposal: IProposal = {}
  proposal.displayText = p.name;
  proposal.description = p.description;
  proposal.rightLabel = 'dependency';
  proposal.type = 'property';
  if (isBetweenQuotes) {
    proposal.text = p.name;
  } else {
    proposal.snippet = '"' + p.name + '": "$1"' + (shouldAddComma ? ',' : '');
  }
  return proposal;
}

function getUsedKeys(request: IRequest) {
  const {contents} = request;
  const safeContents = contents || {};
  return flatten(DEPENDENCY_PROPERTIES
    .map(property => safeContents[property] || {})
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
  return proposal;
}

function isStableVersion(version: string): boolean {
  return STABLE_VERSION_REGEX.test(version);
}

export default class PackageJsonDependencyProposalProvider implements IProposalProvider {
  getProposals(request: IRequest): Promise<Array<IProposal>> {
    const {segments, isKeyPosition, isValuePosition} = request;

    if (KEY_MATCHER.matches(request)) {
      return this.getDependencyKeysProposals(request);
    }

    if (VALUE_MATCHER.matches(request)) {
      return this.getDependencyVersionsProposals(request);
    }

    return Promise.resolve([]);
  }

  transformPackages(packages: Array<IPackageInfo>, request: IRequest): Array<IProposal> {
    const usedKeys = getUsedKeys(request);
    return packages
      .filter(p => !includes(usedKeys, p.name))
      .map(p => createPackageNameProposal(p, request));
  }

  getDependencyKeysProposals(request: IRequest): Promise<Array<IProposal>> {
    const {prefix} = request;
    return searchByName(prefix).then((packageNames: Array<IPackageInfo>) => this.transformPackages(packageNames, request));
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
    return 'composer.json';
  }
}
