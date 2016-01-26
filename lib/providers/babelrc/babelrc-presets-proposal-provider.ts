import {IProposal, IProposalProvider, IRequest} from '../../provider-api';
import {includes, isString, isNumber, trim, startsWith, flatten} from 'lodash';
const {search} = require('npm-package-lookup');

const PRESETS = 'presets';
const BABEL_PRESET = 'babel-preset-';

export default class BabelRCPresetsProposalProvider implements IProposalProvider {
  getProposals(request: IRequest): Promise<Array<IProposal>> {
    const {segments, contents, prefix, isBetweenQuotes, shouldAddComma} = request;
    if (segments && contents && segments.length === 2 && segments[0] === PRESETS && isNumber(segments[1])) {
      const presets: Array<string> = contents[PRESETS] || [];
      const results: Promise<Array<string>> = search(this.calculateSearchKeyword(prefix));
      return results.then(names => {
        return names.map(presetName => {
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
    return 'babelrc.json';
  }
}
