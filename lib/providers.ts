import {IProposalProvider, IJsonSchemaProvider} from './provider-api';

import PackageJsonDependecyProposalProvider from './providers/package/package-json-dependency-proposal-provider';
import TsJsonConfigFileProposalProvider from './providers/tsconfig/tsconfig-json-files-proposal-provider';
import PackageJsonConfigFileProposalProvider from './providers/package/package-json-files-proposal-provider';
import BabelRCPresetsProposalProvider from './providers/babelrc/babelrc-presets-proposal-provider';
import BabelRCPluginsProposalProvider from './providers/babelrc/babelrc-plugins-proposal-provider';

import tsconfigJsonSchemaProposalProvider from './providers/tsconfig/tsconfig-json-schema-proposal-provider';
import packageJsonSchemaProposalProvider from './providers/package/package-json-schema-proposal-provider';
import bowerJsonSchemaProposalProvider from './providers/bower/bower-json-schema-proposal-provider';
import babelrcJsonSchemaProposalProvider from './providers/babelrc/babelrc-json-schema-proposal-provider';

export const defaultProviders: Array<IProposalProvider> = [
  new PackageJsonDependecyProposalProvider(),
  new TsJsonConfigFileProposalProvider(),
  new BabelRCPresetsProposalProvider(),
  new BabelRCPluginsProposalProvider(),
  new PackageJsonConfigFileProposalProvider()
];

export const defaultSchemaProviders: Array<IJsonSchemaProvider> = [
  tsconfigJsonSchemaProposalProvider,
  packageJsonSchemaProposalProvider,
  bowerJsonSchemaProposalProvider,
  babelrcJsonSchemaProposalProvider
];