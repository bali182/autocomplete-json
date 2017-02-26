'use babel'

import isObject from 'lodash/isObject'
import isArray from 'lodash/isArray'
import isUndefined from 'lodash/isUndefined'

import minimatch from 'minimatch'

export class ArrayTraverser {

  constructor(array = [], index = -1) {
    this.array = array
    this.index = index
  }

  current() {
    return this.array[this.index]
  }

  next() {
    if (!this.hasNext()) {
      throw new Error(`no next element at ${this.index + 1}`)
    }
    this.index += 1
    return this.array[this.index]
  }

  peekNext(defaultValue) {
    return this.hasNext() ? this.array[this.index + 1] : defaultValue
  }

  peekPrevious(defaultValue) {
    return this.hasPrevious() ? this.array[this.index - 1] : defaultValue
  }

  previous() {
    if (!this.hasPrevious()) {
      throw new Error(`no previous element at ${this.index}`)
    }
    this.index -= 1
    return this.array[this.index]
  }

  hasNext() {
    return this.index + 1 < this.array.length
  }

  hasPrevious() {
    return this.index - 1 >= 0 && this.array.length !== 0
  }
}

export class PositionInfo {
  constructor(segments = [],
    keyPosition = false,
    valuePosition = false,
    previousToken = null,
    editedToken = null,
    nextToken = null
  ) {
    this.segments = segments
    this.keyPosition = keyPosition
    this.valuePosition = valuePosition
    this.previousToken = previousToken
    this.editedToken = editedToken
    this.nextToken = nextToken
  }

  setKeyPosition() {
    return new PositionInfo(this.segments, true, false, this.previousToken, this.editedToken, this.nextToken)
  }

  setValuePosition() {
    return new PositionInfo(this.segments, false, true, this.previousToken, this.editedToken, this.nextToken)
  }

  setPreviousToken(token) {
    return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, token, this.editedToken, this.nextToken)
  }

  setEditedToken(token) {
    return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, this.previousToken, token, this.nextToken)
  }

  setNextToken(token) {
    return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, this.previousToken, this.editedToken, token)
  }

  add(segment) {
    return this.addAll([segment])
  }

  addAll(segments) {
    return new PositionInfo(
      this.segments.concat(segments),
      this.keyPosition,
      this.valuePosition,
      this.previousToken,
      this.editedToken,
      this.nextToken
    )
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

export class ValueHolder {
  constructor(value) {
    this.value = value
  }

  get() {
    if (!this.hasValue()) {
      throw new Error('value is not set')
    }
    return this.value
  }

  getOrElse(defaultValue) {
    return this.hasValue() ? this.get() : defaultValue
  }

  set(value) {
    this.value = value
  }

  hasValue() {
    return !isUndefined(this.value)
  }
}

export function resolveObject(segments, object) {
  if (!isObject(object)) {
    return null
  }
  if (segments.length === 0) {
    return object
  }
  const [key, ...restOfSegments] = segments
  return resolveObject(restOfSegments, object[key])
}

function doMatches(pattern, file) {
  const path = pattern.indexOf('/') > -1 ? file.getRealPathSync() : file.getBaseName()
  const search = process.platform === 'win32' ? pattern.replace(/\//g, '\\') : pattern
  return minimatch(path, search)
}

export function matches(file, patterns) {
  return isArray(patterns) ? patterns.some(pattern => doMatches(pattern, file)) : doMatches(patterns, file)
}

export const StorageType = {
  FILE: 'FILE',
  FOLDER: 'FOLDER',
  BOTH: 'BOTH'
}

