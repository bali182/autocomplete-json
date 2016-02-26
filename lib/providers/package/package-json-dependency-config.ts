import {IDependecyProposalConfig, IDependency} from '../../semver-dependency-proposal-provider';
import {path, request} from '../../matchers';
import {IRequest} from '../../provider-api';
import {assign} from 'lodash';

const {search, versions} = require('npm-package-lookup');

const DEPENDENCY_PROPERTIES = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
const KEY_MATCHER = request().key().path(path().key(DEPENDENCY_PROPERTIES))
const VALUE_MATCHER = request().value().path(path().key(DEPENDENCY_PROPERTIES).key())

export default <IDependecyProposalConfig>{
  versions(name) {
    return versions(name, { sort: 'DESC', stable: true });
  },
  search(prefix: string) {
    return search(prefix).then((results: Array<string>) => results.map(name => ({ name })))
  },
  dependencyRequestMatcher() {
    return KEY_MATCHER;
  },
  versionRequestMatcher() {
    return VALUE_MATCHER;
  },
  getFilePattern() {
    return 'package.json';
  },
  isAvailable(request: IRequest, dependency: IDependency) {
    return false;
  },
  getDependencyFilter(request: IRequest) {
    const {contents} = request;
    if (!contents) {
      return (dependency: string) => true;
    }
    const objects = DEPENDENCY_PROPERTIES.map(prop => contents[prop] || {})
    const merged: Object = (<(...args: any) => Object>assign)(...objects) || {};
    return (dependency: string) => !merged.hasOwnProperty(dependency);
  }
};