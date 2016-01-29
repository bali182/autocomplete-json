var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var file_proposal_provider_1 = require('../../file-proposal-provider');
var matchers_1 = require('../../matchers');
var MATCHER = matchers_1.or(matchers_1.request().value().path(matchers_1.path().key('files').index()), matchers_1.request().value().path(matchers_1.path().key('man').index()), matchers_1.request().value().path(matchers_1.path().key('man')), matchers_1.request().value().path(matchers_1.path().key('directories').key()));
var PackageJsonConfigFileProposalProvider = (function (_super) {
    __extends(PackageJsonConfigFileProposalProvider, _super);
    function PackageJsonConfigFileProposalProvider() {
        _super.apply(this, arguments);
    }
    PackageJsonConfigFileProposalProvider.prototype.getFilePattern = function () {
        return 'package.json';
    };
    PackageJsonConfigFileProposalProvider.prototype.getMatcher = function () {
        return MATCHER;
    };
    return PackageJsonConfigFileProposalProvider;
})(file_proposal_provider_1.FileProposalProvider);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PackageJsonConfigFileProposalProvider;
