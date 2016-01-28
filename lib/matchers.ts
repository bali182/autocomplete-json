import {isNumber, isString, isArray} from 'lodash';
import {IRequest} from './provider-api';

export interface IMatcher<T> {
  matches(input: T): boolean;
}

export interface IJsonPathMatcher extends IMatcher<Array<string | number>> {
  any(): IJsonPathMatcher;
  index(value?: number | Array<number>): IJsonPathMatcher;
  key(value?: string | Array<string>): IJsonPathMatcher;
}

export interface IRequestMatcher extends IMatcher<IRequest> {
  path(matcher: IMatcher<Array<string | number>>): IRequestMatcher;
  value(): IRequestMatcher;
  key(): IRequestMatcher;
}

export interface ICompositeMatcher<T> extends IMatcher<T> {
  append(matcher: IMatcher<T>): ICompositeMatcher<T>;
  prepend(matcher: IMatcher<T>): ICompositeMatcher<T>;
}

class IndexMatcher implements IMatcher<string | number> {
  constructor(private index: number) { }

  matches(segment: string | number): boolean {
    return isNumber(segment) && this.index === segment;
  }
}

class KeyMatcher implements IMatcher<string | number> {
  constructor(private key: string) { }

  matches(segment: string | number): boolean {
    return isString(segment) && this.key === segment;
  }
}

const AnyIndexMatcher: IMatcher<string | number> = {
  matches(segment: string | number): boolean {
    return isNumber(segment);
  }
}

const AnyKeyMatcher: IMatcher<string | number> = {
  matches(segment: string | number): boolean {
    return isString(segment);
  }
}
const AnyMatcher: IMatcher<string | number> = {
  matches(segment: string | number): boolean {
    return true;
  }
}

class JsonPathMatcher implements IJsonPathMatcher {
  constructor(private matchers: Array<IMatcher<string | number>> = []) { }

  index(value: number | Array<number> = undefined): IJsonPathMatcher {
    const matcher: IMatcher<string | number> = isArray(value)
      ? new OrMatcher(value.map(v => new IndexMatcher(v)))
      : new IndexMatcher(value);
    return new JsonPathMatcher(this.matchers.concat([value === undefined ? AnyIndexMatcher : matcher]));
  }

  key(value: string | Array<string> = undefined): IJsonPathMatcher {
    const matcher: IMatcher<string | number> = isArray(value)
      ? new OrMatcher(value.map(v => new KeyMatcher(v)))
      : new KeyMatcher(value);
    return new JsonPathMatcher(this.matchers.concat([value === undefined ? AnyKeyMatcher : matcher]));
  }

  any(): IJsonPathMatcher {
    return new JsonPathMatcher(this.matchers.concat([AnyMatcher]));
  }

  matches(segments: Array<string | number>): boolean {
    if (segments.length !== this.matchers.length) {
      return false;
    }

    for (let i = 0; i < this.matchers.length; ++i) {
      if (!this.matchers[i].matches(segments[i])) {
        return false;
      }
    }

    return true;
  }
}

class PathRequestMatcher implements IMatcher<IRequest> {
  constructor(private matcher: IMatcher<Array<string | number>>) { }

  matches(request: IRequest): boolean {
    return !!request.segments && this.matcher.matches(request.segments);
  }
}

const KeyRequestMatcher: IMatcher<IRequest> = {
  matches(request: IRequest): boolean {
    return request.isKeyPosition;
  }
}

const ValueRequestMatcher: IMatcher<IRequest> = {
  matches(request: IRequest): boolean {
    return request.isValuePosition;
  }
}

class RequestMatcher implements IRequestMatcher {
  constructor(private matchers: Array<IMatcher<IRequest>> = []) { }

  path(matcher: IMatcher<Array<string | number>>): IRequestMatcher {
    return new RequestMatcher(this.matchers.concat([new PathRequestMatcher(matcher)]));
  }

  value(): IRequestMatcher {
    return new RequestMatcher(this.matchers.concat([ValueRequestMatcher]));
  }

  key(): IRequestMatcher {
    return new RequestMatcher(this.matchers.concat([KeyRequestMatcher]));
  }

  matches(request: IRequest): boolean {
    return this.matchers.every(matcher => matcher.matches(request));
  }
}

abstract class CompositeMatcher<T> implements IMatcher<T> {
  constructor(protected matchers: Array<IMatcher<T>> = []) { }

  append(matcher: IMatcher<T>): ICompositeMatcher<T> {
    return this.createCompositeMatcher(this.matchers.concat([matcher]));
  }

  prepend(matcher: IMatcher<T>): ICompositeMatcher<T> {
    return this.createCompositeMatcher([matcher].concat(this.matchers));
  }

  abstract createCompositeMatcher(matchers: Array<IMatcher<T>>): ICompositeMatcher<T>;
  abstract matches(input: T): boolean;
}


class AndMatcher<T> extends CompositeMatcher<T> {
  constructor(matchers: Array<IMatcher<T>> = []) {
    super(matchers);
  }

  createCompositeMatcher(matchers: Array<IMatcher<T>>): ICompositeMatcher<T> {
    return new AndMatcher(matchers);
  }

  matches(input: T): boolean {
    return this.matchers.every(matcher => matcher.matches(input));
  }
}

class OrMatcher<T> extends CompositeMatcher<T> {
  constructor(matchers: Array<IMatcher<T>> = []) {
    super(matchers);
  }

  createCompositeMatcher(matchers: Array<IMatcher<T>>): ICompositeMatcher<T> {
    return new OrMatcher(matchers);
  }

  matches(input: T): boolean {
    return this.matchers.some(matcher => matcher.matches(input));
  }
}

export function path() {
  return new JsonPathMatcher();
}

export function request() {
  return new RequestMatcher();
}

export function and<T>(...matchers: Array<IMatcher<T>>): ICompositeMatcher<T> {
  return new AndMatcher(matchers);
}

export function or<T>(...matchers: Array<IMatcher<T>>): ICompositeMatcher<T> {
  return new OrMatcher(matchers);
}
