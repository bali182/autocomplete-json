"use strict";

(function (StorageType) {
    StorageType[StorageType["FILE"] = 'FILE'] = "FILE";
    StorageType[StorageType["FOLDER"] = 'FOLDER'] = "FOLDER";
    StorageType[StorageType["BOTH"] = 'BOTH'] = "BOTH";
})(exports.StorageType || (exports.StorageType = {}));
var StorageType = exports.StorageType;