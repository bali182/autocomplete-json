var constants_1 = require('./constants');
var tokenizer2 = require('tokenizer2');
function createTokenStream() {
    var stream = tokenizer2();
    stream.addRule(/^,$/, constants_1.Tokens.COMMA);
    stream.addRule(/^:$/, constants_1.Tokens.END_LABEL);
    stream.addRule(/^\{$/, constants_1.Tokens.BEGIN_OBJECT);
    stream.addRule(/^\}$/, constants_1.Tokens.END_OBJECT);
    stream.addRule(/^\[$/, constants_1.Tokens.BEGIN_ARRAY);
    stream.addRule(/^\]$/, constants_1.Tokens.END_ARRAY);
    stream.addRule(/^"(\\["\\/bfnrtu"]|[^"\\"])*"$/, constants_1.Tokens.STRING);
    stream.addRule(/^"([^"]|\\")*$/, 'maybe-string');
    stream.addRule(/^null$/, constants_1.Tokens.NULL);
    stream.addRule(/^(true|false)$/, constants_1.Tokens.BOOLEAN);
    stream.addRule(/^-?\d+(\.\d+)?([eE]-?\d+)?$/, constants_1.Tokens.NUMBER);
    stream.addRule(/^-?\d+\.$/, 'maybe-decimal-number');
    stream.addRule(/^-$/, 'maybe-negative-number');
    stream.addRule(/^-?\d+(\.\d+)?([eE])?$/, 'maybe-exponential-number');
    stream.addRule(/^-?\d+(\.\d+)?([eE]-)?$/, 'maybe-exponential-number-negative');
    stream.addRule(/^\w+$/, constants_1.Tokens.SYMBOL);
    stream.addRule(/^[\s]+$/, constants_1.Tokens.WHITESPACE);
    return stream;
}
function tokenize(buffer) {
    return new Promise(function (resolve, reject) {
        var tokens = [];
        var tokenStream = createTokenStream();
        tokenStream.on('data', function (token) {
            if (token.type !== constants_1.Tokens.WHITESPACE) {
                tokens.push(token);
            }
        });
        tokenStream.on('error', function (error) { return reject(tokens); });
        tokenStream.on('end', function () { return resolve(tokens); });
        tokenStream.end(buffer);
    });
}
exports.tokenize = tokenize;
