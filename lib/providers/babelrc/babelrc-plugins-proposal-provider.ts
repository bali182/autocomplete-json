import {IProposal, IProposalProvider, IRequest} from '../../provider-api';
import {path, request} from '../../matchers';
import {includes, isString, isNumber, trim, startsWith, flatten} from 'lodash';
const {search} = require('npm-package-lookup');

const PLUGINS = 'plugins';
const BABEL_PLUGIN = 'babel-plugin-';

const PRESET_MATCHER = request().value().path(path().key(PLUGINS).index());

export default class BabelRCPluginsProposalProvider implements IProposalProvider {
  getProposals(request: IRequest): Promise<Array<IProposal>> {
    const {segments, contents, prefix, isBetweenQuotes, shouldAddComma} = request;
    if (PRESET_MATCHER.matches(request)) {
      const plugins: Array<string> = contents[PLUGINS] || [];
      const results: Promise<Array<string>> = search(this.calculateSearchKeyword(prefix));
      return results.then(names => {
        return names.filter(name => plugins.indexOf(name.replace(BABEL_PLUGIN, '')) < 0).map(pluginName => {
          const name = pluginName.replace(BABEL_PLUGIN, '');
          const proposal: IProposal = {};
          proposal.displayText = name;
          proposal.rightLabel = 'plugin';
          proposal.type = 'plugin';
          proposal.description = `${name} babel plugin. Required dependency in package.json: ${pluginName}`;
          if (isBetweenQuotes) {
            proposal.text = name;
          } else {
            proposal.snippet = '"' + name + '"' + (shouldAddComma ? ',' : '');
          }
          return proposal;
        });
      });
    }
    return Promise.resolve([]);
  }

  calculateSearchKeyword(prefix: string) {
    if (startsWith(BABEL_PLUGIN, prefix)) {
      return BABEL_PLUGIN;
    } else if (startsWith(prefix, BABEL_PLUGIN)) {
      return prefix;
    } else {
      return BABEL_PLUGIN + prefix;
    }
  }

  getFilePattern() {
    return '.babelrc';
  }
}
