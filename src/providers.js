'use babel'

import { FileProposalProvider } from './file-proposal-provider'
import { SemverDependencyProposalProvider } from './semver-dependency-proposal-provider'

// Regular provider classes
import BabelRCPresetsProposalProvider from './providers/babelrc/babelrc-presets-proposal-provider'
import BabelRCPluginsProposalProvider from './providers/babelrc/babelrc-plugins-proposal-provider'

// File config instances
import tsConfigFiles from './providers/tsconfig/tsconfig-json-files-proposal-provider'
import packageFiles from './providers/package/package-json-files-proposal-provider'
import packageDirectories from './providers/package/package-json-directories-proposal-provider'
import bowerFiles from './providers/bower/bower-json-files-proposal-provider'
import composerDirsAndPhpFiles from './providers/composer/composer-json-php-file-or-folder-proposal-provider'
import composerAnyFiles from './providers/composer/composer-json-any-file-proposal-provider'

// Semver proposal providers
import composerDepConfig from './providers/composer/composer-json-dependency-config'
import packageDepConfig from './providers/package/package-json-dependency-config'

import SchemaStoreProvider from './providers/schemastore/schemastore-provider'

export const defaultProviders = [
  new SchemaStoreProvider(),
  new BabelRCPresetsProposalProvider(),
  new BabelRCPluginsProposalProvider(),

  new FileProposalProvider(tsConfigFiles),
  new FileProposalProvider(packageFiles),
  new FileProposalProvider(packageDirectories),
  new FileProposalProvider(bowerFiles),
  new FileProposalProvider(composerDirsAndPhpFiles),
  new FileProposalProvider(composerAnyFiles),

  new SemverDependencyProposalProvider(packageDepConfig),
  new SemverDependencyProposalProvider(composerDepConfig)
]

export const defaultSchemaProviders = []
