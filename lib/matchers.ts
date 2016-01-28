import {isNumber, isString, isArray} from 'lodash';
import {IRequest} from './provider-api';

export interface IMatcher<T> {
  matches(segment: T): boolean;
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

class IndexMatcher implements IMatcher<string | number> {
  constructor(private index: number | Array<number>) { }

  matches(segment: string | number): boolean {
    if (!isNumber(segment)) {
      return false;
    }
    return (isArray(this.index) ? <Array<number>>this.index : [<number>this.index]).some(key => key === segment);
  }
}

class KeyMatcher implements IMatcher<string | number> {
  constructor(private key: string | Array<string>) { }

  matches(segment: string | number): boolean {
    if (!isString(segment)) {
      return false;
    }
    return (isArray(this.key) ? <Array<string>>this.key : [<string>this.key]).some(key => key === segment);
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
    return new JsonPathMatcher(this.matchers.concat([value === undefined ? AnyIndexMatcher : new IndexMatcher(value)]));
  }

  key(value: string | Array<string> = undefined): IJsonPathMatcher {
    return new JsonPathMatcher(this.matchers.concat([value === undefined ? AnyKeyMatcher : new KeyMatcher(value)]));
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

export function path() {
  return new JsonPathMatcher();
}

export function request() {
  return new RequestMatcher();
}
