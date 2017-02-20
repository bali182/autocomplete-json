import {IDependecyProposalConfig, IDependency} from '../../semver-dependency-proposal-provider';
import {path, request} from '../../matchers';
import {IRequest} from '../../provider-api';
import {assign, trimLeft} from 'lodash';

const {searchByName, versions} = require('packagist-package-lookup');

const DEPENDENCY_PROPERTIES = ['require', 'require-dev'];
const STABLE_VERSION_REGEX = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/;

const KEY_MATCHER = request().key().path(path().key(DEPENDENCY_PROPERTIES))
const VALUE_MATCHER = request().value().path(path().key(DEPENDENCY_PROPERTIES).key())

export default <IDependecyProposalConfig>{
  search: searchByName,
  versions(name: string) {
    return versions(name, { sort: 'DESC', stable: true }).then((versions: Array<string>) => versions.map(v => trimLeft(v, 'v')))
  },
  dependencyRequestMatcher() {
    return KEY_MATCHER;
  },
  versionRequestMatcher() {
    return VALUE_MATCHER;
  },
  getFilePattern() {
    return 'composer.json';
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