import {IDependecyProposalConfig, IPackage} from '../../semver-dependency-proposal-provider';
import {path, request} from '../../matchers';
const {search, versions} = require('npm-package-lookup');

const DEPENDENCY_PROPERTIES = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
const KEY_MATCHER = request().key().path(path().key(DEPENDENCY_PROPERTIES))
const VALUE_MATCHER = request().value().path(path().key(DEPENDENCY_PROPERTIES).key())

export default <IDependecyProposalConfig>{
  versions,
  search(prefix: string) {
    return search(prefix).then((results: Array<string>) => results.map(name => { name }))
  },
  dependencyRequestMatcher() {
    return KEY_MATCHER;
  },
  versionRequestMatcher() {
    return VALUE_MATCHER;
  },
  getFilePattern() {
    return 'package.json';
  }
};