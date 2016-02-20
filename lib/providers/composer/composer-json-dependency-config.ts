import {IDependecyProposalConfig, IPackage} from '../../semver-dependency-proposal-provider';
import {path, request} from '../../matchers';
const {searchByName, versions} = require('packagist-package-lookup');

const DEPENDENCY_PROPERTIES = ['require', 'require-dev'];
const STABLE_VERSION_REGEX = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/;

const KEY_MATCHER = request().key().path(path().key(DEPENDENCY_PROPERTIES))
const VALUE_MATCHER = request().value().path(path().key(DEPENDENCY_PROPERTIES).key())

export default <IDependecyProposalConfig>{
  versions,
  search: searchByName,
  dependencyRequestMatcher() {
    return KEY_MATCHER;
  },
  versionRequestMatcher() {
    return VALUE_MATCHER;
  },
  getFilePattern() {
    return 'composer.json';
  }
};