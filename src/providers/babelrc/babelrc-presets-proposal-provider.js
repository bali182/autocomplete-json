'use babel'

import startsWith from 'lodash/startsWith'
import { path, request } from '../../matchers'
import { search } from 'npm-package-lookup'

const PRESETS = 'presets'
const BABEL_PRESET = 'babel-preset-'

const PRESET_MATCHER = request().value().path(path().key(PRESETS).index())

export default class BabelRCPresetsProposalProvider {
  getProposals(req) {
    const {contents, prefix, isBetweenQuotes, shouldAddComma} = req
    if (PRESET_MATCHER.matches(request)) {
      const presets = contents[PRESETS] || []
      const results = search(this.calculateSearchKeyword(prefix))
      return results.then(names => names.filter(name => presets.indexOf(name.replace(BABEL_PRESET, '')) < 0).map(presetName => {
        const name = presetName.replace(BABEL_PRESET, '')
        const proposal = {
          displayText: name,
          rightLabel: 'preset',
          type: 'preset',
          description: `${name} babel preset. Required dependency in package.json: ${presetName}`,
          [isBetweenQuotes ? 'text' : 'snippet']: isBetweenQuotes ? name : `"${ name }"${ shouldAddComma ? ',' : ''}`
        }
        return proposal
      }))
    }
    return Promise.resolve([])
  }

  calculateSearchKeyword(prefix) {
    if (startsWith(BABEL_PRESET, prefix)) {
      return BABEL_PRESET
    } else if (startsWith(prefix, BABEL_PRESET)) {
      return prefix
    } 
    return BABEL_PRESET + prefix
    
  }

  getFilePattern() {
    return '.babelrc'
  }
}
