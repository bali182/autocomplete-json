var lodash_1 = require('lodash');
var IndexMatcher = (function () {
    function IndexMatcher(index) {
        this.index = index;
    }
    IndexMatcher.prototype.matches = function (segment) {
        if (!lodash_1.isNumber(segment)) {
            return false;
        }
        return (lodash_1.isArray(this.index) ? this.index : [this.index]).some(function (key) { return key === segment; });
    };
    return IndexMatcher;
})();
var KeyMatcher = (function () {
    function KeyMatcher(key) {
        this.key = key;
    }
    KeyMatcher.prototype.matches = function (segment) {
        if (!lodash_1.isString(segment)) {
            return false;
        }
        return (lodash_1.isArray(this.key) ? this.key : [this.key]).some(function (key) { return key === segment; });
    };
    return KeyMatcher;
})();
var AnyIndexMatcher = {
    matches: function (segment) {
        return lodash_1.isNumber(segment);
    }
};
var AnyKeyMatcher = {
    matches: function (segment) {
        return lodash_1.isString(segment);
    }
};
var AnyMatcher = {
    matches: function (segment) {
        return true;
    }
};
var JsonPathMatcher = (function () {
    function JsonPathMatcher(matchers) {
        if (matchers === void 0) { matchers = []; }
        this.matchers = matchers;
    }
    JsonPathMatcher.prototype.index = function (value) {
        if (value === void 0) { value = undefined; }
        return new JsonPathMatcher(this.matchers.concat([value === undefined ? AnyIndexMatcher : new IndexMatcher(value)]));
    };
    JsonPathMatcher.prototype.key = function (value) {
        if (value === void 0) { value = undefined; }
        return new JsonPathMatcher(this.matchers.concat([value === undefined ? AnyKeyMatcher : new KeyMatcher(value)]));
    };
    JsonPathMatcher.prototype.any = function () {
        return new JsonPathMatcher(this.matchers.concat([AnyMatcher]));
    };
    JsonPathMatcher.prototype.matches = function (segments) {
        if (segments.length !== this.matchers.length) {
            return false;
        }
        for (var i = 0; i < this.matchers.length; ++i) {
            if (!this.matchers[i].matches(segments[i])) {
                return false;
            }
        }
        return true;
    };
    return JsonPathMatcher;
})();
var PathRequestMatcher = (function () {
    function PathRequestMatcher(matcher) {
        this.matcher = matcher;
    }
    PathRequestMatcher.prototype.matches = function (request) {
        return !!request.segments && this.matcher.matches(request.segments);
    };
    return PathRequestMatcher;
})();
var KeyRequestMatcher = {
    matches: function (request) {
        return request.isKeyPosition;
    }
};
var ValueRequestMatcher = {
    matches: function (request) {
        return request.isValuePosition;
    }
};
var RequestMatcher = (function () {
    function RequestMatcher(matchers) {
        if (matchers === void 0) { matchers = []; }
        this.matchers = matchers;
    }
    RequestMatcher.prototype.path = function (matcher) {
        return new RequestMatcher(this.matchers.concat([new PathRequestMatcher(matcher)]));
    };
    RequestMatcher.prototype.value = function () {
        return new RequestMatcher(this.matchers.concat([ValueRequestMatcher]));
    };
    RequestMatcher.prototype.key = function () {
        return new RequestMatcher(this.matchers.concat([KeyRequestMatcher]));
    };
    RequestMatcher.prototype.matches = function (request) {
        return this.matchers.every(function (matcher) { return matcher.matches(request); });
    };
    return RequestMatcher;
})();
function path() {
    return new JsonPathMatcher();
}
exports.path = path;
function request() {
    return new RequestMatcher();
}
exports.request = request;
