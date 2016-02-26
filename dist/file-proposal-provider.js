"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var provider_api_1 = require('./provider-api');
var lodash_1 = require('lodash');
var path_1 = require('path');
var fs = require('fs');
var SLASHES = /\\|\//;
function directoryExists(path) {
    try {
        return fs.statSync(path).isDirectory();
    } catch (e) {
        return false;
    }
}
function listPaths(dir, storageType, fileExtensions) {
    return new Promise(function (resolve, reject) {
        fs.readdir(dir, function (error, paths) {
            if (error) {
                reject(error);
            } else {
                var fileInfos = paths.map(function (path) {
                    var stats = fs.statSync(dir + path_1.sep + path);
                    return {
                        name: path,
                        isFile: stats.isFile(),
                        isDirectory: stats.isDirectory()
                    };
                }).filter(function (file) {
                    switch (storageType) {
                        case provider_api_1.StorageType.FILE:
                            return file.isFile && (!fileExtensions || lodash_1.includes(fileExtensions, path_1.extname(file.name)));
                        case provider_api_1.StorageType.FOLDER:
                            return file.isDirectory;
                        default:
                            {
                                return file.isDirectory || !fileExtensions || lodash_1.includes(fileExtensions, path_1.extname(file.name));
                            }
                    }
                });
                resolve(fileInfos);
            }
        });
    });
}
function containerName(root, segments) {
    if (lodash_1.isEmpty(segments)) {
        return root;
    }
    if (lodash_1.isEmpty(lodash_1.last(segments))) {
        var path = root + path_1.sep + lodash_1.trimLeft(segments.join(path_1.sep), '/\\');
        if (directoryExists(path)) {
            return path;
        }
    } else {
        var lastIsPartialFile = root + path_1.sep + lodash_1.trimLeft(segments.slice(0, segments.length - 1).join(path_1.sep), '/\\');
        if (directoryExists(lastIsPartialFile)) {
            return lastIsPartialFile;
        }
    }
    return null;
}
function prepareFiles(files, request, basePath, segments) {
    var filteredFiles = lodash_1.isEmpty(lodash_1.last(segments)) ? files : files.filter(function (file) {
        return lodash_1.startsWith(file.name, lodash_1.last(segments));
    });
    return lodash_1.sortBy(filteredFiles, function (f) {
        return f.isDirectory ? 0 : 1;
    });
}
function createProposal(file, request, basePath, segments) {
    var proposal = {};
    var text = function () {
        var proposalText = file.name;
        if (segments.length === 0) {
            proposalText = file.name;
        } else if (lodash_1.last(segments).length === 0) {
            proposalText = segments.join('/') + file.name;
        } else {
            var withoutPartial = segments.slice(0, segments.length - 1);
            if (withoutPartial.length === 0) {
                proposalText = file.name;
            } else {
                proposalText = segments.slice(0, segments.length - 1).join('/') + '/' + file.name;
            }
        }
        return proposalText + (file.isDirectory ? '/' : '');
    }();
    proposal.replacementPrefix = request.prefix;
    proposal.displayText = file.name;
    proposal.rightLabel = file.isDirectory ? 'folder' : 'file';
    if (request.isBetweenQuotes) {
        proposal.text = text;
    } else {
        proposal.snippet = '"' + text + '$1"';
    }
    proposal.type = proposal.rightLabel;
    return proposal;
}

var FileProposalProvider = function () {
    function FileProposalProvider(configuration) {
        _classCallCheck(this, FileProposalProvider);

        this.configuration = configuration;
    }

    _createClass(FileProposalProvider, [{
        key: 'getProposals',
        value: function getProposals(request) {
            if (!request.isBetweenQuotes || !this.configuration.getMatcher().matches(request)) {
                return Promise.resolve([]);
            }
            var dir = request.editor.getBuffer().file.getParent().path;
            var prefix = request.prefix;

            var segments = prefix.split(SLASHES);
            var searchDir = containerName(dir, segments);
            if (searchDir === null) {
                return Promise.resolve([]);
            }
            return listPaths(searchDir, this.configuration.getStorageType(), this.configuration.getFileExtensions()).then(function (results) {
                return prepareFiles(results, request, dir, segments).map(function (file) {
                    return createProposal(file, request, dir, segments);
                });
            });
        }
    }, {
        key: 'getFilePattern',
        value: function getFilePattern() {
            return this.configuration.getFilePattern();
        }
    }]);

    return FileProposalProvider;
}();

exports.FileProposalProvider = FileProposalProvider;