var utils_1 = require('./utils');
var constants_1 = require('./constants');
var _ = require('lodash');
function intersectsWithToken(position, token) {
    var tRow = token.line - 1;
    var pRow = position.row;
    var tCol = token.col;
    var tLength = token.src.length;
    var pCol = position.column;
    if (token.type === constants_1.Tokens.STRING) {
        return tRow === pRow && tCol <= pCol && tCol + tLength - 1 > pCol;
    }
    else {
        return tRow === pRow && tCol <= pCol && tCol + tLength > pCol;
    }
}
function isBetweenTokens(position, firstToken, secondToken) {
    var pRow = position.row;
    var pCol = position.column;
    var fRow = firstToken.line - 1;
    var sRow = secondToken.line - 1;
    var fEnd = firstToken.col + firstToken.src.length - 1;
    var sStart = secondToken.col;
    if (pRow === fRow && pRow === sRow) {
        return pCol >= fEnd && pCol < sStart;
    }
    return (pRow > fRow && pRow < sRow)
        || (pRow === fRow && pRow < sRow && pCol >= fEnd)
        || (pRow > fRow && pRow === sRow && pCol < sStart);
}
function consumeValue(tokens, container, position, posInfo, posInfoHolder) {
    var valueStartToken = tokens.next();
    function checkPosition() {
        if (!posInfoHolder.hasValue() && intersectsWithToken(position, valueStartToken)) {
            var info = posInfo.setValuePosition()
                .setEditedToken(valueStartToken)
                .setPreviousToken(tokens.peekPrevious())
                .setNextToken(tokens.peekNext())
                .toObject();
            posInfoHolder.set(info);
        }
    }
    switch (valueStartToken.type) {
        case constants_1.Tokens.STRING:
            container.push(_.trim(valueStartToken.src, '"'));
            checkPosition();
            break;
        case constants_1.Tokens.NULL:
            container.push(null);
            checkPosition();
            break;
        case constants_1.Tokens.SYMBOL:
            container.push(undefined);
            checkPosition();
            break;
        case constants_1.Tokens.NUMBER:
            container.push(Number(valueStartToken.src));
            checkPosition();
            break;
        case constants_1.Tokens.BEGIN_OBJECT:
            var object = {};
            consumeObject(object, tokens, position, posInfo, posInfoHolder);
            container.push(object);
            break;
        case constants_1.Tokens.BEGIN_ARRAY:
            var array = [];
            consumeArray(array, tokens, position, posInfo, posInfoHolder);
            container.push(array);
            break;
    }
    return posInfo;
}
function consumeKeyValuePair(object, tokens, position, posInfo, posInfoHolder) {
    if (tokens.hasNext() && tokens.peekNext().type === constants_1.Tokens.END_OBJECT) {
        if (!posInfoHolder.hasValue() && isBetweenTokens(position, tokens.current(), tokens.peekNext())) {
            var info = posInfo.setKeyPosition()
                .setPreviousToken(tokens.current())
                .setNextToken(tokens.peekNext())
                .toObject();
            posInfoHolder.set(info);
        }
        return;
    }
    if (!posInfoHolder.hasValue() && isBetweenTokens(position, tokens.current(), tokens.peekNext())) {
        var info = posInfo.setKeyPosition()
            .setPreviousToken(tokens.current())
            .setNextToken(tokens.peekNext())
            .toObject();
        posInfoHolder.set(info);
    }
    var keyToken = tokens.next();
    if (keyToken.type !== constants_1.Tokens.STRING && keyToken.type !== constants_1.Tokens.SYMBOL) {
        return;
    }
    if (!posInfoHolder.hasValue() && intersectsWithToken(position, keyToken)) {
        var info = posInfo.setKeyPosition()
            .setPreviousToken(tokens.peekPrevious())
            .setEditedToken(keyToken)
            .setNextToken(tokens.peekNext())
            .toObject();
        posInfoHolder.set(info);
    }
    var key = _.trim(keyToken.src, '"');
    var separatorToken = tokens.next();
    if (separatorToken.type === constants_1.Tokens.END_LABEL) {
        var pathWithKey = posInfo.add(key);
        if (!posInfoHolder.hasValue() && isBetweenTokens(position, separatorToken, tokens.peekNext())) {
            var info = pathWithKey.setValuePosition()
                .setPreviousToken(separatorToken)
                .setNextToken(tokens.peekNext())
                .toObject();
            posInfoHolder.set(info);
        }
        var valContainer = [];
        consumeValue(tokens, valContainer, position, pathWithKey, posInfoHolder);
        var value = valContainer[0];
        object[key] = value;
    }
    else {
        object[key] = undefined;
    }
}
function consumeObject(object, tokens, position, posInfo, posInfoHolder) {
    while (tokens.hasNext()) {
        consumeKeyValuePair(object, tokens, position, posInfo, posInfoHolder);
        if (tokens.hasNext()) {
            var token = tokens.next();
            switch (token.type) {
                case constants_1.Tokens.END_OBJECT: return;
                case constants_1.Tokens.COMMA: break;
                default: tokens.previous();
            }
        }
    }
}
function consumeArray(array, tokens, position, posInfo, posInfoHolder) {
    var index = 0;
    while (tokens.hasNext()) {
        if (tokens.hasNext()) {
            var token = tokens.next();
            if (!posInfoHolder.hasValue() && isBetweenTokens(position, tokens.peekPrevious(), token)) {
                var info = posInfo.add(index)
                    .setValuePosition()
                    .setPreviousToken(tokens.peekPrevious())
                    .setNextToken(token)
                    .toObject();
                posInfoHolder.set(info);
            }
            switch (token.type) {
                case constants_1.Tokens.END_ARRAY: return;
                default: tokens.previous();
            }
        }
        var valContainer = [];
        consumeValue(tokens, valContainer, position, posInfo.add(index), posInfoHolder);
        var value = valContainer[0];
        array.push(value);
        index++;
        if (tokens.hasNext()) {
            var token = tokens.next();
            if (!posInfoHolder.hasValue() && isBetweenTokens(position, token, tokens.peekNext())) {
                var info = posInfo.add(index)
                    .setValuePosition()
                    .setPreviousToken(token)
                    .setNextToken(tokens.peekNext())
                    .toObject();
                posInfoHolder.set(info);
            }
            switch (token.type) {
                case constants_1.Tokens.END_ARRAY: return;
                case constants_1.Tokens.COMMA: break;
                default: tokens.previous();
            }
        }
    }
}
function provideStructure(tokensArray, position) {
    var tokens = new utils_1.ArrayTraverser(tokensArray);
    if (!tokens.hasNext()) {
        return { contents: null, positionInfo: null, tokens: tokensArray };
    }
    var posInfoHolder = new utils_1.ValueHolder();
    var firstToken = tokens.next();
    if (firstToken.type === constants_1.Tokens.BEGIN_OBJECT) {
        var object = {};
        consumeObject(object, tokens, position, new utils_1.PositionInfo(), posInfoHolder);
        return { contents: object, positionInfo: posInfoHolder.getOrElse(null), tokens: tokensArray };
    }
    else if (firstToken.type === constants_1.Tokens.BEGIN_ARRAY) {
        var array = [];
        consumeArray(array, tokens, position, new utils_1.PositionInfo(), posInfoHolder);
        return { contents: array, positionInfo: posInfoHolder.getOrElse(null), tokens: tokensArray };
    }
    return { contents: null, positionInfo: null, tokens: tokensArray };
}
exports.provideStructure = provideStructure;
