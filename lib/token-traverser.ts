import {last, flatten, memoize} from 'lodash';

interface IAtomToken {
  value: string;
  hasPairedCharacter: boolean;
  scopes: Array<string>;
  isAtomic: boolean;
  isHardTab: boolean;
  firstNonWhitespaceIndex?: string;
  firstTrailingWhitespaceIndex?: string;
  hasInvisibleCharacters: boolean;
}

interface IAtomTokenizedLine {
  tokens: Array<IAtomToken>;
}

interface IPosition {
  line: number;
  column: number
}

class Position implements IPosition {
  constructor(public line: number, public column: number) { }
}

interface IToken {
  value?: string;
  type?: TokenType;
  position?: IPosition;
}

class Token implements IToken {
  constructor(public value?: string, public type?: TokenType, public position?: IPosition) { }
}

enum TokenType {
  BEGIN_OBJECT,
  END_OBJECT,
  BEGIN_ARRAY,
  END_ARRAY,
  COMMA,
  NUMBER,
  COLON,
  STRING_BEGIN_QUOTE,
  STRING_END_QUOTE,
  STRING,
  WHITESPACE,
  INVALID,
}

const TOKEN_MAP = {
  'punctuation.definition.dictionary.begin.json': TokenType.BEGIN_OBJECT,
  'punctuation.definition.dictionary.end.json': TokenType.END_OBJECT,
  'punctuation.definition.array.begin.json': TokenType.BEGIN_ARRAY,
  'punctuation.definition.array.end.json': TokenType.END_ARRAY,
  'punctuation.separator.dictionary.pair.json': TokenType.COMMA,
  'constant.numeric.json': TokenType.NUMBER,
  'punctuation.separator.dictionary.key-value.json': TokenType.COLON,
  'punctuation.definition.string.begin.json': TokenType.STRING_BEGIN_QUOTE,
  'punctuation.definition.string.end.json': TokenType.STRING_END_QUOTE,
  'string.quoted.double.json': TokenType.STRING,
  'meta.structure.array.json': TokenType.WHITESPACE,
  'meta.structure.dictionary.json': TokenType.WHITESPACE,
  'meta.structure.dictionary.value.json': TokenType.WHITESPACE,
  'invalid.illegal.expected-array-separator.json': TokenType.INVALID,
  'invalid.illegal.expected-dictionary-separator.json': TokenType.INVALID,
  'invalid.illegal.unrecognized-string-escape.json': TokenType.INVALID
}

export function type(token: IAtomToken): TokenType {
  console.log(last(token.scopes))
  return TOKEN_MAP[last(token.scopes)];
}

interface ITraverser<T> {
  next(): T;
  hasNext(): boolean;
  previous(): T;
  hasPrevious(): boolean;
  current(): T;
  peekNext(defaultValue?: T): T;
  peekPrevious(defaultValue?: T): T;
}

abstract class CachingTraverser<T> implements ITraverser<T> {
  protected cache: Array<T> = [];
  private index: number = -1;

  next(): T {
    if (!this.hasNext()) {
      throw new Error(`no next element at ${this.index + 1}`);
    }
    if (this.cache.length >= ++this.index) {
      this.cache.push(this.computeNext());
    }
    return this.cache[this.index];
  }

  previous() {
    if (!this.hasPrevious()) {
      throw new Error(`no previous element at ${this.index}`);
    }
    return this.cache[--this.index];
  }

  hasPrevious() {
    return this.index - 1 >= 0 && this.cache.length !== 0;
  }

  hasNext() {
    if (this.index + 1 < this.cache.length) {
      return true;
    }
    const next = this.computeNext();
    if (next !== null) {
      this.cache.push(next);
      return true;
    }
    return false;
  }

  current(): T {
    return (this.index < 0 || this.index >= this.cache.length) ? null : this.cache[this.index];
  }

  peekNext(defaultValue: T = undefined) {
    if (!this.hasNext()) {
      return defaultValue;
    }
    if (this.index + 1 >= this.cache.length) {
      this.cache.push(this.computeNext());
    }
    return this.cache[this.index + 1]
  }

  peekPrevious(defaultValue: T = undefined) {
    return this.hasPrevious() ? this.cache[this.index - 1] : defaultValue;
  }

  abstract computeNext(): T;
}


export class TokenTraverser extends CachingTraverser<IToken> {
  private line = 0;
  private column = 0;
  private lineIndex = 0;
  private tokenIndex = 0;

  constructor(private lines: Array<IAtomTokenizedLine>) {
    super();
    this.tokensAtLine = <any>memoize(this.tokensAtLine.bind(this));
  }
  
  // cache to prevent token recalculation.
  tokensAtLine(lineNumber: number): Array<IAtomToken> {
    const line = this.lines[lineNumber];
    if (!line) {
      return null;
    }
    return line.tokens || [];
  }

  computeNext(): IToken {
    if (this.lineIndex >= this.lines.length) {
      return null;
    }
    const currentLineTokens = this.tokensAtLine(this.lineIndex);
    const nextLineTokens = this.tokensAtLine(this.lineIndex + 1);
    if (this.tokenIndex + 1 <= currentLineTokens.length) {

    }
    return null;
  }
}

