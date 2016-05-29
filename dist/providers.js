"use strict";

var file_proposal_provider_1 = require('./file-proposal-provider');
var semver_dependency_proposal_provider_1 = require('./semver-dependency-proposal-provider');
var babelrc_presets_proposal_provider_1 = require('./providers/babelrc/babelrc-presets-proposal-provider');
var babelrc_plugins_proposal_provider_1 = require('./providers/babelrc/babelrc-plugins-proposal-provider');
var tsconfig_json_files_proposal_provider_1 = require('./providers/tsconfig/tsconfig-json-files-proposal-provider');
var package_json_files_proposal_provider_1 = require('./providers/package/package-json-files-proposal-provider');
var package_json_directories_proposal_provider_1 = require('./providers/package/package-json-directories-proposal-provider');
var bower_json_files_proposal_provider_1 = require('./providers/bower/bower-json-files-proposal-provider');
var composer_json_php_file_or_folder_proposal_provider_1 = require('./providers/composer/composer-json-php-file-or-folder-proposal-provider');
var composer_json_any_file_proposal_provider_1 = require('./providers/composer/composer-json-any-file-proposal-provider');
var composer_json_dependency_config_1 = require('./providers/composer/composer-json-dependency-config');
var package_json_dependency_config_1 = require('./providers/package/package-json-dependency-config');
var schemastore_provider_1 = require('./providers/schemastore/schemastore-provider');
exports.defaultProviders = [new schemastore_provider_1.default(), new babelrc_presets_proposal_provider_1.default(), new babelrc_plugins_proposal_provider_1.default(), new file_proposal_provider_1.FileProposalProvider(tsconfig_json_files_proposal_provider_1.default), new file_proposal_provider_1.FileProposalProvider(package_json_files_proposal_provider_1.default), new file_proposal_provider_1.FileProposalProvider(package_json_directories_proposal_provider_1.default), new file_proposal_provider_1.FileProposalProvider(bower_json_files_proposal_provider_1.default), new file_proposal_provider_1.FileProposalProvider(composer_json_php_file_or_folder_proposal_provider_1.default), new file_proposal_provider_1.FileProposalProvider(composer_json_any_file_proposal_provider_1.default), new semver_dependency_proposal_provider_1.SemverDependencyProposalProvider(package_json_dependency_config_1.default), new semver_dependency_proposal_provider_1.SemverDependencyProposalProvider(composer_json_dependency_config_1.default)];
exports.defaultSchemaProviders = [];