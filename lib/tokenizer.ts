import {Tokens} from './constants'
const tokenizer2 = require('tokenizer2') // No tsd

/**
 * Copy pasted most of this from json-tokenizer package
 * https://github.com/Floby/node-json-tokenizer/blob/master/JsonTokenizer.js
 * 
 * @return a token stream describing the JSON grammar.
 */
function createTokenStream() {
  const stream = tokenizer2();
  stream.addRule(/^,$/, Tokens.COMMA);
  stream.addRule(/^:$/, Tokens.END_LABEL);
  stream.addRule(/^\{$/, Tokens.BEGIN_OBJECT);
  stream.addRule(/^\}$/, Tokens.END_OBJECT);
  stream.addRule(/^\[$/, Tokens.BEGIN_ARRAY);
  stream.addRule(/^\]$/, Tokens.END_ARRAY);

  stream.addRule(/^"(\\["\\/bfnrtu"]|[^"\\"])*"$/, Tokens.STRING);
  stream.addRule(/^"([^"]|\\")*$/, 'maybe-string');
  stream.addRule(/^null$/, Tokens.NULL);
  stream.addRule(/^(true|false)$/, Tokens.BOOLEAN);

  stream.addRule(/^-?\d+(\.\d+)?([eE]-?\d+)?$/, Tokens.NUMBER);
  stream.addRule(/^-?\d+\.$/, 'maybe-decimal-number');
  stream.addRule(/^-$/, 'maybe-negative-number');
  stream.addRule(/^-?\d+(\.\d+)?([eE])?$/, 'maybe-exponential-number');
  stream.addRule(/^-?\d+(\.\d+)?([eE]-)?$/, 'maybe-exponential-number-negative');

  stream.addRule(/^\w+$/, Tokens.SYMBOL);

  stream.addRule(/^[\s]+$/, Tokens.WHITESPACE);

  return stream;
}

export interface IToken {
  type: string;
  src: string;
  line: number,
  col: number
}

/**
 * Tokenizes the given buffer
 * @param buffer A Buffer to tokenize
 * @return a Promise, which when resolved yields the JSON tokens in the buffer as an array
 */
export function tokenize(buffer: string): Promise<Array<IToken>> {
  return new Promise((resolve, reject) => {
    const tokens: Array<IToken> = [];
    const tokenStream = createTokenStream();
    tokenStream.on('data', (token: IToken) => {
      // Ignore whitespace.
      if (token.type !== Tokens.WHITESPACE) {
        tokens.push(token)
      }
    });
    tokenStream.on('error', (error: Error) => reject(tokens));
    tokenStream.on('end', () => resolve(tokens));
    tokenStream.end(buffer);
  });
}