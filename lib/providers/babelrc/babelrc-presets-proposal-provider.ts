import {IProposal, IProposalProvider, IRequest} from '../../provider-api';
import {path, request} from '../../matchers';
import {includes, isString, isNumber, trim, startsWith, flatten} from 'lodash';
const {search} = require('npm-package-lookup');

const PRESETS = 'presets';
const BABEL_PRESET = 'babel-preset-';

const PRESET_MATCHER = request().value().path(path().key(PRESETS).index());

export default class BabelRCPresetsProposalProvider implements IProposalProvider {
  getProposals(request: IRequest): Promise<Array<IProposal>> {
    const {contents, prefix, isBetweenQuotes, shouldAddComma} = request;
    if (PRESET_MATCHER.matches(request)) {
      const presets: Array<string> = contents[PRESETS] || [];
      const results: Promise<Array<string>> = search(this.calculateSearchKeyword(prefix));
      return results.then(names => {
        return names.filter(name => presets.indexOf(name.replace(BABEL_PRESET, '')) < 0).map(presetName => {
          const name = presetName.replace(BABEL_PRESET, '');
          const proposal: IProposal = {};
          proposal.displayText = name;
          proposal.rightLabel = 'preset';
          proposal.type = 'preset';
          proposal.description = `${name} babel preset. Required dependency in package.json: ${presetName}`;
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
    if (startsWith(BABEL_PRESET, prefix)) {
      return BABEL_PRESET;
    } else if (startsWith(prefix, BABEL_PRESET)) {
      return prefix;
    } else {
      return BABEL_PRESET + prefix;
    }
  }

  getFilePattern() {
    return '.babelrc';
  }
}
