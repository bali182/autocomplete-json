var lodash_1 = require('lodash');
var path_1 = require('path');
var fs = require('fs');
var SLASHES = /\\|\//;
function directoryExists(path) {
    try {
        return fs.statSync(path).isDirectory();
    }
    catch (e) {
        return false;
    }
}
function listPaths(dir) {
    return new Promise(function (resolve, reject) {
        fs.readdir(dir, function (error, paths) {
            if (error) {
                reject(error);
            }
            else {
                var fileInfos = paths.map(function (path) {
                    var stats = fs.statSync(dir + path_1.sep + path);
                    return {
                        name: path,
                        isFile: stats.isFile(),
                        isDirectory: stats.isDirectory()
                    };
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
    }
    else {
        var lastIsPartialFile = root + path_1.sep + lodash_1.trimLeft(segments.slice(0, segments.length - 1).join(path_1.sep), '/\\');
        if (directoryExists(lastIsPartialFile)) {
            return lastIsPartialFile;
        }
    }
    return null;
}
function prepareFiles(files, request, basePath, segments) {
    var filteredFiles = lodash_1.isEmpty(lodash_1.last(segments))
        ? files
        : files.filter(function (file) { return lodash_1.startsWith(file.name, lodash_1.last(segments)); });
    return lodash_1.sortBy(filteredFiles, function (f) { return f.isDirectory ? 0 : 1; });
}
function createProposal(file, request, basePath, segments) {
    var proposal = {};
    var text = (function () {
        var proposalText = file.name;
        if (segments.length === 0) {
            proposalText = file.name;
        }
        else if (lodash_1.last(segments).length === 0) {
            proposalText = segments.join('/') + file.name;
        }
        else {
            var withoutPartial = segments.slice(0, segments.length - 1);
            if (withoutPartial.length === 0) {
                proposalText = file.name;
            }
            else {
                proposalText = segments.slice(0, segments.length - 1).join('/') + '/' + file.name;
            }
        }
        return proposalText + (file.isDirectory ? '/' : '');
    })();
    proposal.replacementPrefix = request.prefix;
    proposal.displayText = file.name;
    proposal.rightLabel = file.isDirectory ? 'folder' : 'file';
    if (request.isBetweenQuotes) {
        proposal.text = text;
    }
    else {
        proposal.snippet = '"' + text + '$1"';
    }
    return proposal;
}
var FileProposalProvider = (function () {
    function FileProposalProvider() {
    }
    FileProposalProvider.prototype.getProposals = function (request) {
        if (!this.getMatcher().matches(request)) {
            return Promise.resolve([]);
        }
        var dir = request.editor.getBuffer().file.getParent().path;
        var prefix = request.prefix;
        var segments = prefix.split(SLASHES);
        var searchDir = containerName(dir, segments);
        if (searchDir === null) {
            return Promise.resolve([]);
        }
        return listPaths(searchDir).then(function (results) {
            return prepareFiles(results, request, dir, segments)
                .map(function (file) { return createProposal(file, request, dir, segments); });
        });
    };
    return FileProposalProvider;
})();
exports.FileProposalProvider = FileProposalProvider;
