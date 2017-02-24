'use babel'

import { isNumber, isString, isArray } from 'lodash'

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
  matches(segment) {
    return true
  }
}

class JsonPathMatcher {
  constructor(matchers = []) {
    this.matchers = matchers
  }

  index(value) {
    let matcher
    if (value === undefined) {
      matcher = AnyIndexMatcher
    } else {
      matcher = isArray(value)
        ? new OrMatcher(value.map(v => new IndexMatcher(v)))
        : new IndexMatcher(value)
    }
    return new JsonPathMatcher(this.matchers.concat([matcher]))
  }

  key(value = undefined) {
    let matcher
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

  matches(request) {
    return Boolean(request.segments) && this.matcher.matches(request.segments)
  }
}

const KeyRequestMatcher = {
  matches(request) {
    return request.isKeyPosition
  }
}

const ValueRequestMatcher = {
  matches(request) {
    return request.isValuePosition
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

  matches(request) {
    return this.matchers.every(matcher => matcher.matches(request))
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

class OrMatcher extends CompositeMatcher<T> {
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
