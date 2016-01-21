const tokenizer2 = require('tokenizer2') // No tsd

/**
 * Copy pasted most of this from json-tokenizer package
 * https://github.com/Floby/node-json-tokenizer/blob/master/JsonTokenizer.js
 * 
 * @return a token stream describing the JSON grammar.
 */
function createTokenStream() {
  const stream = tokenizer2();
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

export enum TokenType {
  COMMA = <any>'comma',
  END_LABEL = <any>'end-label',
  BEGIN_OBJECT = <any>'begin-object',
  END_OBJECT = <any>'end-object',
  BEGIN_ARRAY = <any>'begin-array',
  END_ARRAY = <any>'end-array',
  STRING = <any>'string',
  NULL = <any>'null',
  BOOLEAN = <any>'boolean',
  NUMBER = <any>'number',
  SYMBOL = <any>'symbol',
  WHITESPACE = <any>'whitespace'
}


export interface IToken {
  type: TokenType;
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
      if (token.type !== TokenType.WHITESPACE) {
        tokens.push(token)
      }
    });
    tokenStream.on('error', (error: Error) => reject(tokens));
    tokenStream.on('end', () => resolve(tokens));
    tokenStream.end(buffer);
  });
}