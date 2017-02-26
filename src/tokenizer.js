'use babel'

import tokenizer2 from 'tokenizer2'

/**
 * Copy pasted most of this from json-tokenizer package
 * https://github.com/Floby/node-json-tokenizer/blob/master/JsonTokenizer.js
 * 
 * @return {Stream} a token stream describing the JSON grammar.
 */
function createTokenStream() {
  const stream = tokenizer2()
  stream.addRule(/^,$/, TokenType.COMMA)
  stream.addRule(/^:$/, TokenType.END_LABEL)
  stream.addRule(/^\{$/, TokenType.BEGIN_OBJECT)
  stream.addRule(/^\}$/, TokenType.END_OBJECT)
  stream.addRule(/^\[$/, TokenType.BEGIN_ARRAY)
  stream.addRule(/^\]$/, TokenType.END_ARRAY)

  stream.addRule(/^"(\\["\\/bfnrtu"]|[^"\\"])*"$/, TokenType.STRING)
  stream.addRule(/^"([^"]|\\")*$/, 'maybe-string')
  stream.addRule(/^null$/, TokenType.NULL)
  stream.addRule(/^(true|false)$/, TokenType.BOOLEAN)

  stream.addRule(/^-?\d+(\.\d+)?([eE]-?\d+)?$/, TokenType.NUMBER)
  stream.addRule(/^-?\d+\.$/, 'maybe-decimal-number')
  stream.addRule(/^-$/, 'maybe-negative-number')
  stream.addRule(/^-?\d+(\.\d+)?([eE])?$/, 'maybe-exponential-number')
  stream.addRule(/^-?\d+(\.\d+)?([eE]-)?$/, 'maybe-exponential-number-negative')

  stream.addRule(/^\w+$/, TokenType.SYMBOL)

  stream.addRule(/^[\s]+$/, TokenType.WHITESPACE)

  return stream
}

export const TokenType = {
  COMMA: 'comma',
  END_LABEL: 'end-label',
  BEGIN_OBJECT: 'begin-object',
  END_OBJECT: 'end-object',
  BEGIN_ARRAY: 'begin-array',
  END_ARRAY: 'end-array',
  STRING: 'string',
  NULL: 'null',
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  SYMBOL: 'symbol',
  WHITESPACE: 'whitespace'
}

/**
 * Tokenizes the given buffer
 * @param {Buffer} buffer A Buffer to tokenize
 * @return {Promise} a Promise, which when resolved yields the JSON tokens in the buffer as an array
 */
export function tokenize(buffer) {
  return new Promise((resolve, reject) => {
    const tokens = []
    const tokenStream = createTokenStream()
    tokenStream.on('data', token => {
      // Ignore whitespace.
      if (token.type !== TokenType.WHITESPACE) {
        tokens.push(token)
      }
    })
    tokenStream.on('error', error => reject(error))
    tokenStream.on('end', () => resolve(tokens))
    tokenStream.end(buffer)
  })
}
