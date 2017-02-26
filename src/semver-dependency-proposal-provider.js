'use babel'

import trimStart from 'lodash/trimStart'
import startsWith from 'lodash/startsWith'

function createDependencyProposal(request, dependency) {
  const {isBetweenQuotes, shouldAddComma} = request
  const proposal = {}
  proposal.displayText = dependency.name
  proposal.rightLabel = 'dependency'
  proposal.type = 'property'
  proposal.description = dependency.description
  if (isBetweenQuotes) {
    proposal.text = dependency.name
  } else {
    proposal.snippet = `"${dependency.name}": "$1"${shouldAddComma ? ',' : ''}`
  }
  return proposal
}

function createVersionProposal(request, version) {
  const {isBetweenQuotes, shouldAddComma, prefix} = request
  const proposal = {}
  proposal.displayText = version
  proposal.rightLabel = 'version'
  proposal.type = 'value'
  proposal.replacementPrefix = trimStart(prefix, '~^<>="')
  if (isBetweenQuotes) {
    proposal.text = version
  } else {
    proposal.snippet = `"${version}"${shouldAddComma ? ',' : ''}`
  }
  return proposal
}


export class SemverDependencyProposalProvider {

  constructor(config) {
    this.config = config
  }

  getProposals(request) {
    if (this.config.dependencyRequestMatcher().matches(request)) {
      return this.getDependencyKeysProposals(request)
    }
    if (this.config.versionRequestMatcher().matches(request)) {
      return this.getDependencyVersionsProposals(request)
    }
    return Promise.resolve([])
  }

  getDependencyKeysProposals(request) {
    const {prefix} = request
    const dependencyFilter = this.config.getDependencyFilter(request)
    return this.config.search(prefix).then(packages =>
      packages.filter(dependency => dependencyFilter(dependency.name))
        .map(dependency => createDependencyProposal(request, dependency))
    )
  }

  getDependencyVersionsProposals(request) {
    const {segments, prefix} = request
    const [, packageName] = segments
    const trimmedPrefix = trimStart(prefix, '~^<>="')
    return this.config.versions(packageName.toString()).then(versions =>
      versions.filter(version => startsWith(version, trimmedPrefix))
        .map(version => createVersionProposal(request, version))
    )
  }

  getFilePattern() {
    return this.config.getFilePattern()
  }
}
