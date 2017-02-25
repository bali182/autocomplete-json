'use babel'

import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import isArray from 'lodash/isArray'

class IndexMatcher {
  constructor(index) {
    this.index = index
  }

  matches(segment) {
    return isNumber(segment) && this.index === segment
  }
}

class KeyMatcher {
  constructor(key) {
    this.key = key
  }

  matches(segment) {
    return isString(segment) && this.key === segment
  }
}

const AnyIndexMatcher = {
  matches(segment) {
    return isNumber(segment)
  }
}

const AnyKeyMatcher = {
  matches(segment) {
    return isString(segment)
  }
}

const AnyMatcher = {
  matches() {
    return true
  }
}

class JsonPathMatcher {
  constructor(matchers = []) {
    this.matchers = matchers
  }

  index(value) {
    let matcher = null
    if (value === undefined) {
      matcher = AnyIndexMatcher
    } else {
      matcher = isArray(value)
        ? new OrMatcher(value.map(v => new IndexMatcher(v)))
        : new IndexMatcher(value)
    }
    return new JsonPathMatcher(this.matchers.concat([matcher]))
  }

  key(value) {
    let matcher = null
    if (value === undefined) {
      matcher = AnyKeyMatcher
    } else {
      matcher = isArray(value)
        ? new OrMatcher(value.map(v => new KeyMatcher(v)))
        : new KeyMatcher(value)
    }
    return new JsonPathMatcher(this.matchers.concat([matcher]))
  }

  any() {
    return new JsonPathMatcher(this.matchers.concat([AnyMatcher]))
  }

  matches(segments) {
    if (segments.length !== this.matchers.length) {
      return false
    }

    for (let i = 0; i < this.matchers.length; ++i) {
      if (!this.matchers[i].matches(segments[i])) {
        return false
      }
    }

    return true
  }
}

class PathRequestMatcher {
  constructor(matcher) {
    this.matcher = matcher
  }

  matches({segments}) {
    return Boolean(segments) && this.matcher.matches(segments)
  }
}

const KeyRequestMatcher = {
  matches({isKeyPosition}) {
    return isKeyPosition
  }
}

const ValueRequestMatcher = {
  matches({isValuePosition}) {
    return isValuePosition
  }
}

class RequestMatcher {
  constructor(matchers = []) {
    this.matchers = matchers
  }

  path(matcher) {
    return new RequestMatcher(this.matchers.concat([new PathRequestMatcher(matcher)]))
  }

  value() {
    return new RequestMatcher(this.matchers.concat([ValueRequestMatcher]))
  }

  key() {
    return new RequestMatcher(this.matchers.concat([KeyRequestMatcher]))
  }

  matches(req) {
    return this.matchers.every(matcher => matcher.matches(req))
  }
}

class CompositeMatcher {
  constructor(matchers = []) {
    this.matchers = matchers
  }

  append(matcher) {
    return this.createCompositeMatcher(this.matchers.concat([matcher]))
  }

  prepend(matcher) {
    return this.createCompositeMatcher([matcher].concat(this.matchers))
  }
}


class AndMatcher extends CompositeMatcher {
  constructor(matchers = []) {
    super(matchers)
  }

  createCompositeMatcher(matchers) {
    return new AndMatcher(matchers)
  }

  matches(input) {
    return this.matchers.every(matcher => matcher.matches(input))
  }
}

class OrMatcher extends CompositeMatcher {
  constructor(matchers = []) {
    super(matchers)
  }

  createCompositeMatcher(matchers) {
    return new OrMatcher(matchers)
  }

  matches(input) {
    return this.matchers.some(matcher => matcher.matches(input))
  }
}

export function path() {
  return new JsonPathMatcher()
}

export function request() {
  return new RequestMatcher()
}

export function and(...matchers) {
  return new AndMatcher(matchers)
}

export function or(...matchers) {
  return new OrMatcher(matchers)
}
