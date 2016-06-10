"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils_1 = require('../../utils');
var lodash_1 = require('lodash');

var CompoundProposalProvider = function () {
    function CompoundProposalProvider() {
        _classCallCheck(this, CompoundProposalProvider);

        this.providers = [];
    }

    _createClass(CompoundProposalProvider, [{
        key: 'addProvider',
        value: function addProvider(provider) {
            this.addProviders([provider]);
        }
    }, {
        key: 'addProviders',
        value: function addProviders(providers) {
            this.providers = this.providers.concat(providers);
        }
    }, {
        key: 'hasProposals',
        value: function hasProposals(file) {
            return this.providers.some(function (provider) {
                return utils_1.matches(file, provider.getFilePattern());
            });
        }
    }, {
        key: 'getProposals',
        value: function getProposals(request) {
            var file = request.editor.buffer.file;
            return Promise.all(this.providers.filter(function (provider) {
                return utils_1.matches(file, provider.getFilePattern());
            }).map(function (provider) {
                return provider.getProposals(request);
            })).then(function (results) {
                return lodash_1.flatten(results);
            });
        }
    }, {
        key: 'getFilePattern',
        value: function getFilePattern() {
            return undefined;
        }
    }]);

    return CompoundProposalProvider;
}();

exports.CompoundProposalProvider = CompoundProposalProvider;