import {ArrayTraverser, PositionInfo, IPositionInfo, ValueHolder} from './utils';
import * as _ from 'lodash';
import {IToken, TokenType} from './tokenizer'

interface IAtomPoint {
  row: number,
  column: number
}

export interface IStructureInfo {
  contents: Object | Array<any>,
  positionInfo: PositionInfo,
  tokens: Array<IToken>
}

function intersectsWithToken(position: IAtomPoint, token: IToken): boolean {
  const tRow = token.line - 1;
  const pRow = position.row;
  const tCol = token.col;
  const tLength = token.src.length;
  const pCol = position.column;

  if (token.type === TokenType.STRING) {
    return tRow === pRow && tCol <= pCol && tCol + tLength - 1 > pCol; // attention to ""
  } else {
    return tRow === pRow && tCol <= pCol && tCol + tLength > pCol;
  }
}

function isBetweenTokenType(position: IAtomPoint, firstToken: IToken, secondToken: IToken) {
  const pRow = position.row;
  const pCol = position.column;
  const fRow = firstToken.line - 1;
  const sRow = secondToken.line - 1;
  const fEnd = firstToken.col + firstToken.src.length - 1;
  const sStart = secondToken.col;
  
  // cursor position and the 2 tokens are on the same line
  if (pRow === fRow && pRow === sRow) {
    return pCol >= fEnd && pCol < sStart;
  }
  // cursor position is not on the same line as the 2 other tokens but is between them
  return (pRow > fRow && pRow < sRow) // firstToken \n+ position \n+ secondToken
    || (pRow === fRow && pRow < sRow && pCol >= fEnd) // fistToken position \n+ secondToken
    || (pRow > fRow && pRow === sRow && pCol < sStart); // firstToken \n+ position secondToken
}

function consumeValue(tokens: ArrayTraverser<IToken>, container: Array<any>, position: IAtomPoint, posInfo: PositionInfo, posInfoHolder: ValueHolder<IPositionInfo>) {
  const valueStartToken = tokens.next();

  function checkPosition() {
    if (!posInfoHolder.hasValue() && intersectsWithToken(position, valueStartToken)) {
      const info = posInfo.setValuePosition()
        .setEditedToken(valueStartToken)
        .setPreviousToken(tokens.peekPrevious())
        .setNextToken(tokens.peekNext())
        .toObject();
      posInfoHolder.set(info);
    }
  }

  switch (valueStartToken.type) {
    case TokenType.STRING:
      container.push(_.trim(valueStartToken.src, '"'));
      checkPosition();
      break;
    case TokenType.NULL:
      container.push(null);
      checkPosition();
      break;
    case TokenType.SYMBOL:
      container.push(undefined);
      checkPosition();
      break;
    case TokenType.NUMBER:
      container.push(Number(valueStartToken.src));
      checkPosition();
      break;
    case TokenType.BEGIN_OBJECT:
      let object = {};
      consumeObject(object, tokens, position, posInfo, posInfoHolder);
      container.push(object);
      break;
    case TokenType.BEGIN_ARRAY:
      let array: Array<any> = [];
      consumeArray(array, tokens, position, posInfo, posInfoHolder);
      container.push(array);
      break;
  }
  return posInfo;
}

function consumeKeyValuePair(object: Object, tokens: ArrayTraverser<IToken>, position: IAtomPoint, posInfo: PositionInfo, posInfoHolder: ValueHolder<IPositionInfo>) {
  if (tokens.hasNext() && tokens.peekNext().type === TokenType.END_OBJECT) {
    if (!posInfoHolder.hasValue() && isBetweenTokenType(position, tokens.current(), tokens.peekNext())) {
      const info = posInfo.setKeyPosition()
        .setPreviousToken(tokens.current())
        .setNextToken(tokens.peekNext())
        .toObject();
      posInfoHolder.set(info);
    }
    return;
  }

  if (!posInfoHolder.hasValue() && isBetweenTokenType(position, tokens.current(), tokens.peekNext())) {
    const info = posInfo.setKeyPosition()
      .setPreviousToken(tokens.current())
      .setNextToken(tokens.peekNext())
      .toObject();
    posInfoHolder.set(info);
  }

  const keyToken = tokens.next();
  // First token is not a key, skip it.
  if (keyToken.type !== TokenType.STRING && keyToken.type !== TokenType.SYMBOL) {
    return;
  }

  if (!posInfoHolder.hasValue() && intersectsWithToken(position, keyToken)) {
    const info = posInfo.setKeyPosition()
      .setPreviousToken(tokens.peekPrevious())
      .setEditedToken(keyToken)
      .setNextToken(tokens.peekNext())
      .toObject();
    posInfoHolder.set(info);
  }

  const key = _.trim(keyToken.src, '"');
  const separatorToken = tokens.next();
  if (separatorToken.type === TokenType.END_LABEL) {
    const pathWithKey = posInfo.add(key);
    if (!posInfoHolder.hasValue() && isBetweenTokenType(position, separatorToken, tokens.peekNext())) {
      const info = pathWithKey.setValuePosition()
        .setPreviousToken(separatorToken)
        .setNextToken(tokens.peekNext())
        .toObject();
      posInfoHolder.set(info);
    }
    // Complete key-value pair
    const valContainer: Array<any> = [];
    consumeValue(tokens, valContainer, position, pathWithKey, posInfoHolder);
    const [value] = valContainer;
    object[key] = value;
  } else {
    // separator in place, value probably under editing
    object[key] = undefined;
  }
}

function consumeObject(object: Object, tokens: ArrayTraverser<IToken>, position: IAtomPoint, posInfo: PositionInfo, posInfoHolder: ValueHolder<IPositionInfo>) {
  while (tokens.hasNext()) {
    consumeKeyValuePair(object, tokens, position, posInfo, posInfoHolder);
    if (tokens.hasNext()) {
      const token = tokens.next();
      switch (token.type) {
        case TokenType.END_OBJECT: return; // end of object
        case TokenType.COMMA: break; // ',' read - nothing else to do
        default: tokens.previous(); // something else, go back
      }
    }
  }
}

function consumeArray(array: Array<any>, tokens: ArrayTraverser<IToken>, position: IAtomPoint, posInfo: PositionInfo, posInfoHolder: ValueHolder<IPositionInfo>) {
  let index = 0;
  while (tokens.hasNext()) {
    if (tokens.hasNext()) {
      const token = tokens.next();
      if (!posInfoHolder.hasValue() && isBetweenTokenType(position, tokens.peekPrevious(), token)) {
        const info = posInfo.add(index)
          .setValuePosition()
          .setPreviousToken(tokens.peekPrevious())
          .setNextToken(token)
          .toObject();
        posInfoHolder.set(info);
      }
      switch (token.type) {
        case TokenType.END_ARRAY: return; // end of array
        default: tokens.previous(); // something else, go back
      }
    }

    const valContainer: Array<any> = [];
    consumeValue(tokens, valContainer, position, posInfo.add(index), posInfoHolder);
    const [value] = valContainer;
    array.push(value);
    index++;

    if (tokens.hasNext()) {
      const token = tokens.next();
      if (!posInfoHolder.hasValue() && isBetweenTokenType(position, token, tokens.peekNext())) {
        const info = posInfo.add(index)
          .setValuePosition()
          .setPreviousToken(token)
          .setNextToken(tokens.peekNext())
          .toObject();
        posInfoHolder.set(info);
      }
      switch (token.type) {
        case TokenType.END_ARRAY: return; // end of object
        case TokenType.COMMA: break; // ',' read - nothing else to do
        default: tokens.previous(); // something else, go back
      }
    }
  }
}

export function provideStructure(tokensArray: Array<IToken>, position: IAtomPoint): IStructureInfo {
  const tokens = new ArrayTraverser(tokensArray);

  if (!tokens.hasNext()) {
    return { contents: null, positionInfo: null, tokens: tokensArray }; // no tokens
  }

  const posInfoHolder = new ValueHolder<IPositionInfo>();
  const firstToken = tokens.next();
  if (firstToken.type === TokenType.BEGIN_OBJECT) {
    const object = {};
    consumeObject(object, tokens, position, new PositionInfo(), posInfoHolder);
    return { contents: object, positionInfo: posInfoHolder.getOrElse(null), tokens: tokensArray };
  } else if (firstToken.type === TokenType.BEGIN_ARRAY) {
    const array: Array<any> = [];
    consumeArray(array, tokens, position, new PositionInfo(), posInfoHolder);
    return { contents: array, positionInfo: posInfoHolder.getOrElse(null), tokens: tokensArray };
  }
  return { contents: null, positionInfo: null, tokens: tokensArray }; // don't bother with strings, numbers, etc. for now
}
