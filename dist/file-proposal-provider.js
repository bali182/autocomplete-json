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
function filesInDir(dir) {
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
function getDirectoryName(root, prefix) {
    if (lodash_1.isEmpty(prefix)) {
        return root;
    }
    var segments = prefix.split(SLASHES);
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
var FileProposalProvider = (function () {
    function FileProposalProvider() {
    }
    FileProposalProvider.prototype.getProposals = function (request) {
        if (!this.getMatcher().matches(request)) {
            return Promise.resolve([]);
        }
        var dir = request.editor.getBuffer().file.getParent().path;
        var prefix = request.prefix;
        var searchDir = getDirectoryName(dir, prefix);
        if (searchDir === null) {
            return Promise.resolve([]);
        }
        filesInDir(searchDir).then(function (results) {
            console.log(results);
        });
        return Promise.resolve([]);
    };
    return FileProposalProvider;
})();
exports.FileProposalProvider = FileProposalProvider;
