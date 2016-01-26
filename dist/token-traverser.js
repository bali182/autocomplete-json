var lodash_1 = require('lodash');
var ReplacementAtomToken = (function () {
    function ReplacementAtomToken(value, hasPairedCharacter, scopes, isAtomic, isHardTab, firstNonWhitespaceIndex, firstTrailingWhitespaceIndex, hasInvisibleCharacters) {
        this.value = value;
        this.hasPairedCharacter = hasPairedCharacter;
        this.scopes = scopes;
        this.isAtomic = isAtomic;
        this.isHardTab = isHardTab;
        this.firstNonWhitespaceIndex = firstNonWhitespaceIndex;
        this.firstTrailingWhitespaceIndex = firstTrailingWhitespaceIndex;
        this.hasInvisibleCharacters = hasInvisibleCharacters;
    }
    return ReplacementAtomToken;
})();
(function (AtomTokenType) {
    AtomTokenType[AtomTokenType["BEGIN_OBJECT"] = 0] = "BEGIN_OBJECT";
    AtomTokenType[AtomTokenType["END_OBJECT"] = 1] = "END_OBJECT";
    AtomTokenType[AtomTokenType["BEGIN_ARRAY"] = 2] = "BEGIN_ARRAY";
    AtomTokenType[AtomTokenType["END_ARRAY"] = 3] = "END_ARRAY";
    AtomTokenType[AtomTokenType["COMMA"] = 4] = "COMMA";
    AtomTokenType[AtomTokenType["NUMBER"] = 5] = "NUMBER";
    AtomTokenType[AtomTokenType["COLON"] = 6] = "COLON";
    AtomTokenType[AtomTokenType["STRING_BEGIN_QUOTE"] = 7] = "STRING_BEGIN_QUOTE";
    AtomTokenType[AtomTokenType["STRING_END_QUOTE"] = 8] = "STRING_END_QUOTE";
    AtomTokenType[AtomTokenType["STRING"] = 9] = "STRING";
    AtomTokenType[AtomTokenType["WHITESPACE"] = 10] = "WHITESPACE";
    AtomTokenType[AtomTokenType["INVALID"] = 11] = "INVALID";
})(exports.AtomTokenType || (exports.AtomTokenType = {}));
var AtomTokenType = exports.AtomTokenType;
var TOKEN_MAP = {
    'punctuation.definition.dictionary.begin.json': AtomTokenType.BEGIN_OBJECT,
    'punctuation.definition.dictionary.end.json': AtomTokenType.END_OBJECT,
    'punctuation.definition.array.begin.json': AtomTokenType.BEGIN_ARRAY,
    'punctuation.definition.array.end.json': AtomTokenType.END_ARRAY,
    'punctuation.separator.dictionary.pair.json': AtomTokenType.COMMA,
    'constant.numeric.json': AtomTokenType.NUMBER,
    'punctuation.separator.dictionary.key-value.json': AtomTokenType.COLON,
    'punctuation.definition.string.begin.json': AtomTokenType.STRING_BEGIN_QUOTE,
    'punctuation.definition.string.end.json': AtomTokenType.STRING_END_QUOTE,
    'string.quoted.double.json': AtomTokenType.STRING,
    'meta.structure.array.json': AtomTokenType.WHITESPACE,
    'meta.structure.dictionary.json': AtomTokenType.WHITESPACE,
    'meta.structure.dictionary.value.json': AtomTokenType.WHITESPACE,
    'invalid.illegal.expected-array-separator.json': AtomTokenType.INVALID,
    'invalid.illegal.expected-dictionary-separator.json': AtomTokenType.INVALID,
    'invalid.illegal.unrecognized-string-escape.json': AtomTokenType.INVALID
};
function type(token) {
    console.log(lodash_1.last(token.scopes));
    return TOKEN_MAP[lodash_1.last(token.scopes)];
}
exports.type = type;
var TokenTraverser = (function () {
    function TokenTraverser(lines) {
        this.lines = lines;
        var tokens = lodash_1.flatten(lines.map(function (l) { return l.tokens; }));
        var types = tokens.map(function (token) { return token.value + ": " + lodash_1.last(token.scopes); });
        var ws = tokens.map(function (token) { return type(token); });
    }
    return TokenTraverser;
})();
exports.TokenTraverser = TokenTraverser;
