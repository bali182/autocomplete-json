"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var lodash_1 = require('lodash');

var IndexMatcher = function () {
    function IndexMatcher(index) {
        _classCallCheck(this, IndexMatcher);

        this.index = index;
    }

    _createClass(IndexMatcher, [{
        key: "matches",
        value: function matches(segment) {
            return lodash_1.isNumber(segment) && this.index === segment;
        }
    }]);

    return IndexMatcher;
}();

var KeyMatcher = function () {
    function KeyMatcher(key) {
        _classCallCheck(this, KeyMatcher);

        this.key = key;
    }

    _createClass(KeyMatcher, [{
        key: "matches",
        value: function matches(segment) {
            return lodash_1.isString(segment) && this.key === segment;
        }
    }]);

    return KeyMatcher;
}();

var AnyIndexMatcher = {
    matches: function matches(segment) {
        return lodash_1.isNumber(segment);
    }
};
var AnyKeyMatcher = {
    matches: function matches(segment) {
        return lodash_1.isString(segment);
    }
};
var AnyMatcher = {
    matches: function matches(segment) {
        return true;
    }
};

var JsonPathMatcher = function () {
    function JsonPathMatcher() {
        var matchers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        _classCallCheck(this, JsonPathMatcher);

        this.matchers = matchers;
    }

    _createClass(JsonPathMatcher, [{
        key: "index",
        value: function index() {
            var value = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

            var matcher = void 0;
            if (value === undefined) {
                matcher = AnyIndexMatcher;
            } else {
                matcher = lodash_1.isArray(value) ? new OrMatcher(value.map(function (v) {
                    return new IndexMatcher(v);
                })) : new IndexMatcher(value);
            }
            return new JsonPathMatcher(this.matchers.concat([matcher]));
        }
    }, {
        key: "key",
        value: function key() {
            var value = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

            var matcher = void 0;
            if (value === undefined) {
                matcher = AnyKeyMatcher;
            } else {
                matcher = lodash_1.isArray(value) ? new OrMatcher(value.map(function (v) {
                    return new KeyMatcher(v);
                })) : new KeyMatcher(value);
            }
            return new JsonPathMatcher(this.matchers.concat([matcher]));
        }
    }, {
        key: "any",
        value: function any() {
            return new JsonPathMatcher(this.matchers.concat([AnyMatcher]));
        }
    }, {
        key: "matches",
        value: function matches(segments) {
            if (segments.length !== this.matchers.length) {
                return false;
            }
            for (var i = 0; i < this.matchers.length; ++i) {
                if (!this.matchers[i].matches(segments[i])) {
                    return false;
                }
            }
            return true;
        }
    }]);

    return JsonPathMatcher;
}();

var PathRequestMatcher = function () {
    function PathRequestMatcher(matcher) {
        _classCallCheck(this, PathRequestMatcher);

        this.matcher = matcher;
    }

    _createClass(PathRequestMatcher, [{
        key: "matches",
        value: function matches(request) {
            return !!request.segments && this.matcher.matches(request.segments);
        }
    }]);

    return PathRequestMatcher;
}();

var KeyRequestMatcher = {
    matches: function matches(request) {
        return request.isKeyPosition;
    }
};
var ValueRequestMatcher = {
    matches: function matches(request) {
        return request.isValuePosition;
    }
};

var RequestMatcher = function () {
    function RequestMatcher() {
        var matchers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        _classCallCheck(this, RequestMatcher);

        this.matchers = matchers;
    }

    _createClass(RequestMatcher, [{
        key: "path",
        value: function path(matcher) {
            return new RequestMatcher(this.matchers.concat([new PathRequestMatcher(matcher)]));
        }
    }, {
        key: "value",
        value: function value() {
            return new RequestMatcher(this.matchers.concat([ValueRequestMatcher]));
        }
    }, {
        key: "key",
        value: function key() {
            return new RequestMatcher(this.matchers.concat([KeyRequestMatcher]));
        }
    }, {
        key: "matches",
        value: function matches(request) {
            return this.matchers.every(function (matcher) {
                return matcher.matches(request);
            });
        }
    }]);

    return RequestMatcher;
}();

var CompositeMatcher = function () {
    function CompositeMatcher() {
        var matchers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        _classCallCheck(this, CompositeMatcher);

        this.matchers = matchers;
    }

    _createClass(CompositeMatcher, [{
        key: "append",
        value: function append(matcher) {
            return this.createCompositeMatcher(this.matchers.concat([matcher]));
        }
    }, {
        key: "prepend",
        value: function prepend(matcher) {
            return this.createCompositeMatcher([matcher].concat(this.matchers));
        }
    }]);

    return CompositeMatcher;
}();

var AndMatcher = function (_CompositeMatcher) {
    _inherits(AndMatcher, _CompositeMatcher);

    function AndMatcher() {
        var matchers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        _classCallCheck(this, AndMatcher);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(AndMatcher).call(this, matchers));
    }

    _createClass(AndMatcher, [{
        key: "createCompositeMatcher",
        value: function createCompositeMatcher(matchers) {
            return new AndMatcher(matchers);
        }
    }, {
        key: "matches",
        value: function matches(input) {
            return this.matchers.every(function (matcher) {
                return matcher.matches(input);
            });
        }
    }]);

    return AndMatcher;
}(CompositeMatcher);

var OrMatcher = function (_CompositeMatcher2) {
    _inherits(OrMatcher, _CompositeMatcher2);

    function OrMatcher() {
        var matchers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        _classCallCheck(this, OrMatcher);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(OrMatcher).call(this, matchers));
    }

    _createClass(OrMatcher, [{
        key: "createCompositeMatcher",
        value: function createCompositeMatcher(matchers) {
            return new OrMatcher(matchers);
        }
    }, {
        key: "matches",
        value: function matches(input) {
            return this.matchers.some(function (matcher) {
                return matcher.matches(input);
            });
        }
    }]);

    return OrMatcher;
}(CompositeMatcher);

function path() {
    return new JsonPathMatcher();
}
exports.path = path;
function request() {
    return new RequestMatcher();
}
exports.request = request;
function and() {
    for (var _len = arguments.length, matchers = Array(_len), _key = 0; _key < _len; _key++) {
        matchers[_key] = arguments[_key];
    }

    return new AndMatcher(matchers);
}
exports.and = and;
function or() {
    for (var _len2 = arguments.length, matchers = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        matchers[_key2] = arguments[_key2];
    }

    return new OrMatcher(matchers);
}
exports.or = or;