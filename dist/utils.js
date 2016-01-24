var lodash_1 = require('lodash');
var ArrayTraverser = (function () {
    function ArrayTraverser(array, index) {
        if (array === void 0) { array = []; }
        if (index === void 0) { index = -1; }
        this.array = array;
        this.index = index;
    }
    ArrayTraverser.prototype.current = function () {
        return this.array[this.index];
    };
    ArrayTraverser.prototype.next = function () {
        if (!this.hasNext()) {
            throw new Error("no next element at " + (this.index + 1));
        }
        this.index += 1;
        return this.array[this.index];
    };
    ArrayTraverser.prototype.peekNext = function (defaultValue) {
        if (defaultValue === void 0) { defaultValue = undefined; }
        return this.hasNext() ? this.array[this.index + 1] : defaultValue;
    };
    ArrayTraverser.prototype.peekPrevious = function (defaultValue) {
        if (defaultValue === void 0) { defaultValue = undefined; }
        return this.hasPrevious() ? this.array[this.index - 1] : defaultValue;
    };
    ArrayTraverser.prototype.previous = function () {
        if (!this.hasPrevious()) {
            throw new Error("no previous element at " + this.index);
        }
        this.index -= 1;
        return this.array[this.index];
    };
    ArrayTraverser.prototype.hasNext = function () {
        return this.index + 1 < this.array.length;
    };
    ArrayTraverser.prototype.hasPrevious = function () {
        return this.index - 1 >= 0 && this.array.length !== 0;
    };
    return ArrayTraverser;
})();
exports.ArrayTraverser = ArrayTraverser;
var PositionInfo = (function () {
    function PositionInfo(segments, keyPosition, valuePosition, previousToken, editedToken, nextToken) {
        if (segments === void 0) { segments = []; }
        if (keyPosition === void 0) { keyPosition = false; }
        if (valuePosition === void 0) { valuePosition = false; }
        if (previousToken === void 0) { previousToken = null; }
        if (editedToken === void 0) { editedToken = null; }
        if (nextToken === void 0) { nextToken = null; }
        this.segments = segments;
        this.keyPosition = keyPosition;
        this.valuePosition = valuePosition;
        this.previousToken = previousToken;
        this.editedToken = editedToken;
        this.nextToken = nextToken;
    }
    PositionInfo.prototype.setKeyPosition = function () {
        return new PositionInfo(this.segments, true, false, this.previousToken, this.editedToken, this.nextToken);
    };
    PositionInfo.prototype.setValuePosition = function () {
        return new PositionInfo(this.segments, false, true, this.previousToken, this.editedToken, this.nextToken);
    };
    PositionInfo.prototype.setPreviousToken = function (token) {
        return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, token, this.editedToken, this.nextToken);
    };
    PositionInfo.prototype.setEditedToken = function (token) {
        return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, this.previousToken, token, this.nextToken);
    };
    PositionInfo.prototype.setNextToken = function (token) {
        return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, this.previousToken, this.editedToken, token);
    };
    PositionInfo.prototype.add = function (segment) {
        return this.addAll([segment]);
    };
    PositionInfo.prototype.addAll = function (segments) {
        return new PositionInfo(this.segments.concat(segments), this.keyPosition, this.valuePosition, this.previousToken, this.editedToken, this.nextToken);
    };
    PositionInfo.prototype.toObject = function () {
        return {
            segments: this.segments,
            keyPosition: this.keyPosition,
            valuePosition: this.valuePosition,
            previousToken: this.previousToken,
            editedToken: this.editedToken,
            nextToken: this.nextToken
        };
    };
    return PositionInfo;
})();
exports.PositionInfo = PositionInfo;
var ValueHolder = (function () {
    function ValueHolder(value) {
        if (value === void 0) { value = undefined; }
        this.value = value;
    }
    ValueHolder.prototype.get = function () {
        if (!this.hasValue()) {
            throw new Error('value is not set');
        }
        return this.value;
    };
    ValueHolder.prototype.getOrElse = function (defaultValue) {
        if (defaultValue === void 0) { defaultValue = undefined; }
        return this.hasValue() ? this.get() : defaultValue;
    };
    ValueHolder.prototype.set = function (value) {
        this.value = value;
    };
    ValueHolder.prototype.hasValue = function () {
        return this.value !== undefined;
    };
    return ValueHolder;
})();
exports.ValueHolder = ValueHolder;
function resolveObject(segments, object) {
    if (!lodash_1.isObject(object)) {
        return null;
    }
    if (segments.length === 0) {
        return object;
    }
    var key = segments[0], restOfSegments = segments.slice(1);
    return resolveObject(restOfSegments, object[key]);
}
exports.resolveObject = resolveObject;
