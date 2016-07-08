"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var lodash_1 = require('lodash');
var minimatch = require('minimatch');
var nodeFetch = require('node-fetch');
var ElectronProxyAgent = require('electron-proxy-agent');

var ArrayTraverser = function () {
    function ArrayTraverser() {
        var array = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
        var index = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];

        _classCallCheck(this, ArrayTraverser);

        this.array = array;
        this.index = index;
    }

    _createClass(ArrayTraverser, [{
        key: 'current',
        value: function current() {
            return this.array[this.index];
        }
    }, {
        key: 'next',
        value: function next() {
            if (!this.hasNext()) {
                throw new Error('no next element at ' + (this.index + 1));
            }
            this.index += 1;
            return this.array[this.index];
        }
    }, {
        key: 'peekNext',
        value: function peekNext() {
            var defaultValue = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

            return this.hasNext() ? this.array[this.index + 1] : defaultValue;
        }
    }, {
        key: 'peekPrevious',
        value: function peekPrevious() {
            var defaultValue = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

            return this.hasPrevious() ? this.array[this.index - 1] : defaultValue;
        }
    }, {
        key: 'previous',
        value: function previous() {
            if (!this.hasPrevious()) {
                throw new Error('no previous element at ' + this.index);
            }
            this.index -= 1;
            return this.array[this.index];
        }
    }, {
        key: 'hasNext',
        value: function hasNext() {
            return this.index + 1 < this.array.length;
        }
    }, {
        key: 'hasPrevious',
        value: function hasPrevious() {
            return this.index - 1 >= 0 && this.array.length !== 0;
        }
    }]);

    return ArrayTraverser;
}();

exports.ArrayTraverser = ArrayTraverser;

var PositionInfo = function () {
    function PositionInfo() {
        var segments = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
        var keyPosition = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
        var valuePosition = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
        var previousToken = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
        var editedToken = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
        var nextToken = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];

        _classCallCheck(this, PositionInfo);

        this.segments = segments;
        this.keyPosition = keyPosition;
        this.valuePosition = valuePosition;
        this.previousToken = previousToken;
        this.editedToken = editedToken;
        this.nextToken = nextToken;
    }

    _createClass(PositionInfo, [{
        key: 'setKeyPosition',
        value: function setKeyPosition() {
            return new PositionInfo(this.segments, true, false, this.previousToken, this.editedToken, this.nextToken);
        }
    }, {
        key: 'setValuePosition',
        value: function setValuePosition() {
            return new PositionInfo(this.segments, false, true, this.previousToken, this.editedToken, this.nextToken);
        }
    }, {
        key: 'setPreviousToken',
        value: function setPreviousToken(token) {
            return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, token, this.editedToken, this.nextToken);
        }
    }, {
        key: 'setEditedToken',
        value: function setEditedToken(token) {
            return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, this.previousToken, token, this.nextToken);
        }
    }, {
        key: 'setNextToken',
        value: function setNextToken(token) {
            return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, this.previousToken, this.editedToken, token);
        }
    }, {
        key: 'add',
        value: function add(segment) {
            return this.addAll([segment]);
        }
    }, {
        key: 'addAll',
        value: function addAll(segments) {
            return new PositionInfo(this.segments.concat(segments), this.keyPosition, this.valuePosition, this.previousToken, this.editedToken, this.nextToken);
        }
    }, {
        key: 'toObject',
        value: function toObject() {
            return {
                segments: this.segments,
                keyPosition: this.keyPosition,
                valuePosition: this.valuePosition,
                previousToken: this.previousToken,
                editedToken: this.editedToken,
                nextToken: this.nextToken
            };
        }
    }]);

    return PositionInfo;
}();

exports.PositionInfo = PositionInfo;

var ValueHolder = function () {
    function ValueHolder() {
        var value = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

        _classCallCheck(this, ValueHolder);

        this.value = value;
    }

    _createClass(ValueHolder, [{
        key: 'get',
        value: function get() {
            if (!this.hasValue()) {
                throw new Error('value is not set');
            }
            return this.value;
        }
    }, {
        key: 'getOrElse',
        value: function getOrElse() {
            var defaultValue = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

            return this.hasValue() ? this.get() : defaultValue;
        }
    }, {
        key: 'set',
        value: function set(value) {
            this.value = value;
        }
    }, {
        key: 'hasValue',
        value: function hasValue() {
            return this.value !== undefined;
        }
    }]);

    return ValueHolder;
}();

exports.ValueHolder = ValueHolder;
function resolveObject(segments, object) {
    if (!lodash_1.isObject(object)) {
        return null;
    }
    if (segments.length === 0) {
        return object;
    }

    var _segments = _toArray(segments);

    var key = _segments[0];

    var restOfSegments = _segments.slice(1);

    return resolveObject(restOfSegments, object[key]);
}
exports.resolveObject = resolveObject;
function doMatches(pattern, file) {
    return minimatch(pattern.indexOf("/") > -1 ? file.getRealPathSync() : file.getBaseName(), process.platform == 'win32' ? pattern.replace(/\//g, '\\') : pattern);
}
function matches(file, patterns) {
    return lodash_1.isArray(patterns) ? patterns.some(function (pattern) {
        return doMatches(pattern, file);
    }) : doMatches(patterns, file);
}
exports.matches = matches;
function fetch(url) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var proxyAgent = options.agent || new ElectronProxyAgent();
    return nodeFetch(url, Object.assign({ agent: proxyAgent }, options));
}
exports.fetch = fetch;