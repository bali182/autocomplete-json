var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lodash_1 = require('lodash');
var IndexMatcher = (function () {
    function IndexMatcher(index) {
        this.index = index;
    }
    IndexMatcher.prototype.matches = function (segment) {
        return lodash_1.isNumber(segment) && this.index === segment;
    };
    return IndexMatcher;
})();
var KeyMatcher = (function () {
    function KeyMatcher(key) {
        this.key = key;
    }
    KeyMatcher.prototype.matches = function (segment) {
        return lodash_1.isString(segment) && this.key === segment;
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
        var matcher;
        if (value === undefined) {
            matcher = AnyIndexMatcher;
        }
        else {
            matcher = lodash_1.isArray(value)
                ? new OrMatcher(value.map(function (v) { return new IndexMatcher(v); }))
                : new IndexMatcher(value);
        }
        return new JsonPathMatcher(this.matchers.concat([matcher]));
    };
    JsonPathMatcher.prototype.key = function (value) {
        if (value === void 0) { value = undefined; }
        var matcher;
        if (value === undefined) {
            matcher = AnyKeyMatcher;
        }
        else {
            matcher = lodash_1.isArray(value)
                ? new OrMatcher(value.map(function (v) { return new KeyMatcher(v); }))
                : new KeyMatcher(value);
        }
        return new JsonPathMatcher(this.matchers.concat([matcher]));
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
var CompositeMatcher = (function () {
    function CompositeMatcher(matchers) {
        if (matchers === void 0) { matchers = []; }
        this.matchers = matchers;
    }
    CompositeMatcher.prototype.append = function (matcher) {
        return this.createCompositeMatcher(this.matchers.concat([matcher]));
    };
    CompositeMatcher.prototype.prepend = function (matcher) {
        return this.createCompositeMatcher([matcher].concat(this.matchers));
    };
    return CompositeMatcher;
})();
var AndMatcher = (function (_super) {
    __extends(AndMatcher, _super);
    function AndMatcher(matchers) {
        if (matchers === void 0) { matchers = []; }
        _super.call(this, matchers);
    }
    AndMatcher.prototype.createCompositeMatcher = function (matchers) {
        return new AndMatcher(matchers);
    };
    AndMatcher.prototype.matches = function (input) {
        return this.matchers.every(function (matcher) { return matcher.matches(input); });
    };
    return AndMatcher;
})(CompositeMatcher);
var OrMatcher = (function (_super) {
    __extends(OrMatcher, _super);
    function OrMatcher(matchers) {
        if (matchers === void 0) { matchers = []; }
        _super.call(this, matchers);
    }
    OrMatcher.prototype.createCompositeMatcher = function (matchers) {
        return new OrMatcher(matchers);
    };
    OrMatcher.prototype.matches = function (input) {
        return this.matchers.some(function (matcher) { return matcher.matches(input); });
    };
    return OrMatcher;
})(CompositeMatcher);
function path() {
    return new JsonPathMatcher();
}
exports.path = path;
function request() {
    return new RequestMatcher();
}
exports.request = request;
function and() {
    var matchers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        matchers[_i - 0] = arguments[_i];
    }
    return new AndMatcher(matchers);
}
exports.and = and;
function or() {
    var matchers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        matchers[_i - 0] = arguments[_i];
    }
    return new OrMatcher(matchers);
}
exports.or = or;
