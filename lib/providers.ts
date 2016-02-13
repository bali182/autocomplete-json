import {IProposalProvider, IJsonSchemaProvider} from './provider-api';
import {FileProposalProvider} from './file-proposal-provider';

// Regular provider classes
import PackageJsonDependecyProposalProvider from './providers/package/package-json-dependency-proposal-provider';
import BabelRCPresetsProposalProvider from './providers/babelrc/babelrc-presets-proposal-provider';
import BabelRCPluginsProposalProvider from './providers/babelrc/babelrc-plugins-proposal-provider';
import ComposerJsonDependecyProposalProvider from './providers/composer/composer-json-dependency-proposal-provider';

// Schema provider instances
import tsconfigJsonSchemaProposalProvider from './providers/tsconfig/tsconfig-json-schema-proposal-provider';
import packageJsonSchemaProposalProvider from './providers/package/package-json-schema-proposal-provider';
import bowerJsonSchemaProposalProvider from './providers/bower/bower-json-schema-proposal-provider';
import babelrcJsonSchemaProposalProvider from './providers/babelrc/babelrc-json-schema-proposal-provider';
import composerJsonSchemaProposalProvider from './providers/composer/composer-json-schema-proposal-provider';

// File config instances
import tsConfigFiles from './providers/tsconfig/tsconfig-json-files-proposal-provider';
import packageFiles from './providers/package/package-json-files-proposal-provider';
import packageDirectories from './providers/package/package-json-directories-proposal-provider';
import bowerFiles from './providers/bower/bower-json-files-proposal-provider';
import composerDirsAndPhpFiles from './providers/composer/composer-json-php-file-or-folder-proposal-provider';
import composerAnyFiles from './providers/composer/composer-json-any-file-proposal-provider';

export const defaultProviders: Array<IProposalProvider> = [
  new PackageJsonDependecyProposalProvider(),
  new BabelRCPresetsProposalProvider(),
  new BabelRCPluginsProposalProvider(),
  new ComposerJsonDependecyProposalProvider(),

  new FileProposalProvider(tsConfigFiles),
  new FileProposalProvider(packageFiles),
  new FileProposalProvider(packageDirectories),
  new FileProposalProvider(bowerFiles),
  new FileProposalProvider(composerDirsAndPhpFiles),
  new FileProposalProvider(composerAnyFiles)
];

export const defaultSchemaProviders: Array<IJsonSchemaProvider> = [
  tsconfigJsonSchemaProposalProvider,
  packageJsonSchemaProposalProvider,
  bowerJsonSchemaProposalProvider,
  babelrcJsonSchemaProposalProvider,
  composerJsonSchemaProposalProvider
];
