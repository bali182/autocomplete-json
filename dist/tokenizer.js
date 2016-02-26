"use strict";

var tokenizer2 = require('tokenizer2');
function createTokenStream() {
    var stream = tokenizer2();
    stream.addRule(/^,$/, TokenType.COMMA);
    stream.addRule(/^:$/, TokenType.END_LABEL);
    stream.addRule(/^\{$/, TokenType.BEGIN_OBJECT);
    stream.addRule(/^\}$/, TokenType.END_OBJECT);
    stream.addRule(/^\[$/, TokenType.BEGIN_ARRAY);
    stream.addRule(/^\]$/, TokenType.END_ARRAY);
    stream.addRule(/^"(\\["\\/bfnrtu"]|[^"\\"])*"$/, TokenType.STRING);
    stream.addRule(/^"([^"]|\\")*$/, 'maybe-string');
    stream.addRule(/^null$/, TokenType.NULL);
    stream.addRule(/^(true|false)$/, TokenType.BOOLEAN);
    stream.addRule(/^-?\d+(\.\d+)?([eE]-?\d+)?$/, TokenType.NUMBER);
    stream.addRule(/^-?\d+\.$/, 'maybe-decimal-number');
    stream.addRule(/^-$/, 'maybe-negative-number');
    stream.addRule(/^-?\d+(\.\d+)?([eE])?$/, 'maybe-exponential-number');
    stream.addRule(/^-?\d+(\.\d+)?([eE]-)?$/, 'maybe-exponential-number-negative');
    stream.addRule(/^\w+$/, TokenType.SYMBOL);
    stream.addRule(/^[\s]+$/, TokenType.WHITESPACE);
    return stream;
}
(function (TokenType) {
    TokenType[TokenType["COMMA"] = 'comma'] = "COMMA";
    TokenType[TokenType["END_LABEL"] = 'end-label'] = "END_LABEL";
    TokenType[TokenType["BEGIN_OBJECT"] = 'begin-object'] = "BEGIN_OBJECT";
    TokenType[TokenType["END_OBJECT"] = 'end-object'] = "END_OBJECT";
    TokenType[TokenType["BEGIN_ARRAY"] = 'begin-array'] = "BEGIN_ARRAY";
    TokenType[TokenType["END_ARRAY"] = 'end-array'] = "END_ARRAY";
    TokenType[TokenType["STRING"] = 'string'] = "STRING";
    TokenType[TokenType["NULL"] = 'null'] = "NULL";
    TokenType[TokenType["BOOLEAN"] = 'boolean'] = "BOOLEAN";
    TokenType[TokenType["NUMBER"] = 'number'] = "NUMBER";
    TokenType[TokenType["SYMBOL"] = 'symbol'] = "SYMBOL";
    TokenType[TokenType["WHITESPACE"] = 'whitespace'] = "WHITESPACE";
})(exports.TokenType || (exports.TokenType = {}));
var TokenType = exports.TokenType;
function tokenize(buffer) {
    return new Promise(function (resolve, reject) {
        var tokens = [];
        var tokenStream = createTokenStream();
        tokenStream.on('data', function (token) {
            if (token.type !== TokenType.WHITESPACE) {
                tokens.push(token);
            }
        });
        tokenStream.on('error', function (error) {
            return reject(tokens);
        });
        tokenStream.on('end', function () {
            return resolve(tokens);
        });
        tokenStream.end(buffer);
    });
}
exports.tokenize = tokenize;