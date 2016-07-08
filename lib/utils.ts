import {IToken} from './tokenizer';
import {isObject, isArray} from 'lodash';
import * as minimatch from 'minimatch';
const nodeFetch = require('node-fetch');
const ElectronProxyAgent = require('electron-proxy-agent');

export class ArrayTraverser<T> {

  constructor(private array: Array<T> = [], private index = -1) { }

  current() {
    return this.array[this.index];
  }

  next() {
    if (!this.hasNext()) {
      throw new Error(`no next element at ${this.index + 1}`);
    }
    this.index += 1;
    return this.array[this.index];
  }

  peekNext(defaultValue: T = undefined) {
    return this.hasNext() ? this.array[this.index + 1] : defaultValue;
  }

  peekPrevious(defaultValue: T = undefined) {
    return this.hasPrevious() ? this.array[this.index - 1] : defaultValue;
  }

  previous() {
    if (!this.hasPrevious()) {
      throw new Error(`no previous element at ${this.index}`);
    }
    this.index -= 1;
    return this.array[this.index];
  }

  hasNext() {
    return this.index + 1 < this.array.length;
  }

  hasPrevious() {
    return this.index - 1 >= 0 && this.array.length !== 0;
  }
}

export interface IPositionInfo {
  segments: Array<string | number>
  keyPosition: boolean
  valuePosition: boolean
  previousToken: IToken
  editedToken: IToken
  nextToken: IToken
}

export class PositionInfo implements IPositionInfo {
  constructor(public segments: Array<string | number> = [],
    public keyPosition: boolean = false,
    public valuePosition: boolean = false,
    public previousToken: IToken = null,
    public editedToken: IToken = null,
    public nextToken: IToken = null) { }

  setKeyPosition() {
    return new PositionInfo(this.segments, true, false, this.previousToken, this.editedToken, this.nextToken);
  }

  setValuePosition() {
    return new PositionInfo(this.segments, false, true, this.previousToken, this.editedToken, this.nextToken);
  }

  setPreviousToken(token: IToken) {
    return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, token, this.editedToken, this.nextToken);
  }

  setEditedToken(token: IToken) {
    return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, this.previousToken, token, this.nextToken);
  }

  setNextToken(token: IToken) {
    return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, this.previousToken, this.editedToken, token);
  }

  add(segment: string | number) {
    return this.addAll([segment]);
  }

  addAll(segments: Array<string | number>) {
    return new PositionInfo(
      this.segments.concat(segments),
      this.keyPosition,
      this.valuePosition,
      this.previousToken,
      this.editedToken,
      this.nextToken
    );
  }

  toObject() {
    return {
      segments: this.segments,
      keyPosition: this.keyPosition,
      valuePosition: this.valuePosition,
      previousToken: this.previousToken,
      editedToken: this.editedToken,
      nextToken: this.nextToken
    }
  }
}

export class ValueHolder<T> {
  constructor(private value: T = undefined) { }

  get() {
    if (!this.hasValue()) {
      throw new Error('value is not set');
    }
    return this.value;
  }

  getOrElse(defaultValue: any = undefined) {
    return this.hasValue() ? this.get() : defaultValue;
  }

  set(value: T) {
    this.value = value;
  }

  hasValue() {
    return this.value !== undefined;
  }
}

export function resolveObject(segments: Array<string | number>, object: Object): any {
  if (!isObject(object)) {
    return null;
  }
  if (segments.length === 0) {
    return object;
  }
  const [key, ...restOfSegments] = segments;
  return resolveObject(restOfSegments, object[key]);
}

function doMatches(pattern: string, file: any) {
  return minimatch((pattern.indexOf("/") > -1)?file.getRealPathSync():file.getBaseName(), (process.platform == 'win32')?pattern.replace(/\//g, '\\'):pattern);
}

export function matches(file: any, patterns: string| string[]): boolean {
  return isArray(patterns)?patterns.some(pattern => doMatches(pattern, file)):doMatches(patterns as string, file);
}

// export function fetch(url: string, {agent = new ElectronProxyAgent(), ...options}) {
//   return nodeFetch(url, {...options, agent});
// }

export function fetch(url: string, options = {} as any) {
  const proxyAgent = options.agent || new ElectronProxyAgent();
  return nodeFetch(url, Object.assign({agent: proxyAgent}, options));
}
