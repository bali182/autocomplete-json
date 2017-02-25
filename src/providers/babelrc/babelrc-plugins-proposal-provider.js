'use babel'

import startsWith from 'lodash/startsWith'

import { path, request } from '../../matchers'
import { search } from 'npm-package-lookup'

const PLUGINS = 'plugins'
const BABEL_PLUGIN = 'babel-plugin-'

const PRESET_MATCHER = request().value().path(path().key(PLUGINS).index())

export default class BabelRCPluginsProposalProvider {
  getProposals(req) {
    const { contents, prefix, isBetweenQuotes, shouldAddComma} = req
    if (PRESET_MATCHER.matches(req)) {
      const plugins = contents[PLUGINS] || []
      const results = search(this.calculateSearchKeyword(prefix))
      return results.then(names => names.filter(name => plugins.indexOf(name.replace(BABEL_PLUGIN, '')) < 0).map(pluginName => {
        const name = pluginName.replace(BABEL_PLUGIN, '')
        const proposal = {}
        proposal.displayText = name
        proposal.rightLabel = 'plugin'
        proposal.type = 'plugin'
        proposal.description = `${name} babel plugin. Required dependency in package.json: ${pluginName}`
        if (isBetweenQuotes) {
          proposal.text = name
        } else {
          proposal.snippet = `"${name}"${shouldAddComma ? ',' : ''}`
        }
        return proposal
      }))
    }
    return Promise.resolve([])
  }

  calculateSearchKeyword(prefix) {
    if (startsWith(BABEL_PLUGIN, prefix)) {
      return BABEL_PLUGIN
    } else if (startsWith(prefix, BABEL_PLUGIN)) {
      return prefix
    }
    return BABEL_PLUGIN + prefix

  }

  getFilePattern() {
    return '.babelrc'
  }
}
